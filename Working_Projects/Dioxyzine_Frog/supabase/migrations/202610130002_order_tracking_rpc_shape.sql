-- Keep public order tracking working while returning only the fields the UI needs.
-- UUID remains the intentional tracking capability; payment status is not exposed.
begin;
drop function if exists public.track_order_status(uuid);
create function public.track_order_status(search_id uuid)
returns jsonb
language sql
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
  limit 1;
$function$;
revoke execute on function public.track_order_status(uuid) from public, anon, authenticated;
grant execute on function public.track_order_status(uuid) to anon, authenticated;
commit;
