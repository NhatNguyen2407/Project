-- Fixtures and any failed writes are rolled back; no account or external service is used.
do $$
declare
  fixture_id uuid := gen_random_uuid();
  bad_quantity integer;
  verified boolean := false;
begin
  begin
    foreach bad_quantity in array array[0,-1] loop
      begin
        insert into public.inquiries(subject,customer_name,customer_email,contact_info,product_name,quantity,image_link)
          values('Quantity fixture','Fixture','fixture@example.invalid','Fixture contact','Fixture product',bad_quantity,'https://example.invalid/fixture.png');
        raise exception 'Invalid quantity was accepted';
      exception when check_violation then null;
      end;
    end loop;
    begin
      insert into public.inquiries(subject,customer_name,customer_email,contact_info,product_name,quantity,accessory_qty,image_link)
        values('Quantity fixture','Fixture','fixture@example.invalid','Fixture contact','Fixture product',1,-1,'https://example.invalid/fixture.png');
      raise exception 'Negative accessories were accepted';
    exception when check_violation then null;
    end;

    insert into public.inquiries(id,subject,customer_name,customer_email,contact_info,product_name,quantity,accessory_qty,image_link)
      values(fixture_id,'Quantity fixture','Fixture','fixture@example.invalid','Fixture contact','Fixture product',1,0,'https://example.invalid/fixture.png');
    begin
      update public.inquiries set quantity=0 where id=fixture_id;
      raise exception 'Zero-quantity update was accepted';
    exception when check_violation then null;
    end;
    begin
      update public.inquiries set accessory_qty=-1 where id=fixture_id;
      raise exception 'Negative accessory update was accepted';
    exception when check_violation then null;
    end;
    update public.inquiries set quantity=2,accessory_qty=3 where id=fixture_id;
    update public.inquiries set note='Unrelated update remains available' where id=fixture_id;
    if not exists(select 1 from public.inquiries where id=fixture_id and quantity=2 and accessory_qty=3 and note='Unrelated update remains available') then
      raise exception 'Valid inquiry counts or unrelated updates failed';
    end if;
    verified := true;
    raise exception using errcode='ZX004',message='Discard quantity fixtures';
  exception when sqlstate 'ZX004' then null;
  end;
  if not verified or exists(select 1 from public.inquiries where id=fixture_id) then
    raise exception 'Quantity fixture cleanup failed';
  end if;
end;
$$;
