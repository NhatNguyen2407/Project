-- STAGING ONLY. Apply ONLY using project bvnnmvlfcduwmneipmsi.
-- Three reviewed backend SQL contracts in one atomic transaction.
-- No Production or customer data is involved.
begin;
DO $guard$
BEGIN
  IF to_regclass('public.products') IS NULL OR
     to_regclass('public.orders') IS NULL OR
     to_regclass('public.inquiries') IS NULL OR
     to_regclass('storage.buckets') IS NULL OR
     to_regclass('storage.objects') IS NULL OR
     to_regclass('auth.users') IS NULL
  THEN RAISE EXCEPTION 'Expected synthetic Staging schema missing'; END IF;
  IF (SELECT count(*) FROM public.products WHERE id='STG-SAMPLE-PLUSH')<>1 OR
     (SELECT count(*) FROM public.orders WHERE customer_email='synthetic@example.invalid')<>1 OR
     (SELECT count(*) FROM public.inquiries)<>0 OR
     (SELECT count(*) FROM auth.users)<>0 OR
     (SELECT count(*) FROM storage.objects)<>0 OR
     (SELECT count(*) FROM storage.buckets)<>1 OR
     (SELECT count(*) FROM storage.buckets
      WHERE id='inquiry-test-references' AND public=false
        AND file_size_limit=5242880)<>1
  THEN RAISE EXCEPTION 'Synthetic-only Staging preflight failed'; END IF;
  IF to_regprocedure('public.create_verified_inquiry_idempotent(uuid,text,jsonb,uuid)') IS NOT NULL OR
     to_regclass('inquiry_internal.request_budgets') IS NOT NULL OR
     to_regclass('inquiry_internal.submission_keys') IS NOT NULL OR
     to_regclass('inquiry_internal.upload_tickets') IS NOT NULL OR
     to_regprocedure('public.create_inquiry_idempotent(uuid,text,jsonb,uuid)') IS NOT NULL OR
     to_regprocedure('public.register_inquiry_upload_ticket(text,text,integer)') IS NOT NULL OR
     to_regprocedure('public.consume_inquiry_rate_budget(text,integer,integer)') IS NOT NULL
  THEN RAISE EXCEPTION 'Migration already or partially applied'; END IF;
END
$guard$;

-- SECTION A: global rate budget RPC
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


-- REQUIRED isolated test gates before applying to any real environment:
-- 1. SELECT has_function_privilege('anon', ... 'EXECUTE') = false,
--    and same for 'authenticated'; service_role must return true.
-- 2. SELECT has_table_privilege('anon', ... 'INSERT') = false,
--    likewise for 'authenticated'; service_role must return true.
-- 3. Concurrent attempts for same scope never exceed p_max_hits.
-- 4. Window expiry resets budget; different scopes have separate limits.
-- 5. Missing function/grant/db errors cause Edge Function to fail closed.
-- 6. Backend cutover must still revoke public INSERT on public.inquiries.

-- SECTION B: idempotent Inquiry RPC
-- DRAFT ONLY; execute ONLY in the disposable GitHub Actions PostgreSQL container.
-- A service_role-only idempotent write transaction; no production schema change.

create schema if not exists inquiry_internal;
revoke all on schema inquiry_internal from public, anon, authenticated;
grant usage on schema inquiry_internal to service_role;

create table if not exists inquiry_internal.submission_keys (
  request_key uuid primary key,
  payload_sha256 text not null check (payload_sha256 ~ '^[a-f0-9]{64}$'),
  inquiry_id uuid not null unique,
  created_at timestamptz not null default now()
);
alter table inquiry_internal.submission_keys enable row level security;
revoke all on inquiry_internal.submission_keys from public, anon, authenticated;
grant select, insert on inquiry_internal.submission_keys to service_role;

