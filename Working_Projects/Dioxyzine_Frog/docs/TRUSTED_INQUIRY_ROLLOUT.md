# Trusted inquiry submission — gated rollout (DF-006)

**Status: IMPLEMENTATION PROPOSAL ONLY. DO NOT DEPLOY OR MERGE UNTIL ALL GATES PASS.**

The current production `public.inquiries` RLS policy `Cho phép gửi form` permits public direct inserts. The old frontend verifies reCAPTCHA separately, so a caller can bypass it by writing directly through PostgREST.

## Proposed behavior

1. Browser obtains reCAPTCHA v3 token for action `inquiry_submit` and calls `submit-inquiry` with token and form fields.
2. Edge Function validates body size, field length/type, Cloudinary image HTTPS host, configured Origin, and an IP-derived quota key (not stored raw). It consumes an atomic quota using the SQL function.
3. Edge Function calls Google's `siteverify` and verifies **success, action, score >= 0.5, configured hostname, and challenge age <= 120 seconds**.
4. It derives optional user ID from a verified Supabase Auth token (never browser-supplied identity) and writes with the server-only service role.
5. Direct browser inserts must be revoked *only after* the trusted path is demonstrated. The old Apps Script mirror remains best-effort and is **not** a durable backup.

## Mandatory environment secrets/settings

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`: Supabase-managed backend-only credentials; never expose the service role.
- `RECAPTCHA_SECRET_KEY`: Google reCAPTCHA v3 secret.
- `INQUIRY_ALLOWED_ORIGINS`: exact, comma-delimited frontend origins, e.g. one canonical HTTPS origin plus controlled staging origin.
- `INQUIRY_CAPTCHA_HOSTNAMES`: exact, comma-delimited reCAPTCHA approved hostnames (without scheme).
- `INQUIRY_RATE_SALT`: random secret at least 32 bytes; hashes IP-derived quota keys without storing raw IP.
- `INQUIRY_TRUSTED_IP_HEADER`: name of an IP header injected/**overwritten** by a trusted edge gateway. **This has not been verified.** Do not rely on client-controlled `x-forwarded-for`; spoofable headers defeat per-IP rate limiting. If unverified, block deployment.

Fail-closed behavior: missing configuration or quota primitive means 503; invalid CAPTCHA means no insert.

## Release gates (all required)

- [ ] Isolated, approved-cost staging backend exists and Preview is proven to use it, not Production.
- [ ] Confirm new Edge Function deployment semantics for unauthenticated guests and signed-in users; review JWT verification settings (use legacy keys only as required).
- [ ] Confirm trusted gateway IP header cannot be forged by callers; adjust design if necessary.
- [ ] Apply `sql-proposals/01_inquiry_quota.sql` in **isolated staging only**; inspect SQL grant behavior and retention.
- [ ] Deploy `submit-inquiry` function to staging with secrets, action/host configuration and test Origin.
- [ ] Deploy staging frontend and test legitimate guest + authenticated submission; confirm Apps Script mirrored path as a separate integration concern.
- [ ] Apply `sql-proposals/02_remove_direct_inquiry_insert.sql` to **staging only**; test denied direct PostgREST writes and admin read access.
- [ ] Test bad/expired/wrong-host CAPTCHA, malformed input, oversized request, quota, network loss and browser re-submit.
- [ ] Evaluate duplicate submissions and durable mirroring/retries; current legacy mirror is asynchronous and non-durable.
- [ ] Reconcile actual six live migrations with the repository's two legacy migrations before creating canonical Production migrations.
- [ ] Verify backup/restore and rehearse scoped rollback before scheduling Production deploy. Do not run these unversioned proposals through `supabase db push`.

## Important deployment sequence

Do not release the frontend ahead of the function. Do not revoke the old `INSERT` policy before the new endpoint is functional. Apply privileges in a separately approved deployment step after tested fallback.

No SQL in this directory has been applied to Production, and no external environment has been provisioned.
