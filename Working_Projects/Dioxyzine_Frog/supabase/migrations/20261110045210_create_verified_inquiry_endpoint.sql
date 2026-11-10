begin;

create index if not exists inquiries_submission_email_created_idx
  on public.inquiries (lower(btrim(customer_email)), created_at);
create index if not exists inquiries_submission_user_created_idx
  on public.inquiries (user_id, created_at);

-- Only the CAPTCHA-verifying Edge Function can call this invoker-rights RPC.
create or replace function public.save_verified_inquiry(
  p_submission_id uuid, p_user_id uuid, p_payload jsonb
) returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare
  existing public.inquiries%rowtype;
  email_key text := lower(btrim(p_payload ->> 'customer_email'));
begin
  if p_submission_id is null or jsonb_typeof(p_payload) is distinct from 'object'
    or email_key is null or email_key = ''
    or not (p_payload ?& array['subject', 'customer_name', 'customer_email', 'contact_info',
      'product_name', 'size', 'quantity', 'accessory_qty', 'image_link', 'note'])
    or p_payload - array['subject', 'customer_name', 'customer_email', 'contact_info',
      'product_name', 'size', 'quantity', 'accessory_qty', 'image_link', 'note'] <> '{}'::jsonb then
    raise exception 'invalid_inquiry_payload' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('inquiry-id:' || p_submission_id::text, 0));
  select * into existing from public.inquiries where id = p_submission_id;
  if found then
    if existing.user_id is not distinct from p_user_id and to_jsonb(existing) @> p_payload then
      return existing.id;
    end if;
    raise exception 'inquiry_submission_conflict' using errcode = '23505';
  end if;

  if p_user_id is not null then
    perform pg_advisory_xact_lock(hashtextextended('inquiry-user:' || p_user_id::text, 0));
  end if;
  perform pg_advisory_xact_lock(hashtextextended('inquiry-email:' || email_key, 0));
  -- shortcut: limits are per email/account, not IP; add gateway limits if bot volume warrants them.
  if (select count(*) from public.inquiries
    where created_at >= now() - interval '15 minutes'
      and (lower(btrim(customer_email)) = email_key
        or (p_user_id is not null and user_id = p_user_id))) >= 5 then
    raise exception 'inquiry_rate_limited' using errcode = 'P0001';
  end if;

  insert into public.inquiries (id, user_id, subject, customer_name, customer_email, contact_info,
    product_name, size, quantity, accessory_qty, image_link, note)
  values (p_submission_id, p_user_id, p_payload ->> 'subject', p_payload ->> 'customer_name',
    p_payload ->> 'customer_email', p_payload ->> 'contact_info', p_payload ->> 'product_name',
    p_payload ->> 'size', (p_payload ->> 'quantity')::integer, (p_payload ->> 'accessory_qty')::integer,
    p_payload ->> 'image_link', p_payload ->> 'note');
  return p_submission_id;
end;
$$;

revoke all on function public.save_verified_inquiry(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.save_verified_inquiry(uuid, uuid, jsonb) to service_role;

commit;
