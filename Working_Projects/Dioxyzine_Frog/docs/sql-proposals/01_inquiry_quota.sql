-- REVIEW-ONLY SQL PROPOSAL. Do NOT execute on Production.
-- First create rate-limit primitives in an isolated staging database.
-- Must be paired with the Edge Function and stricter inquiry INSERT grants.
BEGIN;
CREATE SCHEMA IF NOT EXISTS inquiry_security;
REVOKE ALL ON SCHEMA inquiry_security FROM PUBLIC, anon, authenticated;
CREATE TABLE IF NOT EXISTS inquiry_security.inquiry_limits (
  key_hash text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  attempts integer NOT NULL CHECK (attempts > 0)
);
REVOKE ALL ON inquiry_security.inquiry_limits FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_inquiry_quota(p_key_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  accepted boolean;
BEGIN
  IF p_key_hash !~ '^[a-f0-9]{64}$' THEN
    RETURN false;
  END IF;

  INSERT INTO inquiry_security.inquiry_limits AS q (key_hash, window_start, attempts)
  VALUES (p_key_hash, now(), 1)
  ON CONFLICT (key_hash) DO UPDATE SET
    window_start = CASE
      WHEN q.window_start < now() - interval '10 minutes' THEN now()
      ELSE q.window_start END,
    attempts = CASE
      WHEN q.window_start < now() - interval '10 minutes' THEN 1
      ELSE LEAST(q.attempts + 1, 1000000) END
  RETURNING (attempts <= 5) INTO accepted;

  RETURN COALESCE(accepted, false);
END;
$$;

REVOKE ALL ON FUNCTION public.consume_inquiry_quota(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_inquiry_quota(text) TO service_role;
COMMIT;

-- Required before go-live: verify permissions with a non-service role,
-- independently test throttling/concurrency, implement retention cleanup
-- for stale hashed identifiers, and verify trusted gateway IP handling.
