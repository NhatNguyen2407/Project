-- Keep accounting records; anonymize them in the transaction that deletes Auth.
create schema if not exists private;

create or replace function private.anonymize_deleted_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op <> 'DELETE' or tg_table_schema <> 'auth' or tg_table_name <> 'users' then
    raise exception 'This function only handles Auth user deletion';
  end if;

  update public.orders
  set user_id = null, customer_name = 'Deleted User', customer_email = 'deleted@deleted.local',
      phone_number = null, shipping_address = null, rating = null, review_comment = null,
      admin_reply = null, is_hidden = true
  where user_id = old.id;

  update public.inquiries
  set user_id = null, customer_name = 'Deleted User', customer_email = 'deleted@deleted.local',
      phone_number = null, shipping_address = null, contact_info = '',
      subject = 'Deleted User Inquiry', note = null, image_link = '', rating = null,
      review_comment = null, admin_reply = null, is_hidden = true, order_review_id = null
  where user_id = old.id;

  -- Auth foreign keys cascade reviews, wishlists, roles and refresh sessions.
  return old;
end;
$$;

revoke all on function private.anonymize_deleted_user() from public, anon, authenticated;
create trigger anonymize_account_before_delete
before delete on auth.users
for each row execute function private.anonymize_deleted_user();