-- Advisory transaction lock serializes the same idempotency key. The lock
-- is released on COMMIT/ROLLBACK. A DB exception rolls back both inserts.
-- service_role must have permissions for public.inquiries (its usual grants).
create or replace function public.create_inquiry_idempotent(
  p_key uuid, p_hash text, p_row jsonb, p_user_id uuid default null
) returns jsonb
language plpgsql security invoker set search_path = ''
as $fn$
declare
  existing inquiry_internal.submission_keys%rowtype;
  created uuid;
begin
  if p_key is null or p_hash is null or p_hash !~ '^[a-f0-9]{64}$'
     or jsonb_typeof(p_row) is distinct from 'object' then
    raise exception 'Invalid idempotency request' using errcode = '22023';
  end if;
  -- Unique key scope is global and never mixed between distinct customers.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_key::text, 7983));

  select * into existing from inquiry_internal.submission_keys where request_key = p_key;
  if found then
    if existing.payload_sha256 <> p_hash then
      raise exception 'Idempotency key reused with different content' using errcode = '23505';
    end if;
    return pg_catalog.jsonb_build_object('inquiryId',existing.inquiry_id,'replayed',true);
  end if;

  -- Explicit column allowlist: never insert workflow/payment/admin fields.
  insert into public.inquiries (
    subject, customer_name, customer_email, contact_info, product_name,
    size, quantity, accessory_qty, image_link, note, user_id
  ) values (
    p_row->>'subject',
    p_row->>'customer_name',
    p_row->>'customer_email',
    p_row->>'contact_info',
    p_row->>'product_name',
    p_row->>'size',
    (p_row->>'quantity')::integer,
    coalesce((p_row->>'accessory_qty')::integer,0),
    p_row->>'image_link',
    p_row->>'note',
    p_user_id
  ) returning id into created;

  insert into inquiry_internal.submission_keys(request_key,payload_sha256,inquiry_id)
  values(p_key,p_hash,created);
  return pg_catalog.jsonb_build_object('inquiryId',created,'replayed',false);
end;
$fn$;

revoke execute on function public.create_inquiry_idempotent(uuid,text,jsonb,uuid)
  from public, anon, authenticated;
grant execute on function public.create_inquiry_idempotent(uuid,text,jsonb,uuid)
  to service_role;

-- SECTION C: private upload ticket and atomic claim
-- REVIEW-ONLY DRAFT. DO NOT APPLY ON STAGING OR PRODUCTION.
-- Run after INQUIRY_IDEMPOTENCY_DRAFT.sql only in a disposable isolated DB
-- with synthetic storage.buckets, storage.objects and public.inquiries.
-- Supabase Storage remains private; there are NO anon object policies.

create schema if not exists inquiry_internal;
revoke all on schema inquiry_internal from public, anon, authenticated;
grant usage on schema inquiry_internal to service_role;

create table inquiry_internal.upload_tickets (
  object_path text primary key
    check (object_path ~* '^guest/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(png|jpg|webp)$'),
  mime_type text not null check (mime_type in ('image/png','image/jpeg','image/webp')),
  declared_bytes integer not null check (declared_bytes between 1 and 5242880),
  issued_at timestamptz not null default pg_catalog.now(),
  claimed_inquiry_id uuid unique references public.inquiries(id),
  verified_sha256 text check (verified_sha256 ~ '^[a-f0-9]{64}$'),
  verified_at timestamptz
);
alter table inquiry_internal.upload_tickets enable row level security;
revoke all on inquiry_internal.upload_tickets from public, anon, authenticated;
grant select, insert, update on inquiry_internal.upload_tickets to service_role;

