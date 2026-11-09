-- All fixtures are discarded; only synthetic IDs are queried under each role.
do $$
declare
  customer uuid := gen_random_uuid();
  other_customer uuid := gen_random_uuid();
  admin_user uuid := gen_random_uuid();
  own_inquiry uuid := gen_random_uuid();
  other_inquiry uuid := gen_random_uuid();
  verified boolean := false;
begin
  begin
    insert into auth.users(id,email) values
      (customer,customer::text || '@example.invalid'),
      (other_customer,other_customer::text || '@example.invalid'),
      (admin_user,admin_user::text || '@example.invalid');
    update public.user_roles set role='admin' where user_id=admin_user;
    if not found then
      insert into public.user_roles(user_id,role) values(admin_user,'admin');
    end if;
    insert into public.inquiries(id,user_id,subject,customer_name,customer_email,contact_info,product_name,quantity,accessory_qty,image_link)
      values(own_inquiry,customer,'Admin view fixture','Fixture','fixture@example.invalid','Fixture contact','Fixture product',1,0,'https://example.invalid/design.png'),
            (other_inquiry,other_customer,'Other fixture','Other fixture','other@example.invalid','Fixture contact','Fixture product',2,1,'https://example.invalid/design.png');

    perform set_config('request.jwt.claim.sub','',true);
    perform set_config('request.jwt.claims','{"role":"anon"}',true);
    set local role anon;
    begin
      if exists(select 1 from public.inquiries where id in(own_inquiry,other_inquiry)) then
        raise exception 'Anonymous clients could read private inquiries';
      end if;
    exception when insufficient_privilege then null;
    end;
    reset role;

    perform set_config('request.jwt.claim.sub',customer::text,true);
    perform set_config('request.jwt.claims',json_build_object('sub',customer,'role','authenticated')::text,true);
    set local role authenticated;
    if not exists(select 1 from public.inquiries where id=own_inquiry)
       or exists(select 1 from public.inquiries where id=other_inquiry) then
      raise exception 'Customer inquiry access crossed the account boundary';
    end if;
    reset role;

    perform set_config('request.jwt.claim.sub',admin_user::text,true);
    perform set_config('request.jwt.claims',json_build_object('sub',admin_user,'role','authenticated')::text,true);
    set local role authenticated;
    if not public.is_admin() or (select count(*) from public.inquiries where id in(own_inquiry,other_inquiry))<>2 then
      raise exception 'Admin could not read both inquiry fixtures';
    end if;
    reset role;
    verified := true;
    raise exception using errcode='ZX005',message='Discard admin inquiry fixtures';
  exception when sqlstate 'ZX005' then null;
  end;
  if not verified or exists(select 1 from auth.users where id in(customer,other_customer,admin_user))
     or exists(select 1 from public.inquiries where id in(own_inquiry,other_inquiry)) then
    raise exception 'Admin inquiry fixture cleanup failed';
  end if;
end;
$$;
