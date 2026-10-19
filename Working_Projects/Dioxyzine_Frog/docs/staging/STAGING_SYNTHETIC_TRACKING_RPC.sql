-- STAGING ONLY. Do not apply to Production.
-- Implements the same five-field paid-order RPC contract as the committed
-- supabase/migrations/202610130002_order_tracking_rpc_shape.sql, while adding
-- a strict synthetic-data constraint specific to this staging environment.
-- The RPC is intentionally public: the unguessable UUID is the lookup token.
-- No email, address, payment ID or amount is returned. Not a substitute for
-- rate limiting / browser security review before Production sign-off.
begin;

do $preflight$
begin
  if to_regclass('public.orders') is null
    or to_regclass('public.products') is null
    or to_regclass('public.inquiries') is null then
    raise exception 'Staging synthetic schema missing; refusing RPC migration';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.orders'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%synthetic%'
  ) or not exists (
    select 1 from public.products
    where id = 'STG-SAMPLE-PLUSH'
  ) or not exists (
    select 1 from public.orders
    where id = '35b7b99d-0aa5-4ea7-b251-f08cc3a73a51'::uuid
      and customer_email = 'synthetic@example.invalid'
      and payment_method = 'synthetic'
  ) then
    raise exception 'Not the expected synthetic Staging database; refusing RPC migration';
  end if;

  if exists (
    select 1 from public.orders
    where payment_method <> 'synthetic'
       or customer_email not like '%@example.invalid'
  ) or has_table_privilege('anon','public.orders','SELECT')
    or has_table_privilege('authenticated','public.orders','SELECT') then
    raise exception 'Unexpected orders or direct-table grants; refusing RPC migration';
  end if;

  if to_regprocedure('public.track_order_status(uuid)') is not null then
    raise exception 'Tracking RPC already exists; review before replacement';
  end if;
end
$preflight$;

-- Negative test row: never a PayPal payment or a genuine customer.
insert into public.orders (
  id, customer_name, customer_email, total_amount, payment_method,
  payment_status, transaction_id, order_status, cart_items
) values (
  '35b7b99d-0aa5-4ea7-b251-f08cc3a73a52',
  'Synthetic Unpaid Customer', 'unpaid@example.invalid', 15.00,
  'synthetic', 'pending', 'STG-UNPAID-NOT-A-TRANSACTION', 'pending',
  '[{"id":"STG-SAMPLE-PLUSH","title":"Unpaid Synthetic Item","qty":1}]'::jsonb
);

create function public.track_order_status(search_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $function$
  select jsonb_build_object(
    'id', o.id,
    'product_name', coalesce(
      o.cart_items->0->>'title',
      o.cart_items->0->>'name',
      o.cart_items->0->>'id',
      'Custom Merchandise'
    ),
    'order_status', o.order_status,
    'tracking_code', o.tracking_code,
    'created_at', o.created_at
  )
  from public.orders o
  where o.id = search_id
    and lower(coalesce(o.payment_status, '')) = 'paid'
    and o.payment_method = 'synthetic'
    and o.customer_email like '%@example.invalid'
  limit 1;
$function$;

revoke execute on function public.track_order_status(uuid)
  from public, anon, authenticated;
grant execute on function public.track_order_status(uuid) to anon, authenticated;

commit;

-- Release gates:
-- - Auth/Admin policies remain default-deny.
-- - Never deploy create-/capture-paypal-order here without isolated Sandbox credentials.
-- - SECURITY DEFINER is necessary for narrowly scoped guest lookup while orders
--   are private; Supabase advisor may flag its intentional guest EXECUTE privilege.
-- - Before final acceptance, exercise real HTTP RPC with a Staging publishable key,
--   rate-limiting policy and role access; do not expose any secret/service key.
