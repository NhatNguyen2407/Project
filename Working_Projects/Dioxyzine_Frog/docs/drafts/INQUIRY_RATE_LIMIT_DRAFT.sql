-- DRAFT ONLY — NOT AN APPLIED MIGRATION. No production/staging SQL was run.
-- Scope: bounded, atomic, database-backed *global* limits for submit-inquiry.
-- Validate on a disposable local database and reconcile migration history
-- before converting this reviewed draft to a numbered migration.
--
-- Why not per-IP? Forwarding headers have not been proven gateway-controlled;
-- trusting a client-spoofable IP would not enforce a meaningful quota.
--
-- Expected call path: Edge Function -> server-only service_role client -> RPC.
-- No public/anon/authenticated caller is authorized to execute this function.

begin;

create schema if not exists inquiry_internal;
revoke all on schema inquiry_internal from public, anon, authenticated;
grant usage on schema inquiry_internal to service_role;

create table if not exists inquiry_internal.request_budgets (
  scope text primary key
    check (scope in ('inquiry-preverify', 'inquiry-accepted', 'upload-preverify', 'upload-issued')),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0)
);

alter table inquiry_internal.request_budgets enable row level security;
revoke all on inquiry_internal.request_budgets from public, anon, authenticated;
grant select, insert, update on inquiry_internal.request_budgets to service_role;

-- SECURITY INVOKER runs as service_role; RLS remains enabled.
-- The unique primary key makes concurrent upserts serialize per scope.
-- Four durable rows suffice: no cron job, unbounded key growth, or IP storage.
create or replace function public.consume_inquiry_rate_budget(
  p_scope text,
  p_max_hits integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_count integer;
begin
  if p_scope is null
     or p_scope not in ('inquiry-preverify', 'inquiry-accepted', 'upload-preverify', 'upload-issued')
     or p_max_hits is null
     or p_max_hits not between 1 and 1000
     or p_window_seconds is null
     or p_window_seconds not between 30 and 86400
  then
    raise exception 'Invalid rate limit parameters' using errcode = '22023';
  end if;

  insert into inquiry_internal.request_budgets as budget (
    scope, window_started_at, request_count
  ) values (
    p_scope, pg_catalog.statement_timestamp(), 1
  )
  on conflict (scope) do update
  set
    window_started_at = case
      when budget.window_started_at
           <= excluded.window_started_at
              - pg_catalog.make_interval(secs => p_window_seconds)
      then excluded.window_started_at
      else budget.window_started_at
    end,
    request_count = case
      when budget.window_started_at
           <= excluded.window_started_at
              - pg_catalog.make_interval(secs => p_window_seconds)
      then 1
      else budget.request_count + 1
    end
  where
    budget.window_started_at
      <= excluded.window_started_at
         - pg_catalog.make_interval(secs => p_window_seconds)
    or budget.request_count < p_max_hits
  returning request_count into v_count;

  return v_count is not null;
end;
$function$;

-- Postgres normally grants EXECUTE to PUBLIC for new functions.
revoke execute on function public.consume_inquiry_rate_budget(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_inquiry_rate_budget(text, integer, integer)
  to service_role;

commit;

-- REQUIRED isolated test gates before applying to any real environment:
-- 1. SELECT has_function_privilege('anon', ... 'EXECUTE') = false,
--    and same for 'authenticated'; service_role must return true.
-- 2. SELECT has_table_privilege('anon', ... 'INSERT') = false,
--    likewise for 'authenticated'; service_role must return true.
-- 3. Concurrent attempts for same scope never exceed p_max_hits.
-- 4. Window expiry resets budget; different scopes have separate limits.
-- 5. Missing function/grant/db errors cause Edge Function to fail closed.
-- 6. Backend cutover must still revoke public INSERT on public.inquiries.
