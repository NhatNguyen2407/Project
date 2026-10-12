-- Dioxyzine Frog security hardening (2026-10)
-- Narrow client database grants and remove public write policies that bypass ownership/admin checks.
-- Public product/voucher reads, inquiry submission, and UUID-based order tracking remain supported.

begin;

-- 1) RLS does not protect TRUNCATE. Remove it, plus unnecessary object-level privileges,
-- from client roles across the exposed public schema.
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;

-- 2) Least-privilege table grants. RLS remains the row-level authorization layer.
-- Products: public reads; authenticated admins may manage rows through is_admin()-guarded policies.
revoke insert, update, delete on table public.products from anon;
grant select on table public.products to anon;
grant select, insert, update, delete on table public.products to authenticated;

-- Vouchers: public may read active vouchers only through RLS; only admins may mutate.
revoke insert, update, delete on table public.vouchers from anon;
grant select on table public.vouchers to anon;
grant select, insert, update, delete on table public.vouchers to authenticated;

-- Inquiries: anonymous visitors may submit the contact form, but may not read or mutate records.
revoke select, update, delete on table public.inquiries from anon;
grant insert on table public.inquiries to anon;
grant select, insert, update, delete on table public.inquiries to authenticated;

-- Orders are created only by the verified PayPal Edge Function + process_paid_order RPC.
-- Do not allow clients to insert fabricated orders directly.
revoke all on table public.orders from anon;
revoke insert on table public.orders from authenticated;
grant select, update, delete on table public.orders to authenticated;

-- Reviews are inserted only through the validated submit_order_review RPC.
revoke all on table public.order_reviews from anon;
revoke insert, delete on table public.order_reviews from authenticated;
grant select, update on table public.order_reviews to authenticated;

-- Clients must never be able to mutate role assignments.
revoke all on table public.user_roles from anon;
revoke insert, update, delete on table public.user_roles from authenticated;
grant select on table public.user_roles to authenticated;

-- Wishlist is user-owned and authenticated-only.
revoke all on table public.wishlists from anon;
grant select, insert, update, delete on table public.wishlists to authenticated;

-- Stock reservations are internal checkout state and are accessed by service-role Edge Functions only.
revoke all on table public.stock_reservations from anon, authenticated;

-- 3) Remove obsolete or overly broad RLS policies and scope admin policies to signed-in users.
drop policy if exists "Admin Full Access" on public.inquiries;
drop policy if exists "Public_Insert_Orders" on public.orders;

drop policy if exists "Admin_Manage_Inquiries" on public.inquiries;
create policy "Admin_Manage_Inquiries"
  on public.inquiries for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "inquiries_select_own_or_admin" on public.inquiries;
create policy "inquiries_select_own_or_admin"
  on public.inquiries for select to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admin_Manage_Orders" on public.orders;
create policy "Admin_Manage_Orders"
  on public.orders for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Select_Orders" on public.orders;
create policy "Select_Orders"
  on public.orders for select to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admin_Manage_Products" on public.products;
create policy "Admin_Manage_Products"
  on public.products for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin_Manage_Vouchers" on public.vouchers;
create policy "Admin_Manage_Vouchers"
  on public.vouchers for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users_Read_Own_Role" on public.user_roles;
create policy "Users_Read_Own_Role"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Manage_Own_Wishlist" on public.wishlists;
create policy "Manage_Own_Wishlist"
  on public.wishlists for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4) Lock down Storage writes. Keep public reads for assets referenced by the storefront.
drop policy if exists "all_access 1oj01fe_1" on storage.objects;
drop policy if exists "all_access 1oj01fe_2" on storage.objects;
drop policy if exists "all_access 1oj01fe_3" on storage.objects;
drop policy if exists "all_access 8goi0s_1" on storage.objects;
drop policy if exists "all_access 8goi0s_2" on storage.objects;
drop policy if exists "all_access 8goi0s_3" on storage.objects;

drop policy if exists "avatars_owner_write" on storage.objects;
create policy "avatars_owner_write"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and name like (auth.uid()::text || '-%')
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and name like (auth.uid()::text || '-%')
  )
  with check (
    bucket_id = 'avatars'
    and name like (auth.uid()::text || '-%')
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and name like (auth.uid()::text || '-%')
  );

drop policy if exists "products_upload_admin_write" on storage.objects;
create policy "products_upload_admin_write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'products_upload' and public.is_admin());

drop policy if exists "products_upload_admin_update" on storage.objects;
create policy "products_upload_admin_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'products_upload' and public.is_admin())
  with check (bucket_id = 'products_upload' and public.is_admin());

drop policy if exists "products_upload_admin_delete" on storage.objects;
create policy "products_upload_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'products_upload' and public.is_admin());

-- 5) Restrict sensitive SECURITY DEFINER RPCs to the roles that need them.
revoke execute on function public.decrement_product_stock(text, integer) from public, anon, authenticated;
grant execute on function public.decrement_product_stock(text, integer) to service_role;

revoke execute on function public.increment_voucher_usage(text) from public, anon, authenticated;
grant execute on function public.increment_voucher_usage(text) to service_role;

revoke execute on function public.submit_inquiry_review(uuid, integer, text) from public, anon, authenticated;
grant execute on function public.submit_inquiry_review(uuid, integer, text) to authenticated;

revoke execute on function public.submit_order_review(uuid, integer, text) from public, anon, authenticated;
grant execute on function public.submit_order_review(uuid, integer, text) to authenticated;

-- is_admin only returns a boolean; make it invoker-security and grant it only to signed-in users.
create or replace function public.is_admin()
returns boolean
language sql
security invoker
set search_path = ''
as $function$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$function$;

revoke execute on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

-- Public order tracking is an intentional feature. UUID acts as the tracking capability.
-- Do not disclose payment_status through this public RPC; retain the return shape for compatibility.
create or replace function public.track_order_status(search_id uuid)
returns table(
  order_id uuid,
  status text,
  payment text,
  tracking text,
  order_date timestamptz
)
language sql
security definer
set search_path = ''
as $function$
  select
    o.id as order_id,
    o.order_status as status,
    null::text as payment,
    o.tracking_code as tracking,
    o.created_at as order_date
  from public.orders o
  where o.id = search_id
    and lower(coalesce(o.payment_status, '')) = 'paid';
$function$;

revoke execute on function public.track_order_status(uuid) from public, anon, authenticated;
grant execute on function public.track_order_status(uuid) to anon, authenticated;

-- Public review display is intentionally public; its function only returns non-hidden review fields.
revoke execute on function public.get_public_reviews(text) from public, anon, authenticated;
grant execute on function public.get_public_reviews(text) to anon, authenticated;

commit;