create or replace function public.register_inquiry_upload_ticket(
  p_path text, p_mime_type text, p_declared_bytes integer
) returns boolean language plpgsql security invoker set search_path=''
as $fn$
begin
  if p_path is null or
     p_path !~* '^guest/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(png|jpg|webp)$'
     or p_mime_type is null or p_mime_type not in ('image/png','image/jpeg','image/webp')
     or p_declared_bytes is null or p_declared_bytes not between 1 and 5242880
     or not (
       (p_mime_type='image/png' and p_path ~* '\.png$') or
       (p_mime_type='image/jpeg' and p_path ~* '\.jpg$') or
       (p_mime_type='image/webp' and p_path ~* '\.webp$')
     )
     or not exists (
       select 1 from storage.buckets
       where id='inquiry-test-references' and public=false
     )
  then
    raise exception 'Invalid upload ticket' using errcode='22023';
  end if;
  insert into inquiry_internal.upload_tickets(object_path,mime_type,declared_bytes)
  values (p_path,p_mime_type,p_declared_bytes);
  return true;
end;
$fn$;
revoke execute on function public.register_inquiry_upload_ticket(text,text,integer)
  from public,anon,authenticated;
grant execute on function public.register_inquiry_upload_ticket(text,text,integer)
  to service_role;

-- Extension of the base idempotent transaction with an atomic upload claim.
create or replace function public.create_verified_inquiry_idempotent(
  p_key uuid, p_hash text, p_row jsonb, p_user_id uuid default null
) returns jsonb language plpgsql security invoker set search_path=''
as $fn$
declare
  existing inquiry_internal.submission_keys%rowtype;
  ticket inquiry_internal.upload_tickets%rowtype;
  created uuid;
  v_path text;
  v_meta jsonb;
  v_size text;
  v_etag text;
  v_proof jsonb;
begin
  if p_key is null or p_hash is null or p_hash !~ '^[a-f0-9]{64}$'
     or pg_catalog.jsonb_typeof(p_row) is distinct from 'object' then
    raise exception 'Invalid idempotency request' using errcode='22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_key::text,7983));
  select * into existing from inquiry_internal.submission_keys
  where request_key=p_key;
  if found then
    if existing.payload_sha256<>p_hash then
      raise exception 'Idempotency key reused with different content' using errcode='23505';
    end if;
    return pg_catalog.jsonb_build_object('inquiryId',existing.inquiry_id,'replayed',true);
  end if;

  if pg_catalog.left(p_row->>'image_link',10)='storage://' then
    if (p_row->>'image_link') !~*
       '^storage://inquiry-test-references/guest/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(png|jpg|webp)$' then
      raise exception 'Invalid private object reference' using errcode='22023';
    end if;
    v_path=pg_catalog.substr(
      p_row->>'image_link',pg_catalog.length('storage://inquiry-test-references/')+1);
    select * into ticket from inquiry_internal.upload_tickets
    where object_path=v_path for update;
    if not found or ticket.claimed_inquiry_id is not null
       or ticket.issued_at < pg_catalog.now()-interval '2 hours' then
      raise exception 'Missing, expired or used upload ticket' using errcode='22023';
    end if;

    select metadata into v_meta from storage.objects
    where bucket_id='inquiry-test-references' and name=v_path;
    v_size=v_meta->>'size';
    -- Compare canonical sizes as text: malformed/huge metadata must not
    -- overflow a cast. IS DISTINCT FROM rejects missing and JSON-null MIME.
    if v_size is distinct from ticket.declared_bytes::text
       or (v_meta->>'mimetype') is distinct from ticket.mime_type then
      raise exception 'Storage object not confirmed' using errcode='22023';
    end if;
    -- Only single-part objects with a content checksum are accepted. The
    -- server compares downloaded bytes against this value, then we recheck
    -- current metadata in the final transaction. Guest tokens cannot upsert.
    v_etag=pg_catalog.lower(pg_catalog.btrim(v_meta->>'eTag','"'));
    if v_etag is null or v_etag !~ '^[a-f0-9]{32}$' then
      raise exception 'Storage checksum unavailable' using errcode='22023';
    end if;
    v_proof=p_row->'_verified_image';
    if v_proof is null then
      -- No inquiry, key or claim is written by this verification challenge.
      return pg_catalog.jsonb_build_object('verificationRequired',pg_catalog.jsonb_build_object(
        'path',v_path,'mimeType',ticket.mime_type,'sizeBytes',ticket.declared_bytes,'etag',v_etag));
    end if;
    -- This is server attestation, not client-supplied evidence. Only
    -- service_role can call the RPC; the HTTP validator drops this field.
    if pg_catalog.jsonb_typeof(v_proof) is distinct from 'object'
       or (v_proof->>'etag') is distinct from v_etag
       or (v_proof->>'mimeType') is distinct from ticket.mime_type
       or (v_proof->>'sizeBytes') is distinct from v_size
       or coalesce(v_proof->>'sha256','') !~ '^[a-f0-9]{64}$'
       or coalesce(v_proof->>'width','') !~ '^[1-9][0-9]{0,3}$'
       or coalesce(v_proof->>'height','') !~ '^[1-9][0-9]{0,3}$' then
      raise exception 'Invalid image verification' using errcode='22023';
    end if;
    if (v_proof->>'width')::integer>2048 or (v_proof->>'height')::integer>2048 then
      raise exception 'Image dimensions exceed Staging limit' using errcode='22023';
    end if;
  else
    raise exception 'Verified submission requires private Storage reference' using errcode='22023';
  end if;

  insert into public.inquiries(
    subject,customer_name,customer_email,contact_info,product_name,
    size,quantity,accessory_qty,image_link,note,user_id
  ) values (
    p_row->>'subject',p_row->>'customer_name',p_row->>'customer_email',
    p_row->>'contact_info',p_row->>'product_name',p_row->>'size',
    (p_row->>'quantity')::integer,
    coalesce((p_row->>'accessory_qty')::integer,0),
    p_row->>'image_link',p_row->>'note',p_user_id
  ) returning id into created;

  if v_path is not null then
    update inquiry_internal.upload_tickets set claimed_inquiry_id=created,
      verified_sha256=v_proof->>'sha256',verified_at=pg_catalog.now()
    where object_path=v_path and claimed_inquiry_id is null;
    if not found then
      raise exception 'Already claimed' using errcode='22023';
    end if;
  end if;
  insert into inquiry_internal.submission_keys(request_key,payload_sha256,inquiry_id)
  values(p_key,p_hash,created);
  return pg_catalog.jsonb_build_object('inquiryId',created,'replayed',false);
