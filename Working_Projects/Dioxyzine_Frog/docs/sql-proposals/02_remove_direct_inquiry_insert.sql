-- REVIEW-ONLY SQL PROPOSAL. Do NOT execute on Production.
-- RUN THIS ONLY AFTER the new trusted Edge Function, frontend and rollback
-- have passed isolated staging tests. Running prematurely breaks inquiries.
BEGIN;
-- Exact policy name confirmed by read-only inspection of current live metadata.
DROP POLICY IF EXISTS "Cho phép gửi form" ON public.inquiries;

-- Restrict guest and customer direct inserts; admin policies are untouched.
REVOKE INSERT ON public.inquiries FROM anon, authenticated;
-- Server-side inserts use service_role credentials and bypass RLS.
-- Ensure no other broad INSERT policy or grants remain at this point.
COMMIT;

-- Acceptance: direct PostgREST guest/customer INSERT is denied;
-- legitimate guest/authenticated Edge Function submission succeeds;
-- admin review access still works. Document rollback in release plan.
