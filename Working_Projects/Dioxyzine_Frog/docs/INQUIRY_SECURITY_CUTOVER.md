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

**A draft database-backed GLOBAL rate limiter is implemented in code and has PASSED real concurrency/permission tests against a disposable PostgreSQL 17 CI container. It has NOT been applied to Production. Still missing: isolated Edge Function integration testing, fair per-identity limits, idempotent submission handling, Production permission cutover, and a durable Sheets outbox.** The endpoint must not be deployed as a public production write path until these concerns are assessed and necessary controls are ready. In particular, per-instance memory counters are not a valid multi-instance rate limiter.

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
3. Review and test the **draft PostgreSQL rate limiter** at `docs/drafts/INQUIRY_RATE_LIMIT_DRAFT.sql` using an isolated local Postgres instance (synthetic records only). Check atomic counters under concurrent requests, granted/revoked privileges, window resets, service-role execution, and failure/429 behavior. The Edge Function currently enforces globally 180 requests/min before Google verification and 60 verified submissions/hour before the INSERT. These are provisional, deliberately conservative **global** thresholds; a traffic spike or malicious actor can block legitimate customers. Do not use spoofable `x-forwarded-for` values for an IP quota. No SQL has been applied. Do not log raw IPs, contact info, tokens or CAPTCHA results.
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

## Rate limiter implementation review — 2026-10-16

- **Draft SQL only:** `docs/drafts/INQUIRY_RATE_LIMIT_DRAFT.sql` creates a private RLS-enabled budget table limited to two named scopes and a `SECURITY INVOKER` RPC. This SQL is **not a versioned migration** and must not be applied to Production. It is not a complete database schema migration because historical migration versions still require reconciliation.
- **Atomicity design:** `INSERT ... ON CONFLICT (scope) DO UPDATE ... WHERE ... RETURNING` uses the scope primary key to serialize competing updates; when a full window is exhausted, no row is returned. Two fixed scopes bound table growth. **Concurrency behavior passed a real PostgreSQL 17 test using 32 parallel connections (10 accepted, 22 rejected).**
- **Grants:** intended only for `service_role`; schema/table access and RPC execute are explicitly revoked for public/anon/authenticated. After isolated SQL execution, test privileges and RLS before release.
- **No rate-limit bypass on failures:** the Edge Function calls both budgets using a fail-closed adapter and returns `503` on database/RPC errors, `429` on exhausted budget. Google is never contacted if the preverification budget refuses the request.
- **Known limitations:** quotas are global to all visitors, not per user/IP; burst contention may deny normal traffic. Provisional budgets should be reviewed against capacity and actual demand. Fixed windows have edge bursts at boundaries, so this is not a substitute for stronger abuse prevention. A successful budget reservation is consumed even when downstream Google verification or database INSERT fails. The accepted budget controls throughput but does not guarantee that the record is inserted; idempotency remains open.
- **Required before deployment:** prove SQL executes cleanly, permissions cannot be abused through the public RPC or Data API, and parallel requests never exceed the fixed budgets. The DB RPC must be present before deploying the Edge Function (else submissions fail closed), and database INSERT bypass must be revoked as part of the coordinated cutover.

**No paid resources, PostgreSQL DDL, Supabase function deployment, Production changes, or payment actions were performed for this review.**

## Local-only PostgreSQL concurrency drill — prepared, NOT executed

The script `scripts/verify-inquiry-rate-limit-local.mjs` exercises the actual draft SQL with 32 independent PostgreSQL connections, scope exhaustion, reset behavior, privilege metadata, unauthorized role execution and cleanup. Its companion Node tests check that remote databases, wrong ports and wrong database names cannot be targeted.

**Before running the script:** provision a disposable local PostgreSQL instance on **127.0.0.1:54322** (not a hosted database), create a separate database named `dioxyzine_rate_limit_test`, and ensure local Postgres roles `service_role`, `anon`, and `authenticated` exist with a dedicated test-only administrative owner. This script does NOT provision the database. The SQL draft changes schema in that test database and the script truncates its private test table; it should never be connected to any existing data.

Example with fake placeholder local credentials (do not paste real passwords into shell history or public files):

```bash
# These values must be provided privately by the local test operator.
export INQUIRY_LOCAL_DATABASE_URL="postgresql://tester:<LOCAL_TEST_PASSWORD>@127.0.0.1:54322/dioxyzine_rate_limit_test"
export INQUIRY_RATE_TEST_ACK="DISPOSABLE_LOCAL_TEST_DB"
node scripts/verify-inquiry-rate-limit-local.mjs
```

**Environment safety gates:**
- Both a specific acknowledgement and an exact disposable database name are mandatory.
- Only explicit loopback hostnames/IPs and port `54322` pass the connection parser.
- The script verifies the server-side database name and loopback interface before loading the SQL.
- It never reads the Production Supabase URL or tries to provision hosted resources.
- No test results are claimed until the script finishes against a real local PostgreSQL server. Normal GitHub CI runs only the safe Node connection-parser tests, not live SQL.

**CI solution verified on 2026-10-16:** the separate `.github/workflows/dioxyzine-inquiry-postgres.yml` uses PostgreSQL 17 in a disposable GitHub Actions service container. Run [38845419812](https://github.com/NhatNguyen2407/Project/actions/runs/38845419812) succeeded and its raw log reported 32 parallel attempts, 10 allowed, 22 denied, 6 grant checks, successful counter reset, denied unauthorized role execution and cleanup. The standard unit/build workflow [38845419740](https://github.com/NhatNguyen2407/Project/actions/runs/38845419740) passed on the same commit. This is **real PostgreSQL test evidence**, not evidence of deployment to Supabase Production. The draft rate limit SQL and direct INSERT/RLS cutover remain unapplied.

## Mocked HTTP inquiry flow tests — 2026-10-16

The server-side HTTP submission logic has been extracted into `supabase/functions/submit-inquiry/handler.mjs`. `index.ts` is a minimal Deno dependency-injection entrypoint. `tests/inquiryHttpFlow.test.mjs` exercises the **actual handler** in Node with synthetic credentials, request bodies, CAPTCHA responses, database writes and Auth responses.

Covered scenarios:
- Valid guest and authenticated form submissions; only verified user identity is stored and caller-supplied privileged fields are discarded.
- The normal Supabase publishable/anon bearer treated as a guest; invalid or expired user bearer rejected with HTTP 401 rather than silently treated as a guest.
- Wrong origin, preflight, wrong HTTP method, invalid payload/token/JSON/content type and request body over 16 KiB.
- Preverification and accepted budget denials (HTTP 429), unavailable RPC/Google/DB (HTTP 503), unacceptable action/hostname/score/freshness (HTTP 403).
- Google-rejected duplicate token, server-side insert failure, minimized response and sanitized logs.
- Request body is read with a bounded streaming reader instead of allocating an unbounded body then checking its size.

**Verification:** The test suite passed locally before commit and again in GitHub Actions run [38846722445](https://github.com/NhatNguyen2407/Project/actions/runs/38846722445). Separate real PostgreSQL grant/concurrency workflow [38846722462](https://github.com/NhatNguyen2407/Project/actions/runs/38846722462) passed its test step. All dependencies are simulated in the handler suite; **this is not a deployed Supabase E2E test**.

**Unresolved release gates:** real Edge Function runtime/HTTP CORS and Auth integration, API-key compatibility, independent idempotency, coordinated grant/RLS direct INSERT lockdown, end-to-end browser verification and rollback. The public production INSERT bypass remains open until deployed permissions are corrected. No paid services or production writes were used.
