begin;

-- Apply after submit-inquiry and the new frontend are ready. Reads, reviews and Admin updates stay scoped by existing RLS.
revoke insert on table public.inquiries from public, anon, authenticated;
drop policy if exists "Cho phép gửi form" on public.inquiries;

notify pgrst, 'reload schema';

commit;
