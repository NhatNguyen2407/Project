-- Staging-only role discovery for the existing AuthContext/Login UI.
-- No client may assign roles or read another user's roles.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';
do $guard$
begin
  if not exists (select 1 from storage.buckets
                 where id='inquiry-test-references' and public=false)
     or not exists (select 1 from public.products where id='STG-SAMPLE-PLUSH')
     or exists (select 1 from auth.users where email not like '%@example.invalid')
     or exists (select 1 from pg_policies where schemaname='public' and tablename='user_roles')
  then raise exception 'Expected isolated synthetic Staging role schema'; end if;
end
$guard$;
alter table public.user_roles enable row level security;
revoke all on public.user_roles from anon, authenticated;
grant select (user_id, role) on public.user_roles to authenticated;
create policy staging_read_own_role on public.user_roles
  for select to authenticated
  using ((select auth.uid()) = user_id);
commit;
