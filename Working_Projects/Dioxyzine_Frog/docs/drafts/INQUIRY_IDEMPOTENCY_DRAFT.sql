-- DRAFT ONLY; execute ONLY in the disposable GitHub Actions PostgreSQL container.
-- A service_role-only idempotent write transaction; no production schema change.
begin;
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
commit;
