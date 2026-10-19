-- STAGING ONLY: apply to Supabase project bvnnmvlfcduwmneipmsi.
-- A private, synthetic-reference bucket. There is deliberately NO anon upload.
-- NEVER apply this script to Production.
begin;

do $preflight$
begin
  if to_regclass('public.products') is null
     or not exists(select 1 from public.products where id = 'STG-SAMPLE-PLUSH')
     or not exists(select 1 from public.orders
                   where customer_email = 'synthetic@example.invalid'
                     and payment_method = 'synthetic')
     or exists(select 1 from storage.buckets)
  then
    raise exception 'Not the expected empty-storage synthetic Staging; abort';
  end if;
end
$preflight$;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('inquiry-test-references','inquiry-test-references',false,5242880,
  array['image/png','image/jpeg','image/webp']::text[]);

create policy staging_inquiry_image_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'inquiry-test-references'
    and (select auth.uid()) is not null
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and lower(storage.extension(name)) in ('png','jpg','webp')
  );

create policy staging_inquiry_image_owner_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'inquiry-test-references'
    and (select auth.uid()) is not null
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

commit;

-- No UPDATE, DELETE or anon policies. Do not change public=true.
-- Test signed-in synthetic images only, not real customer references.
-- A signed URL created by createSignedUrl expires after 3600 seconds.