end;
$fn$;
revoke execute on function public.create_verified_inquiry_idempotent(uuid,text,jsonb,uuid)
  from public,anon,authenticated;
grant execute on function public.create_verified_inquiry_idempotent(uuid,text,jsonb,uuid)
  to service_role;

-- This is NOT a content scanner. Signed tokens may be valid up to 2 hours.
-- Cross-account abuse, orphan cleanup, synthetic RLS tests, metadata race
-- behavior, admin signed-view UI and guest frontend integration remain gates.

DO $verified$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='inquiry_internal' AND c.relname='upload_tickets' AND c.relrowsecurity=true
  ) OR
     NOT has_function_privilege('service_role','public.register_inquiry_upload_ticket(text,text,integer)','EXECUTE') OR
     NOT has_function_privilege('service_role','public.create_verified_inquiry_idempotent(uuid,text,jsonb,uuid)','EXECUTE') OR
     NOT has_function_privilege('service_role','public.consume_inquiry_rate_budget(text,integer,integer)','EXECUTE') OR
     has_function_privilege('anon','public.register_inquiry_upload_ticket(text,text,integer)','EXECUTE') OR
     has_function_privilege('authenticated','public.create_verified_inquiry_idempotent(uuid,text,jsonb,uuid)','EXECUTE') OR
     has_function_privilege('anon','public.consume_inquiry_rate_budget(text,integer,integer)','EXECUTE')
  THEN RAISE EXCEPTION 'Backend RPC grants or RLS failed verification'; END IF;
END
$verified$;
commit;
