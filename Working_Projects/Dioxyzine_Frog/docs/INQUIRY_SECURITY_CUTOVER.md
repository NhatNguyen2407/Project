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

## Idempotent Inquiry draft — 2026-10-16

- `docs/drafts/INQUIRY_IDEMPOTENCY_DRAFT.sql` adds a private RLS-enabled submission-key registry and a service-role-only `create_inquiry_idempotent` RPC. The function serializes attempts sharing the same UUID by transaction advisory lock; it inserts an inquiry and its key/hash record in **one database transaction**. The request hash is computed server-side from allowlisted validated input and verified user identity. Different data reusing a key is rejected.
- Browser `api.submitInquiry` now generates and reuses a random request key for identical form content after uncertain failures, and shares its in-flight Promise when the same form is submitted again concurrently. A new form gets a new key. Successful replay suppresses an extra best-effort Sheets mirror submission.
- Handler returns HTTP `201` for new entries, `200` for replayed entries and `409` for a key/content conflict. CAPTCHA, both rate budgets and Auth validation still run on retry before the RPC; this can reject a replay when quota is exhausted.
- Unit and mocked HTTP tests cover server-side hashing, changed fields/identity, key validation, replay and conflict behavior, and client source-contract safety.
- **Verified database evidence:** the disposable PostgreSQL 17 test job [38850650102](https://github.com/NhatNguyen2407/Project/actions/runs/38850650102) executed the new SQL after verifying its isolated database identity. It observed one insert and two same-key replays, rejected conflicting content, and denied direct `anon` execution. The Node/Vite workflow [38850650100](https://github.com/NhatNguyen2407/Project/actions/runs/38850650100) also succeeded. Additional tests added later require their own CI confirmation.
- **Not yet verified:** 24+ truly concurrent attempts for the same idempotency key, deployed Edge Function compatibility, authoritative Sheets mirroring/reconciliation after a lost response, and real RLS/grant cutover. No duplicate prevention is claimed for requests with different keys (even if their payload is identical). Keys survive retries in the same page session only, not a complete tab/browser restart.
- **Deployment status:** SQL is a draft file only, not a migration applied anywhere outside temporary CI PostgreSQL. PR remains Draft, no Production change, no new paid resources, no merge. Do not merge the frontend while the database RPC/function cutover and its rollback are unverified.

## 2026-10-16 — Same-key concurrency gate verified

- Implemented **24 independent concurrent PostgreSQL connections** in the disposable database idempotency test (not 24 sequential calls), with a synthetic trigger holding the first INSERT briefly to force lock contention.
- Verified the raw GitHub Actions log: **24 attempts, 1 created inquiry, 23 replays, all referring to the same UUID**. Changed-hash reuse was rejected, and an `anon` caller could not invoke the privileged RPC.
- Disposable PostgreSQL workflow [38853096918](https://github.com/NhatNguyen2407/Project/actions/runs/38853096918) completed successfully on commit `9abe0effe9f25110b4f8f6a6a5a1f6f19a2b30dd`. Normal Node tests and Vite build [38853096938](https://github.com/NhatNguyen2407/Project/actions/runs/38853096938) also passed.
- This confirms **database transaction concurrency for identical request keys** in disposable PostgreSQL 17. It is not evidence of deployed Supabase Edge Function/browser E2E, Production RLS cutover, or durability of the best-effort Google Sheets mirror.
- Both database SQL files are still DRAFT ONLY. No Production migration, deployment, paid resources, or PR merge occurred.

## Supabase browser/API-key/CORS compatibility — 2026-10-16

- The frontend uses `@supabase/supabase-js` `functions.invoke('submit-inquiry', ...)`; its public application key is sent as `apikey`, and logged-in users may send their session JWT as `Authorization: Bearer <jwt>`.
- `submit-inquiry` is explicitly scoped as `verify_jwt = false` in `supabase/config.toml`, **only for this function**, to allow guest inquiries and browser OPTIONS preflight. This is intentional because publishable keys are not JWTs. Do not disable JWT verification on other functions.
- The handler now requires `INQUIRY_PUBLIC_API_KEY` to be configured server-side with the **exact public client key**. The `apikey` request header must match; a missing/mismatched key or server-side misconfiguration fails closed **before rate-budget or Google calls**. This key is public: it is **not authentication**, anti-spam protection or a secret.
- Legacy anon JWT API keys and newer publishable keys are treated as application keys, not user identities. Any **different** bearer token must be verified by Supabase Auth `getUser` before inserting an inquiry; expired/invalid tokens are rejected. Backend secret keys and mismatched publishable bearer tokens are rejected.
- CORS preflight requires an approved storefront Origin, POST method and only headers allowed by the SDK. The Deno entrypoint imports `corsHeaders` from the pinned `@supabase/supabase-js@2.110.0/cors` export; actual Edge Function deployment and real-browser behavior are **not yet tested**.
- Local unit/mock HTTP tests cover valid guest/signed-in headers, denied/missing API keys, invalid bearer, unauthorized preflight and CORS header compatibility; GitHub Actions test/build and isolated PostgreSQL workflow are checked for each revision.
- **Release blocker:** the configured key must match the deployed frontend key, the Supabase function environment must contain the exact expected `INQUIRY_PUBLIC_API_KEY`, and real guest and authenticated `functions.invoke` calls need a deployed isolated test runtime. Do not put service-role/secret keys in `VITE_*` or public GitHub documents. **Production RLS direct INSERT remains vulnerable until a coordinated cutover.**

## Disposable Deno HTTP runtime verification — 2026-10-16

- A dedicated CI workflow `.github/workflows/dioxyzine-inquiry-deno.yml` uses standard public-repo GitHub Actions, a temporary Deno v2 environment, and synthetic data only. It does **not** create a Supabase project or connect to Production.
- The workflow first performs `deno check supabase/functions/submit-inquiry/index.ts`, validating the pinned `npm:@supabase/supabase-js@2.110.0` dependency and the SDK CORS import. It then runs a local Deno HTTP server with the **actual shared inquiry handler** and mocked Supabase Auth/RPC/Google verification.
- Deno runtime tests send real HTTP requests to `127.0.0.1`, including `supabase.functions.invoke('submit-inquiry')` from the pinned SDK. They check guest success, authorization failure and signed-in identity, preflight CORS with accepted/denied headers/origins, bad CAPTCHA and replay responses. No non-loopback HTTP calls or real customer data are used.
- **Verified runs for commit `2beb5d93ae302421d651b7d8019027858a3f1b5d`:** [Deno HTTP workflow 38868378295](https://github.com/NhatNguyen2407/Project/actions/runs/38868378295) PASSED (4/4 HTTP tests + Deno entrypoint check); [PostgreSQL 38868378277](https://github.com/NhatNguyen2407/Project/actions/runs/38868378277) PASSED; [Node/Vite workflow 38868378263](https://github.com/NhatNguyen2407/Project/actions/runs/38868378263) passed its test and Vite build steps.
- The Deno suite lives in `scripts/inquiry-runtime-smoke.mjs`, outside the Node `tests/*.test.mjs` discovery glob. Initial CI failures from Deno dependency initialization, missing optional type annotations, and test discovery were corrected before this verified run.
- **Boundaries:** the Deno server uses the real handler but **mocked** service clients, not a deployed Supabase function. This is not a proof of hosted JWT gateway behavior, real Google CAPTCHA, database permission cutover, real browser cross-origin execution, or end-to-end resilience. P0 direct REST INSERT remains OPEN in Production. PR #21 remains Draft and unmerged; no paid resource, migration or deployment was performed.

## 2026-10-16 — Feedback-to-Sheets isolation checkpoint

- Audit found `api.submitFeedback` still made an unconditional POST to the hard-coded Google Apps Script. The separate Inquiry mirror guard did **not** cover this route: an isolated Vercel Preview could still write feedback to the real Sheet.
- Added `maySubmitFeedbackToSheets` to require both exact build environment `production` and the known Production Supabase URL. Preview, local and Staging now **fail closed** before any Feedback POST.
- Kept the existing Production Feedback behavior without requiring a new opt-in; the optional Inquiry backup mirror remains **OFF** unless explicitly enabled with its own `VITE_ENABLE_INQUIRY_SHEETS_MIRROR` flag.
- PR #21 now incorporates the Preview Supabase build-time isolation guard already merged into `main`, plus the Vercel environment value exposed to client policy. This prevents losing the already-released guard if the stale Draft branch were merged.
- Added pure policy/environment matrix tests and a source-contract check for Feedback; browser/network verification and the eventual merging of #19/#21 still require separate release gates. `api.fetchProducts` can still READ the configured Google Sheet; replacing the read-side feed needs a separate source-of-truth decision in Phase 3.
- No Production write, service configuration change, Edge Function deployment or PR merge occurred. Exact-HEAD CI and Preview results should be recorded after this change is pushed.

## 2026-10-16 — Inquiry form duplicate-submit and image race hardening
- Source audit identified two potential React UI race conditions: old uploaded image URLs persisted during replacement and multiple synchronous submit calls could begin before `status=loading` rerendered.
- Added `createInquiryFormGate` as a synchronous in-memory guard, clears the attached URL on replacement, ignores stale upload completions, and prevents submit while an image is still uploading or a submit is in progress. Image picker is disabled during submission.
- Added five pure/UI-contract tests for concurrent upload, last-selection-wins and duplicate submissions. This is a frontend safety improvement, not a replacement for backend idempotency in `submit-inquiry`.
- PR #21 remains Draft. Update the pinned version in PR #19's combined-source workflow after the new SHA and CI are verified. No hosted Storage uploads or Production modifications.

## 2026-10-16 — Guest upload signing backend prepared (Staging only)
- Added `issue-inquiry-upload` as an independent draft Supabase Edge Function, **disabled unless** `INQUIRY_UPLOAD_STAGING_ENABLED=true` and `SUPABASE_URL` is the exact known Staging project.
- It requires an allowed exact Origin, public caller-key check, strict 1 KiB metadata allowlist, PNG/JPEG/WebP and <=5 MiB declaration, independent atomic database quotas (60 attempts/min and 12 issued/hour), and server-verified reCAPTCHA **action `inquiry_upload`**. It returns a random `guest/<UUID>.<ext>` path and scoped Supabase signed upload token; never exposes a service-role key.
- The Supabase token can be valid for **two hours**. A token is NOT proof of a completed upload, a one-time database claim, file-content validation, or a durable Inquiry attachment. No frontend guest integration or trusted ticket reconciliation exists yet. **Do not deploy or enable** until those elements, cleanup policy and hosted RLS tests are implemented.
- Expanded the *draft-only* `consume_inquiry_rate_budget` allowed scopes to include `upload-preverify` and `upload-issued`. No SQL was applied to Production or Staging. The function intentionally fails closed if the budget RPC does not exist.
- Added source/handler tests; release and migration remain blocked pending isolated tests and coordinated Inbox/Inquiry/storage review. Neither Draft PR is eligible for merge from this change alone.

## 2026-10-16 — Staging upload ticket and atomic Inquiry association draft
- After auditing `issue-inquiry-upload`, `submit-inquiry` and Staging schema, added server-side **ticket registration before signed upload token issuance**. Registration failure returns 503 without a token. No direct public upload policy was introduced.
- In explicitly enabled Staging mode, the Inquiry validator now accepts **only** `storage://inquiry-test-references/guest/<UUID>.(png|jpg|webp)` references, rather than arbitrary HTTPS URLs. Production keeps the established Cloudinary HTTPS contract.
- Added **review-only SQL** `docs/drafts/INQUIRY_UPLOAD_TICKET_BINDING_DRAFT.sql`: private ticket ledger, service-role-only registration RPC and an atomic extension of the existing idempotent Inquiry insert. The DB checks a real Storage object, MIME and exact declared size, age <= 2 hours, and single-use claim in the same transaction. Missing, expired, mismatched, unregistered or already claimed objects fail the transaction.
- The SQL is NOT APPLIED, and PostgreSQL runtime/permissions for this extension are NOT YET VERIFIED. Source/unit tests cover request rules and ordering, not Postgres runtime. An unclaimed ticket after signing failure still needs a retention cleanup policy. A private `storage://` identifier is durable, **not** an HTTP view URL; an authorized Admin signing endpoint/UI is still required.
- Both PRs remain Draft. Do not enable this until the reviewed SQL works in a disposable database, secure guest frontend upload is wired, and hosted synthetic E2E/rollback gates pass. No Staging/Production DB mutation or Edge Function deployment.

## 2026-10-16 — Frontend private-reference contract and isolated SQL transaction drill
- InquiryPage now passes a **lazy**, upload-only reCAPTCHA action to the image provider. The Production Cloudinary provider does not need the extra token. The private `storage://` identifier is not opened as a browser URL; Staging displays an attachment confirmation only.
- Added `.github/workflows/dioxyzine-inquiry-upload-ticket.yml` and synthetic disposable SQL test with a new loopback-only PostgreSQL 17 container. Exercises actual base idempotency + new ticket SQL, grants, bad path/MIME, missing object, mismatched metadata, replay, single-use claim and expired ticket. This is a simulated Storage *metadata table*, not real HTTP uploads or hosted Supabase.
- GitHub SQL workflow and CI outcome: **PENDING** until verified on the final SHA. No Production/Staging SQL or Edge Function deployment.

## 2026-10-16 — Disposable SQL drill first-run corrections
- Initial isolated PostgreSQL 17 workflow uncovered invalid schema qualification of SQL special expression `COALESCE`; fixed to built-in `coalesce(...)` in draft function. No hosted schema change.
- Application source-contract test updated to match lazy `uploadImageToCloudinary(file, captchaProvider)` call, without weakening the relative ordering check.
- Re-run exact-HEAD CI and disposable SQL drill before marking successful.

## 2026-10-16 — Hosted synthetic Staging Inquiry backend candidate
- Read-only preflight confirmed 0 Staging inquiries, 0 Auth users, 0 uploaded objects, one Private 5MiB bucket, expected synthetic product/order, and no new quota/idempotency/ticket RPCs or private backend tables. The unrelated existing `consume_inquiry_quota` stays untouched.
- Consolidated the three reviewed SQL drafts in `docs/staging/STAGING_INQUIRY_BACKEND_FOUNDATION.sql` as one transaction with synthetic Staging preflight and postflight grants/RLS checks. Only apply to project `bvnnmvlfcduwmneipmsi` once the exact bundled migration has passed disposable CI.
- Disposable PostgreSQL test now executes that same bundle rather than separate drafts. Supabase Edge Functions remain undeployed and Preview upload opt-in remains OFF until independent CAPTCHA/secrets/E2E readiness. No Production change.

## 2026-10-17 — Staging Admin Inbox and private image reader (Draft)
- A new read-only `admin-inquiries` Edge Function offers bounded list and on-demand 60-second private reference link actions. Disabled unless Staging URL and `INQUIRY_ADMIN_READ_STAGING_ENABLED=true` are set. Not deployed.
- Caller must have a verified Supabase Auth session and server-checked `user_roles.role=admin`; an apikey, Origin or client role value alone does not grant access. The client never supplies an arbitrary Storage object path. No anon Storage SELECT policy added.
- Mock tests verify denial for guests/non-admins/wrong environment, input allowlist and short-lived signed URLs. Hosted Staging has zero Auth users and the foundational migration remains blocked; hosted Admin E2E and UI wiring remain separate release gates.
