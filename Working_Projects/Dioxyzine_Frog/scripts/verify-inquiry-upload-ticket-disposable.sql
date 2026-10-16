-- DISPOSABLE POSTGRES ONLY. This fixture stubs Storage metadata,
-- not the hosted Storage HTTP API. All names, images and credentials synthetic.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;

CREATE SCHEMA storage;
CREATE TABLE storage.buckets (id text PRIMARY KEY, public boolean NOT NULL);
CREATE TABLE storage.objects (
  bucket_id text NOT NULL REFERENCES storage.buckets(id),
  name text NOT NULL,
  metadata jsonb NOT NULL,
  PRIMARY KEY(bucket_id,name)
);
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  subject text, customer_name text, customer_email text,
  contact_info text, product_name text, size text, quantity integer,
  accessory_qty integer, image_link text, note text, user_id uuid
);
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT SELECT ON storage.buckets, storage.objects TO service_role;
GRANT SELECT,INSERT ON public.inquiries TO service_role;
INSERT INTO storage.buckets(id,public) VALUES('inquiry-test-references',false);
\ir ../docs/drafts/INQUIRY_IDEMPOTENCY_DRAFT.sql
\ir ../docs/drafts/INQUIRY_UPLOAD_TICKET_BINDING_DRAFT.sql

DO $assert$
BEGIN
  IF pg_catalog.has_function_privilege('anon','public.register_inquiry_upload_ticket(text,text,integer)','EXECUTE')
    OR pg_catalog.has_function_privilege('authenticated','public.register_inquiry_upload_ticket(text,text,integer)','EXECUTE')
    OR NOT pg_catalog.has_function_privilege('service_role','public.register_inquiry_upload_ticket(text,text,integer)','EXECUTE')
    OR pg_catalog.has_function_privilege('anon','public.create_inquiry_idempotent(uuid,text,jsonb,uuid)','EXECUTE')
  THEN RAISE EXCEPTION 'Unsafe RPC grants'; END IF;
END
$assert$;

-- Register the valid ticket using service_role, not a superuser.
SET ROLE service_role;
DO $assert$
BEGIN
  IF NOT public.register_inquiry_upload_ticket(
    'guest/11111111-1111-4111-8111-111111111111.png','image/png',100
  ) THEN RAISE EXCEPTION 'Ticket registration failed'; END IF;
  BEGIN
    PERFORM public.register_inquiry_upload_ticket(
      'other/11111111-1111-4111-8111-111111111111.png','image/png',100);
    RAISE EXCEPTION 'Unsafe path accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
  BEGIN
    PERFORM public.register_inquiry_upload_ticket(
      'guest/22222222-2222-4222-8222-222222222222.png','image/jpeg',100);
    RAISE EXCEPTION 'MIME extension mismatch accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
  PERFORM public.register_inquiry_upload_ticket(
    'guest/33333333-3333-4333-8333-333333333333.png','image/png',100);
  PERFORM public.register_inquiry_upload_ticket(
    'guest/44444444-4444-4444-8444-444444444444.png','image/png',100);
END
$assert$;
RESET ROLE;
INSERT INTO storage.objects(bucket_id,name,metadata) VALUES
 ('inquiry-test-references',
  'guest/11111111-1111-4111-8111-111111111111.png',
  '{"size":100,"mimetype":"image/png"}'::jsonb),
 ('inquiry-test-references',
  'guest/44444444-4444-4444-8444-444444444444.png',
  '{"size":100,"mimetype":"image/jpeg"}'::jsonb);
-- A missing object ticket and a wrong-MIME ticket both exist at this point.

SET ROLE service_role;
DO $assert$
DECLARE
  row jsonb := pg_catalog.jsonb_build_object(
    'subject','Synthetic','customer_name','Sample','customer_email','sample@example.invalid',
    'contact_info','Synthetic','product_name','Test','size','10',
    'quantity',1,'accessory_qty',0,'note','none',
    'image_link','storage://inquiry-test-references/guest/11111111-1111-4111-8111-111111111111.png');
  result jsonb;
  primary_id uuid;
  fake_id uuid;
BEGIN
  -- Failed validation MUST leave zero inquiries and no claimed ticket.
  BEGIN
    PERFORM public.create_inquiry_idempotent(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',pg_catalog.repeat('a',64),
      pg_catalog.jsonb_set(row,'{image_link}',
        '"storage://inquiry-test-references/guest/33333333-3333-4333-8333-333333333333.png"'::jsonb),null);
    RAISE EXCEPTION 'Missing Storage object accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
  BEGIN
    PERFORM public.create_inquiry_idempotent(
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',pg_catalog.repeat('b',64),
      pg_catalog.jsonb_set(row,'{image_link}',
        '"storage://inquiry-test-references/guest/44444444-4444-4444-8444-444444444444.png"'::jsonb),null);
    RAISE EXCEPTION 'Wrong MIME accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
  IF (SELECT count(*) FROM public.inquiries)<>0 THEN
    RAISE EXCEPTION 'Rejected requests mutated inquiries';
  END IF;

  result := public.create_inquiry_idempotent(
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',pg_catalog.repeat('c',64),row,null);
  primary_id := (result->>'inquiryId')::uuid;
  IF primary_id IS NULL OR result->>'replayed'<>'false' THEN
    RAISE EXCEPTION 'First issuance missing';
  END IF;
  result := public.create_inquiry_idempotent(
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',pg_catalog.repeat('c',64),row,null);
  IF result->>'replayed'<>'true' OR (result->>'inquiryId')::uuid<>primary_id THEN
    RAISE EXCEPTION 'Idempotency replay did not reuse result';
  END IF;
  BEGIN
    PERFORM public.create_inquiry_idempotent(
      'dddddddd-dddd-4ddd-8ddd-dddddddddddd',pg_catalog.repeat('d',64),row,null);
    RAISE EXCEPTION 'Previously claimed object was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
  IF (SELECT count(*) FROM public.inquiries)<>1
     OR (SELECT count(*) FROM inquiry_internal.submission_keys)<>1
     OR (SELECT claimed_inquiry_id FROM inquiry_internal.upload_tickets
         WHERE object_path='guest/11111111-1111-4111-8111-111111111111.png')<>primary_id
  THEN RAISE EXCEPTION 'Not atomic: record or claim count differs'; END IF;
END
$assert$;
RESET ROLE;
-- Rejected expired grant cannot create a record either.
UPDATE inquiry_internal.upload_tickets SET issued_at=now()-interval '3 hours'
 WHERE object_path='guest/44444444-4444-4444-8444-444444444444.png';
SET ROLE service_role;
DO $assert$
DECLARE row jsonb := pg_catalog.jsonb_build_object(
  'subject','Synthetic','customer_name','Sample','customer_email','sample@example.invalid',
  'contact_info','Synthetic','product_name','Test','quantity',1,
  'image_link','storage://inquiry-test-references/guest/44444444-4444-4444-8444-444444444444.png');
BEGIN
  BEGIN
    PERFORM public.create_inquiry_idempotent(
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',pg_catalog.repeat('e',64),row,null);
    RAISE EXCEPTION 'Expired ticket accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
  IF (SELECT count(*) FROM public.inquiries)<>1 THEN
    RAISE EXCEPTION 'Expired attempt changed inquiry count';
  END IF;
END
$assert$;
RESET ROLE;
SELECT 'upload ticket disposable SQL drill passed' AS result;
