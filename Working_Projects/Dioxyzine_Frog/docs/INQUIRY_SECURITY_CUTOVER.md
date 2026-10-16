# Inquiry Security Cutover — Draft; production deployment is NOT authorized

Updated 2026-10-16. Public repository: do not add token, secret, customer content or personal records.

## Confirmed vulnerability

The deployed UI currently calls `verify-recaptcha` separately, then writes directly to the public `inquiries` table. The database policy named `Cho phép gửi form` has `WITH CHECK (true)` for INSERT and the `anon` role has an INSERT grant. Anyone bypassing the UI can invoke the REST table endpoint directly. Checking `score` in the browser or changing the legacy verification function alone does **not** close this vulnerability.

The separate legacy `verify-recaptcha` function checks only Google's `success` flag; it does not require the expected action, acceptable score, hostname, or fresh challenge. Do not treat a `success: true` response from that endpoint as authorization to write.

## Draft remedy in this PR

- A new `submit-inquiry` Edge Function accepts one inquiry and its reCAPTCHA token in the **same request**.
- Server verifies a fresh Google reCAPTCHA v3 token with approved action `inquiry_submit`, expected hostname, acceptable score and challenge age.
- Server validates an explicit allowlist of customer fields, length bounds, integer quantities, email and HTTPS image URL.
- User identity comes from Auth verification, not from form JSON. The server sends an insert using its **server-side** service role only after the checks pass.
- Frontend routes its form through the new function; it no longer runs direct `inquiries` INSERT. The Google Sheets mirror is still best-effort and has independent reliability/privacy concerns; do not confuse it with a durable delivery outbox.
- Edge Function requires allowed browser origins and a configured hostname allowlist. Origin restrictions are a browser control and **not** an authentication or rate-limit mechanism.
- No new dependency or paid resource is required in the repository.

**Not yet implemented: distributed abuse/rate limiting, idempotent submission handling, end-to-end database permission verification, and a durable Sheets outbox.** The endpoint must not be deployed as a public production write path until these concerns are assessed and necessary controls are ready. In particular, per-instance memory counters are not a valid multi-instance rate limiter.

## Required backend environment configuration (NOT applied)

- `RECAPTCHA_SECRET_KEY`: server-side secret, present only in Supabase Edge Function secrets.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: server-provided function environment, never `VITE_*` and never printed.
- `INQUIRY_ALLOWED_ORIGINS`: comma-separated exact HTTPS origins for the actual storefront.
- `INQUIRY_ALLOWED_HOSTNAMES`: comma-separated hostnames registered in the reCAPTCHA console.
- `INQUIRY_RECAPTCHA_MIN_SCORE`: optional numeric threshold from 0 to 1, default `0.5`; review against observed legitimate traffic.

Anonymous visitors use the function without a user JWT, so deployment **must** deliberately configure the new function's platform `verify_jwt = false` and verify caller controls inside the handler. Do not globally disable JWT verification on unrelated Edge Functions. The endpoint refuses unapproved origins, but non-browser callers can forge `Origin` and must still pass CAPTCHA and independent rate limits.

## Coordinated rollout — required before any Production cutover

1. Prepare an **isolated no-cost local Supabase environment**, not linked to the Production project, with synthetic inquiries and separately scoped credentials. Staging on the hosted Supabase platform is blocked by the explicit **no paid resources** constraint. Do not restore real customer/Auth data to a host with unverified network isolation.
2. Exercise the function end-to-end with Google verification mocked in unit tests and suitable test credentials in isolated integration tests. Test valid guest and signed-in requests, invalid CAPTCHA/action/hostname/score/expired timestamp, malformed data, external direct REST insert, invalid origin, duplicate submissions and transient database errors.
3. Add a proven **distributed**, configurable, bounded rate limiter appropriate to the free deployment and measure behavior under parallel requests. If no safe no-cost mechanism is available, defer release. Do not log raw IPs, contact info, tokens or CAPTCHA results.
4. Review actual browser origins, reCAPTCHA key hostname settings, service-role scope, CORS preflight and returned API status on the intended isolated app.
5. **Coordinate the frontend, function and database restriction as one maintenance cutover.** This PR does **not** contain a production-ready migration. Draft the schema change from the observed live policy/grants and review against staging. Remove the public INSERT policy and revoke direct INSERT from `anon` and `authenticated` as appropriate **without removing Admin's required mutation permissions**. In particular, avoid broadly revoking other grants or disabling RLS. A failed deployment/restriction order could stop inquiry form submissions.
6. Run an external negative test confirming both guest and signed-in direct `/rest/v1/inquiries` INSERT requests fail, while legitimate server-side form submissions succeed.
7. Confirm no accidental client writes remain elsewhere and re-check public grants + RLS.
8. Prepare a tested rollback plan (including old/new client compatibility); only authorized owner can deploy Production after backups/restore check and review.

## Security considerations

- Supabase `service_role` bypasses RLS; the handler **must** remain deliberately minimal and is not a generic proxy. Never accept table name, field names or privileged columns from request JSON.
- Captcha freshness helps but does not replace **distributed rate limiting** or idempotency. Google token duplicate handling may reduce replay but is not a transactional dedupe guarantee.
- The existing direct INSERT path remains vulnerable **until Production's effective RLS and grants are changed and verified**. A passing code PR cannot assert closure.
- Do not paste secret values into GitHub Issues/PRs, CI or chat.
- The compiled web app may display CORS errors if allowed origins or Supabase client headers are misconfigured. Test from a real browser against isolated backend.
- No paid Supabase branch, CI add-on, WAF, Sentry tier or third-party anti-bot service is approved.

## References

- Supabase Edge Function authorization: https://supabase.com/docs/guides/functions/auth
- CORS support: https://supabase.com/docs/guides/functions/cors
- API security/RLS: https://supabase.com/docs/guides/api/securing-your-api
- GitHub progress register: `docs/IMPROVEMENT_PROGRESS.md` (in a separate draft PR branch)
