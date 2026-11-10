-- Synthetic fixtures only. Every write is rolled back; no email, upload or external integration is invoked.
begin;

do $$
begin
  if exists (select 1 from public.inquiries where id::text like 'eda00000-0000-4000-8000-%'
    or customer_email = 'fixture-inquiry@example.invalid') then
    raise exception 'Reserved Inquiry fixtures already exist; stop without changing them';
  end if;
end;
$$;

set local role anon;
do $$
begin
  begin
    insert into public.inquiries (subject, customer_name, customer_email, contact_info, product_name, quantity, image_link)
      values ('Fixture', 'Fixture', 'fixture-inquiry@example.invalid', 'Fixture', 'Fixture', 1, 'https://example.invalid/design.png');
    raise exception 'Anonymous direct insert was allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.save_verified_inquiry('eda00000-0000-4000-8000-000000000001', null, '{}'::jsonb);
    raise exception 'Anonymous trusted RPC execution was allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

set local role authenticated;
do $$
begin
  begin
    insert into public.inquiries (subject, customer_name, customer_email, contact_info, product_name, quantity, image_link)
      values ('Fixture', 'Fixture', 'fixture-inquiry@example.invalid', 'Fixture', 'Fixture', 1, 'https://example.invalid/design.png');
    raise exception 'Authenticated direct insert was allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.save_verified_inquiry('eda00000-0000-4000-8000-000000000001', null, '{}'::jsonb);
    raise exception 'Authenticated trusted RPC execution was allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

set local role service_role;
do $$
declare
  payload jsonb := jsonb_build_object('subject', 'Fixture quote', 'customer_name', 'Fixture customer',
    'customer_email', 'fixture-inquiry@example.invalid', 'contact_info', 'Fixture contact',
    'product_name', 'Fixture plushie', 'size', '10', 'quantity', 1, 'accessory_qty', 0,
    'image_link', 'https://res.cloudinary.com/fixture/image/upload/design.png', 'note', null);
  saved uuid;
  fixture_id uuid := 'eda00000-0000-4000-8000-000000000001';
begin
  saved := public.save_verified_inquiry(fixture_id, null, payload);
  if saved <> fixture_id or public.save_verified_inquiry(fixture_id, null, payload) <> fixture_id then
    raise exception 'Saved/retried ID differs';
  end if;
  if (select count(*) from public.inquiries where id = fixture_id and quantity = 1 and accessory_qty = 0 and user_id is null) <> 1 then
    raise exception 'Retry duplicated or altered the inquiry';
  end if;
  begin
    perform public.save_verified_inquiry(fixture_id, null, payload || '{"quantity":2}'::jsonb);
    raise exception 'A conflicting retry overwrote the existing inquiry';
  exception when unique_violation then null;
  end;
  for counter in 2..5 loop
    perform public.save_verified_inquiry(('eda00000-0000-4000-8000-' || lpad(counter::text, 12, '0'))::uuid, null, payload);
  end loop;
  begin
    perform public.save_verified_inquiry('eda00000-0000-4000-8000-000000000006', null,
      payload || '{"customer_email":" FIXTURE-INQUIRY@EXAMPLE.INVALID "}'::jsonb);
    raise exception 'The email rate limit was bypassed';
  exception when raise_exception then
    if sqlerrm <> 'inquiry_rate_limited' then raise; end if;
  end;
  -- A confirmed retry must still work after the quota is exhausted.
  perform public.save_verified_inquiry(fixture_id, null, payload);
  begin
    perform public.save_verified_inquiry('eda00000-0000-4000-8000-000000000007', null,
      payload || '{"status":"Completed"}'::jsonb);
    raise exception 'A privileged customer field was accepted';
  exception when invalid_parameter_value then null;
  end;
end;
$$;
reset role;

rollback;
select 'PASS: direct writes/RPC denied to clients; trusted insert, retry, conflict and quota verified; fixtures rolled back' as verification;
