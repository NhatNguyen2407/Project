create function private.enforce_inquiry_quantities()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.quantity is null or new.quantity < 1 then
    raise exception using errcode = '23514', message = 'Quantity must be at least 1.';
  end if;
  if new.accessory_qty < 0 then
    raise exception using errcode = '23514', message = 'Accessories per unit cannot be negative.';
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_inquiry_quantities() from public, anon, authenticated;

-- shortcut: Retain invalid legacy rows for review; add validated CHECKs after cleanup.
-- Validate count writes without blocking unrelated updates or account anonymization.
create trigger enforce_inquiry_quantities
before insert or update of quantity, accessory_qty on public.inquiries
for each row execute function private.enforce_inquiry_quantities();
