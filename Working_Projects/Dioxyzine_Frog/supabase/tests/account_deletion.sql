-- Synthetic fixtures live only inside a rolled-back subtransaction. No emails are sent.
do $$
declare
  customer uuid := gen_random_uuid();
  other_customer uuid := gen_random_uuid();
  v_order_id uuid := gen_random_uuid();
  other_order uuid := gen_random_uuid();
  inquiry_id uuid := gen_random_uuid();
  verified boolean := false;
begin
  if has_function_privilege('anon', 'private.anonymize_deleted_user()', 'execute')
     or has_function_privilege('authenticated', 'private.anonymize_deleted_user()', 'execute')
     or has_table_privilege('authenticated', 'auth.users', 'delete') then
    raise exception 'Deletion internals must not be directly callable by clients';
  end if;
  begin
    insert into auth.users (id, email) values
      (customer, customer::text || '@example.invalid'),
      (other_customer, other_customer::text || '@example.invalid');
    insert into public.orders (id,user_id,customer_name,customer_email,total_amount,cart_items,payment_status,order_status,shipping_address)
      values (v_order_id,customer,'Fixture Customer','fixture@example.invalid',27,'[]','paid','completed','Fixture address'),
             (other_order,other_customer,'Other Fixture','other@example.invalid',40,'[]','paid','processing','Other fixture address');
    insert into public.inquiries (id,user_id,subject,customer_name,customer_email,contact_info,product_name,quantity,image_link,note)
      values (inquiry_id,customer,'Fixture subject','Fixture Customer','fixture@example.invalid','Fixture contact','Fixture product',1,'https://example.invalid/image','Fixture note');
    insert into public.order_reviews (order_id,user_id,rating,review_comment) values (v_order_id,customer,5,'Fixture review');
    insert into public.wishlists (user_id,product_id) values (customer,'fixture-product');
    insert into public.user_roles (user_id,role) values (customer,'customer');

    -- Force a later failure and prove that every earlier anonymization is undone.
    begin
      delete from auth.users where id = customer;
      raise exception using errcode = 'ZX001', message = 'Simulated later deletion failure';
    exception when sqlstate 'ZX001' then null;
    end;
    if not exists(select 1 from auth.users where id = customer)
       or not exists(select 1 from public.orders where id = v_order_id and user_id = customer and shipping_address = 'Fixture address')
       or not exists(select 1 from public.inquiries where id = inquiry_id and contact_info = 'Fixture contact')
       or not exists(select 1 from public.order_reviews where order_id = v_order_id) then
      raise exception 'Failed deletion did not roll back all business changes';
    end if;

    -- The operator can test the trigger; the managed Auth role requires a real API acceptance test.
    delete from auth.users where id = customer;
    if exists(select 1 from auth.users where id = customer)
       or not exists(select 1 from public.orders where id = v_order_id and user_id is null and customer_name = 'Deleted User' and shipping_address is null and total_amount = 27 and payment_status = 'paid' and order_status = 'completed')
       or not exists(select 1 from public.inquiries where id = inquiry_id and user_id is null and contact_info = '' and note is null and image_link = '')
       or exists(select 1 from public.order_reviews where user_id = customer)
       or exists(select 1 from public.wishlists where user_id = customer)
       or exists(select 1 from public.user_roles where user_id = customer)
       or not exists(select 1 from public.orders where id = other_order and user_id = other_customer and customer_name = 'Other Fixture') then
      raise exception 'Successful deletion did not preserve the expected account boundary';
    end if;
    verified := true;
    raise exception using errcode = 'ZX002', message = 'Discard all fixtures';
  exception when sqlstate 'ZX002' then null;
  end;
  if not verified or exists(select 1 from auth.users where id in (customer,other_customer))
     or exists(select 1 from public.orders where id in (v_order_id,other_order))
     or exists(select 1 from public.inquiries where id = inquiry_id) then
    raise exception 'Synthetic fixture cleanup failed';
  end if;
end;
$$;
