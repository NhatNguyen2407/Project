-- REVIEW-ONLY DRAFT. DO NOT APPLY ON STAGING OR PRODUCTION.
-- Run after INQUIRY_IDEMPOTENCY_DRAFT.sql only in a disposable isolated DB
-- with synthetic storage.buckets, storage.objects and public.inquiries.
-- Supabase Storage remains private; there are NO anon object policies.
begin;
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
commit;

-- This is NOT a content scanner. Signed tokens may be valid up to 2 hours.
-- Cross-account abuse, orphan cleanup, synthetic RLS tests, metadata race
-- behavior, admin signed-view UI and guest frontend integration remain gates.
