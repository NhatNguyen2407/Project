do $$
declare
  customer uuid := gen_random_uuid();
  other_customer uuid := gen_random_uuid();
  v_order_id uuid := gen_random_uuid();
  changed integer;
  denied boolean := false;
  verified boolean := false;
begin
  if has_table_privilege('anon', 'public.wishlists', 'select') then
    raise exception 'Anonymous wishlist reads must not be granted';
  end if;
  begin
    insert into auth.users(id,email) values (customer,customer::text || '@example.invalid'),(other_customer,other_customer::text || '@example.invalid');
    insert into public.orders(id,user_id,customer_name,customer_email,total_amount,cart_items,payment_status,order_status)
      values(v_order_id,customer,'Fixture','fixture@example.invalid',27,'[]','paid','shipping');
    insert into public.wishlists(user_id,product_id) values(customer,'fixture-own'),(other_customer,'fixture-other');
    perform set_config('request.jwt.claim.sub',customer::text,true);
    perform set_config('request.jwt.claims',json_build_object('sub',customer,'role','authenticated')::text,true);
    set local role authenticated;
    if (select count(*) from public.wishlists where user_id = customer) <> 1
       or exists(select 1 from public.wishlists where user_id = other_customer) then
      raise exception 'Wishlist reads crossed the account boundary';
    end if;
    delete from public.wishlists where user_id = other_customer;
    get diagnostics changed = row_count;
    if changed <> 0 then raise exception 'Cross-account deletion was allowed'; end if;
    begin
      insert into public.wishlists(user_id,product_id) values(other_customer,'fixture-forbidden');
    exception when insufficient_privilege then denied := true;
    end;
    if not denied then raise exception 'Cross-account insertion was allowed'; end if;
    insert into public.wishlists(user_id,product_id) values(customer,'fixture-own')
      on conflict(user_id,product_id) do update set product_id = excluded.product_id;
    delete from public.wishlists where user_id = customer and product_id = 'fixture-own';
    get diagnostics changed = row_count;
    if changed <> 1 then raise exception 'Own wishlist removal was not confirmed'; end if;
    if public.submit_order_review(v_order_id,5,'Fixture review') is not true then
      raise exception 'Own review submission failed';
    end if;
    if not exists(select 1 from public.orders o join public.order_reviews r on r.order_id = o.id
      where o.id = v_order_id and o.order_status = 'completed' and r.rating = 5) then
      raise exception 'Saved review was not visible to its owner';
    end if;
    perform set_config('request.jwt.claim.sub',other_customer::text,true);
    perform set_config('request.jwt.claims',json_build_object('sub',other_customer,'role','authenticated')::text,true);
    if exists(select 1 from public.orders where id = v_order_id)
       or exists(select 1 from public.order_reviews where order_id = v_order_id)
       or public.submit_order_review(v_order_id,4,'Forbidden') is not false then
      raise exception 'Orders or reviews crossed the account boundary';
    end if;
    reset role;
    verified := true;
    raise exception using errcode = 'ZX003', message = 'Discard access-test fixtures';
  exception when sqlstate 'ZX003' then null;
  end;
  if not verified or exists(select 1 from auth.users where id in(customer,other_customer)) then
    raise exception 'Access-test fixture cleanup failed';
  end if;
end;
$$;
