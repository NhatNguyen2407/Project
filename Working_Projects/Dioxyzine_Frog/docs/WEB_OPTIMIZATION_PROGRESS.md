# Dioxyzine Frog — Debug & Optimization Progress

**Last change batch:** 2026-10-18 · Hosted Inquiry/Admin/Tracking and Sandbox capture acceptance (Draft PRs #19/#21)
**Status rule:** Change labels distinguish SOURCE FIXED, CI VERIFIED, HOSTED TESTED, RELEASED and DEFERRED. A green build does not imply runtime E2E or Production release.

## Total roadmap

| Phase | Workstream | Current stage | Release gate |
| --- | --- | --- | --- |
| 1 | Baseline, Safety, Recovery, Regression | Step 1 baseline completed; Preview guard merged in PR #18; Step 2 restore **partial**; Step 3 automated CI established, browser/E2E **deferred** | Restore drill, runtime identity, sandbox tests and final acceptance still open |
| 2 | Website Hardening | **Draft implementation in progress**: PR #19 covers Checkout/Admin/Inbox; PR #21 covers Inquiry; neither merged | Test isolated Checkout, Admin, server Inquiry and coordinated RLS/Edge Function cutover |
| 3 | Data Integration | **Not started** | Establish Supabase/Sheets source of truth and sync rules after stable website |
| 4 | PA Foundation | **Not started** | Confirm roles, dashboard, reminders and permitted operations |
| 5 | AI Integration | **Not started** | Tool permissions, evaluations, safe actions and monitoring |

## Phase 1 substeps

| Step | Status | Evidence | Remaining |
| --- | --- | --- | --- |
| 1. Production baseline | DONE | Inspected deployed `main`, live DB and Vercel metadata | Reconfirm production SHA when approving release |
| 2. Recovery & isolation | PARTIAL | Dedicated Staging, Preview build guard PR #18 merged; synthetic 8-table Staging with RLS | Windows local network/restore drill; Stage parity, external providers |
| 3. Tests & CI | AUTOMATED PASS / E2E PENDING | Node CI, disposable PostgreSQL tests, Vite builds and Preview CI on earlier reviewed commits | Final candidate CI, browser RLS/API, PayPal Sandbox, email/storage tests |

## Phase 2 optimization ledger

| Area | Source/CI status | Release status | Known limit |
| --- | --- | --- | --- |
| Checkout payment ambiguity | SOURCE FIXED, previous CI PASS; new gate added to Draft #19 | NOT RELEASED | Client in-memory lock resets on reload; server idempotency, PayPal Sandbox reconciliation pending |
| Admin shipping status | SOURCE FIXED, previous CI PASS in Draft #19 | NOT RELEASED | Confirm real RLS/row updates and sandbox email |
| Admin review reply & visibility | SOURCE FIXED: row confirmation plus canonical `order_reviews`/legacy `inquiries` selection and de-duplication | NOT RELEASED; CI PENDING THIS COMMIT | Hosted admin role, trigger mirroring and RLS E2E pending |
| Admin product/voucher create/save | SOURCE FIXED in this batch: explicit returned-row confirmation | NOT RELEASED; CI PENDING THIS COMMIT | Synthetic authorized admin E2E pending |
| Admin Preview mutation guard | SOURCE FIXED in this batch: all eight handlers blocked outside verified Production | NOT RELEASED; CI PENDING THIS COMMIT | Frontend guard is not backend authorization; check browser behavior |
| Inquiry API / idempotency / Sheets mirror | SOURCE FIXED; previous CI PASS in Draft PR #21 | NOT RELEASED | Coordinated Edge Function/RLS cutover and hosted tests pending |
| Staging storefront | 8 synthetic tables with RLS, fixture rows, catalog guest reads | STAGING ONLY | Public tracking RPC migration prepared but application BLOCKED |
| Automated integration | Earlier PR #19/21 CI and disposable Postgres PASS | NOT A LIVE PRODUCTION GUARANTEE | Local restore / full Staging E2E explicitly deferred |

## Every-fix update protocol

For **each future optimization batch**: (1) inspect current PR head and dependency state; (2) update implementation and regression tests; (3) modify this progress ledger in **the same commit**; (4) obtain exact-commit CI and Preview result; (5) append verified outcomes to Issue #17 and tell the owner which Phase/Step has advanced. Do not mark tests complete before execution, merge blocked PRs or edit Production without passing release gates.

## Deferred acceptance

See [POST_OPTIMIZATION_ACCEPTANCE.md](./POST_OPTIMIZATION_ACCEPTANCE.md) and [Issue #17](https://github.com/NhatNguyen2407/Project/issues/17). Never place personal records, tokens, transaction IDs or private backups in commit history.

## CI regression and resolution
- Initial PR #19 commit `1d248d4` failed 1 of 42 Node tests (`externalServicePolicy.test.mjs` still expected the old inline Admin guard). Vercel Preview built READY; the failed test prevented Node CI from reaching the build step.
- New guard is centralized in `allowAdminWrite()` and called at the start of each mutation. Updated the source-contract test to verify **both** the central environment check and the per-handler early return; no runtime production semantics changed. Validate new exact-HEAD CI before marking this resolved.

## 2026-10-16 — Admin Reviews canonical and legacy model
- Read-only audit verified that Production `order_reviews` has Admin SELECT/UPDATE RLS and triggers syncing `order_reviews` to legacy `inquiries` using `order_review_id`. Do not double-write.
- Draft #19 now reads canonical and legacy rows, removes linked duplicates, shows product names and routes replies/hide to the row's original table only. Database row confirmation remains required; tests cover dedup and authorization-target allowlist.
- No Production schema/data change. Exact-commit CI and Preview verification PENDING; final browser test with Admin account and trigger propagation DEFERRED until post-optimization acceptance.
- Roadmap remains: Phase 1 Step 1 DONE; Step 2 PARTIAL, Step 3 source CI present but E2E DEFERRED. Phase 2 improving unreleased source; Phases 3–5 NOT STARTED.

## 2026-10-16 — Combined Draft PR integration CI
- Read-only inspection of Draft PR #19 `66b343e` and Draft PR #21 `d6bc1ec` found only two overlapping App paths: `vite.config.ts` and `scripts/check-preview-backend.mjs`. Guard scripts are byte-identical, and Vite configs differ by a single non-functional comment; no other App source overlaps.
- Added a **temporary virtual-source integration workflow** at `.github/workflows/dioxyzine-phase2-integration.yml` (on Draft PR #19). It pins the exact reviewed PR #21 SHA, fails on a moved head or unexpected overlapping edits, overlays only distinct Inquiry source files onto an ephemeral GitHub Actions worktree, then runs frozen pnpm install, combined Node tests and a Vite Preview build with synthetic build-only variables.
- This does **not** merge either PR, deploy the combined app, exercise a real Google/PayPal/Supabase endpoint, or prove browser runtime. Exact-commit workflow result is **PENDING** until GitHub Actions completes; record the result in Issue #17 without adding a new code commit.
- Existing constraints: PR #19 deliberately disables Cloudinary uploads on Preview while PR #21 Inquiry form requires a design image; full Inquiry browser success E2E stays DEFERRED until an isolated test-only upload flow is approved. No Production migration, sensitive data import or live payment allowed.
- Roadmap unchanged: Phase 1 baseline DONE, Recovery PARTIAL, automated CI implemented / full E2E PENDING; Phase 2 unreleased code optimization in progress; Phases 3–5 NOT STARTED.

## 2026-10-16 — Cloudinary Preview isolation prepared
- Cloudinary account inspected: Free plan; current Vercel Preview and Production use identical cloud names **and** unsigned upload presets (verified by comparing values without publishing them). Therefore prior Preview upload blocking was necessary.
- Created only the empty folder `DioxyzineFrog_Staging/Inquiry_References`. A folder alone **is not security isolation**. Connector cannot create or manage upload presets, so no preset or upload was provisioned, and the Preview opt-in remains unset.
- Draft PR #19 introduces a Preview-only upload configuration requiring an explicit opt-in, a **separate Cloudinary cloud** and a **different preset**, matching Supabase Staging. It also checks returned URL and public ID prefix. Until all conditions hold, Preview continues to deny uploads. This is an operational client guard, not a server security boundary.
- A dedicated staging cloud/account, a restricted unsigned preset targeting the folder, and explicit Vercel Preview-only variables remain **operator setup pending**. No images, customers, Production data or Cloudinary account settings were changed. Exact-commit CI awaits verification.
- Roadmap: Phase 1 Recovery/E2E still pending; Phase 2 Preview upload path CODE PREPARED but not hosted-tested or released; Phases 3–5 not started.

## 2026-10-16 — Replace Preview Cloudinary with Supabase Storage Staging
- The owner opted not to maintain a second Cloudinary account. The existing Supabase Staging project has zero Storage buckets and no object policies. This batch replaces the previous unused Preview Cloudinary-cloud/preset option with a private Storage bucket proposal named `inquiry-test-references`.
- A Staging-only migration `docs/staging/STAGING_INQUIRY_STORAGE.sql` contains synthetic-project and empty-bucket preflight checks, private 5 MiB image bucket and owner-folder RLS for `authenticated` INSERT/SELECT only. No guest/anonymous upload policy, UPDATE or DELETE.
- Preview selects Staging Storage only when the backend URL exactly matches the Staging project and `VITE_ENABLE_STAGING_STORAGE_UPLOAD=true`; otherwise it fails closed. Production retains Cloudinary. Only synthetic images for Staging test accounts; the client returns a one-hour signed private image URL (ephemeral, not durable). Guest Inquiry upload remains blocked pending a trusted token issuer and quota.
- Code/test status **PENDING CI** until final SHA verified. Applying Staging migration is a separate authorized operation and must be independently confirmed. No Production changes; PRs #19/#21 remain Draft.
- Phase 1 still baseline DONE, Recovery PARTIAL, E2E PENDING; Phase 2 source optimization ongoing; Phase 3 Data Integration not started; Phases 4–5 not started.

## 2026-10-16 — Storage content verification + guest upload plan
- Read-only verified private Staging Storage bucket, two authenticated owner-folder policies, **zero** Staging Auth users and **zero** Staging Edge Functions. No hosted upload can be marked E2E PASS in this state. Security Advisor reports five pre-existing INFO-only deny-by-default application tables without policies.
- The Staging client now checks PNG/JPEG/WebP magic bytes before an Auth or Storage call, in addition to MIME and 5 MiB bucket limits. This is a client-side test hardening step, NOT server-side malware/content validation.
- Added `docs/staging/INQUIRY_GUEST_UPLOAD_DESIGN.md` with the trusted signed-upload issuance, rate limiting, Auth/CAPTCHA policy, durable private object-path reference and short-lived URL constraints. **No public guest endpoint, service key, schema permission change or upload was introduced.**
- Unit test/combined CI result for this source patch is PENDING. After verified tests, operator-gated Staging synthetic Auth user, owner/cross-user permissions, actual browser upload and guest issuance implementation remain deferred.
- Roadmap: Phase 1 baseline DONE, Recovery PARTIAL, CI available / E2E pending; Phase 2 Draft security and upload foundation improving but not released; Phases 3–5 NOT STARTED.

## 2026-10-16 — Combined PR re-pin after Inquiry race fix
- PR #21 commit `745593e` fixes stale upload URL attachment and duplicate simultaneous Inquiry submit on the frontend. Its three workflows (App CI `38916425012`, Deno `38916425063`, PostgreSQL `38916425077`) SUCCESS; Vercel Preview `dpl_6yERDVTJvw1RZoN3ByB8QqbCbaZR` READY.
- Combined-source CI pin updated from old PR #21 HEAD to `745593e`; verify next combined run before marking integrated. Both PRs stay Draft and the backend cutover remains deferred.
- Roadmap remains Phase 1 baseline DONE, Recovery PARTIAL and E2E PENDING; Phase 2 source optimization ongoing (not released); Phases 3–5 NOT STARTED.

## 2026-10-16 — Staging guest upload issuer integration
- Draft PR #21 at `b3a042f` adds staging-only signed-upload authorization, separate quota scopes, CAPTCHA action validation and source tests. App CI `38918095080`, Deno runtime `38918095208`, Postgres drill `38918095197` SUCCESS. Staging enablement, upload completion verification, object-to-Inquiry binding, cleanup and browser E2E remain **not implemented**.
- Combined PR #19+21 pin updated to this reviewed SHA; verify combined CI at the new PR #19 commit. No merge/Production mutation. Phase 2 security source work progressed but is not released; Phase 1 Recovery/E2E pending; Phases 3-5 not started.

## 2026-10-16 — Guest upload ticket / Inquiry association source gate
- Draft PR #21 at `8cce7aa` includes registered upload tickets, staging-only canonical private object reference validation, and a review-only atomic Storage-to-Inquiry SQL extension. **The SQL has not been applied or exercised against PostgreSQL and is NOT release-ready.** No frontend guest flow, private-image Admin display or cleanup is claimed.
- PR #19 combined source CI pin updated to this reviewed PR #21 head. Run CI on final PR #19 SHA and record results under Issue #17. Phase 2 advances in Draft source design, Phase 1 acceptance pending, Phase 3-5 not started. No Production deployment or DB updates.

## 2026-10-16 — Guest image upload frontend integration
- PR #19 now routes Preview Inquiry upload through the Staging-only `issue-inquiry-upload` Edge Function and `uploadToSignedUrl` and passes back canonical `storage://inquiry-test-references/guest/<UUID>.<ext>` references. This preserves the Production Cloudinary uploader.
- Preview remains opt-in gated by `VITE_ENABLE_STAGING_STORAGE_UPLOAD=true`, the exact known Staging backend and the separate server `INQUIRY_UPLOAD_STAGING_ENABLED=true`. The Edge Function, budget/ticket RPC drafts and Staging secrets are NOT deployed/enabled. No hosted upload E2E is claimed.
- Added mocked guest upload tests for success, CAPTCHA, invalid bytes, bad ticket, forged bucket/path and signed-upload error. CI verification is pending at final commit.
- Roadmap: Phase 1 Recovery/hosted E2E partial; Phase 2 source integration progressing but unmerged; Phases 3–5 not started.

## 2026-10-16 — Combined ticket SQL and guest uploader regression gate
- PR #21 `6cbacff` completed the new disposable PostgreSQL 17 ticket SQL drill (real SQL on synthetic schema), Application CI, Deno Runtime and existing Postgres Drill; all 4 workflows SUCCESS. **Not** a hosted upload test.
- Combined PR #19 workflow pin updated to PR #21 exact reviewed SHA. Recheck source tests/build after this PR #19 commit before accepting this batch. Staging server enable flags remain OFF. No live service writes or merges.

## 2026-10-17 — Admin private Inquiry image reader release gate
- PR #21 `3aea043` introduced disabled-by-default, Staging-only read-only `admin-inquiries` Edge Function. Verifies caller Auth and `user_roles.role=admin` server-side, lists at most 100 allowed Inquiry fields, and creates on-demand 60-second signed download links only from canonical stored private references. No browser-supplied object path or public Storage read policy.
- Exact PR #21 App CI `38994143225`, Deno runtime `38994143203`, rate PostgreSQL drill `38994143183` and upload-ticket SQL drill `38994143206` all SUCCESS. Source tests do not verify hosted Auth roles or actual signed URL access.
- Combined PR #19 pin updated to exact PR #21 HEAD. Hosted migration blocked, Staging Auth user count zero, function not deployed, admin UI integration deferred. Phase 2 still Draft/not released; Phase 1 Recovery/browser E2E pending; Phases 3–5 not started.

## 2026-10-17 — Admin Inbox Preview read-only source integration
- Draft PR #19 Admin Inbox now uses the staged `admin-inquiries` Edge API only with `VITE_ENABLE_STAGING_ADMIN_INQUIRIES=true`, Vercel Preview and the exact synthetic Staging Supabase URL. Other non-Production environments return zero Inquiry records without attempting a direct client SELECT. Verified Production retains the existing RLS-backed list and HTTPS references.
- On-demand private references are requested by Inquiry ID; the client rejects signed URLs that are not for the stored exact object, and keeps validated URLs in in-memory React state for at most 55 seconds. There is no service key in the browser. Auth and `user_roles.role=admin` remain server checks in Draft PR #21; the interface flag is NOT an authorization decision.
- Staging Admin function not deployed and both client/server switches remain OFF. Source/UI mock tests added, CI result pending final commit; hosted user-role and Storage E2E remain release gates. Production unchanged.
- Roadmap Phase 1 baseline DONE/Recovery PARTIAL/E2E deferred; Phase 2 code and source integration progressing but NOT RELEASED; Phases 3–5 not started.

## 2026-10-17 — Recovery evidence and upload metadata regression
- Completed an offline database restore with network disabled and no published ports: 41 data-table row counts matched; compared 43 tables, 439 columns, 35 function definitions, 22 RLS policies, ACLs and triggers. Role/paid-tracking/rollback probes passed. Recovered and verified all 8 Storage backup files (size and MD5 against snapshot metadata, SHA-256 manifest). Private backups remain local. This does not establish full hosted platform recovery, OAuth, Storage API re-upload or off-device backup readiness.
- PR #21 `116e9e7ac145d185a8dbfe398d7021da08d40d5d` fixes missing/null MIME acceptance in the ticket transaction, rejects malformed sizes without numeric overflow, and maps invalid references to HTTP 400. Regression reproduced before the fix and passed afterward on isolated PostgreSQL 17. Backend Node suite: 98 local tests PASS.
- Updated Combined Source CI pin to that exact backend SHA. Reviewed changed-file intersection: only the previously reconciled Vite config and Preview guard overlap; neither changed in this backend patch. Final remote CI results remain to be verified after this frontend commit.
- Owner confirmed no separate Staging reCAPTCHA keys yet and requested code/tests first. No hosted SQL, secrets, Edge functions or upload flags changed. Actual server image-content verification and hosted upload/Auth/Admin E2E remain release gates; no claim of complete upload security.
- Phase 1 offline recovery evidence advances, platform recovery/E2E remain incomplete. Phase 2 remains Draft. Phases 3-5 not started. No Production release or PR merge.

## 2026-10-17 — Server image verification and integrated local acceptance
- Backend Draft PR #21 `811c31d1571bba0a05d94b5ea6480789f681f71b` now downloads only the exact private Staging object, bounds bytes/time, compares actual checksum and MIME, and decodes PNG/JPEG/WebP with pinned ImageMagick WASM. Animated PNG/WebP are rejected; each side is bounded at 2048 pixels. Decoder cache limits are not total Edge memory guarantees.
- New `create_verified_inquiry_idempotent` RPC fails closed against older backends, issues a no-write verification challenge and atomically rechecks metadata, writes the Inquiry, claims the ticket, saves verified SHA-256/time and records the stable request key. A completed retry returns the original ID without downloading again. Signed upload creation explicitly disables upsert.
- Local evidence: 109 Node tests PASS; all 3 Inquiry Edge entrypoints type-check; 5 Deno HTTP/WASM tests PASS; disposable PostgreSQL regression PASS. The combined local HTTP/WASM/PostgreSQL test passed all 3 image formats, issuer/upload/submit/Admin retrieval, guest/member denial, signed expiry, retry after deletion, corrupt/spoofed/stale rejection and four concurrent submissions creating exactly one record. CAPTCHA, Auth identity and Storage HTTP transport are synthetic doubles, not hosted acceptance.
- Two Staging endpoint configs now declare handler-managed authorization/CORS. Actual Admin Auth.getUser plus database role checks remain required. No hosted function, SQL, secret or enable flag changed.
- Combined Source CI pin advanced to this reviewed backend revision. Only the previously reconciled Vite config and Preview guard overlap, and neither changed in this patch. Remote checks remain pending at the final commits until verified.
- Next: real Edge WASM packaging/resource checks, real signed-upload ETag/non-overwrite behavior, actual Auth/Admin/Storage E2E, cleanup/abuse controls and browser acceptance after separate Staging reCAPTCHA is configured. Both PRs remain Draft; Production unchanged. Phase 2 source acceptance advances; release and Phases 3-5 remain pending.

## 2026-10-17 — Combined Preview, Staging CAPTCHA and inclusive image boundary
- Created a real combined source branch `codex/inquiry-staging-candidate` at `ca1e8d23744fefee0c62cf03fda512d9df1e0876` from PR #19 `07ff3b0` and PR #21 `811c31d`. This matters because PR #19 alone does not contain PR #21's submit API/form files. Combined Node suite: 155 PASS; frozen dependency install/build PASS. No PR merged into main.
- Created separate Staging reCAPTCHA v3 site 770957295 after owner approval, restricted to `dioxyzinefrog-git-codex-inquiry-staging-ac4daa-bibii-s-projects.vercel.app`. Saved its secret only to Supabase Staging, and a Config `VITE_RECAPTCHA_SITE_KEY` override only for this Preview branch. Existing Production/shared key unchanged.
- Vercel redeploy `4v3z4C1uwDPwQebX3ZZ8PdyipY5b` READY, source `ca1e8d2`, Preview, URL `dioxyzinefrog-7ozx1j449-bibii-s-projects.vercel.app`; verified directly in the authenticated dashboard. Browser navigation into the branch alias was interrupted by Computer Use URL-confidence enforcement, so no claim of CAPTCHA execution or browser E2E success.
- Local Edge Runtime v1.77.4 bundled npm/WASM successfully and decoded real PNG/JPEG/WebP with no external network/source/npm cache at runtime. Boundary testing found an exclusive area comparison rejecting valid 2048x2048 files. Backend `6b751d9e218d39b20b72f76e2a70b23e79ab9c2a` fixes only the area threshold (+1 pixel), preserving width/height 2048, cache 64 MiB, disk disabled. All three 2048 fixtures pass; all three 2049 fixtures fail. Real Deno boundary regression added.
- Backend local: 109 Node tests, 5 Deno tests, 3 entrypoint type checks and HTTP/WASM/PostgreSQL integration PASS. Combined Source pin updated to the new backend SHA; remote CI must be verified for these new commits.
- Staging audit: public Inquiry INSERT already denied for anon/authenticated, service_role allowed. Hosted SQL/functions and all upload/Admin switches remain unchanged. Actual hosted runtime, Storage ETag/non-overwrite, Auth/Admin, URL expiry and browser end-to-end acceptance remain open. Both PRs Draft, no Production release.

## 2026-10-18 — Hosted acceptance and bounded CAPTCHA upload fix
- Supabase Staging foundation applied and all three Inquiry functions deployed with handler-managed authorization. Service-only RPC grants and denied client INSERT verified. Production unchanged.
- Real hosted Storage/Auth: 19 checks PASS. Admin API: 9 checks PASS with a management-seeded fake Inquiry, private image download and actual 60-second signed URL expiry. This fixture is not a browser-submitted Inquiry or proof of real CAPTCHA submission.
- Browser upload returned HTTP 413 because the issuer's 1024-byte JSON limit was smaller than a supported CAPTCHA token. Backend `fb1da72f29c9620cc2d945a0921a42e6e70c956a` uses a bounded 16,384-byte body, preserves the 8192-character token limit and returns 413 for oversized streams. Regression reproduced then fixed; 111 backend Node tests and changed Deno entrypoint type-check PASS. Hosted 8250-byte bogus-token request reaches CAPTCHA and returns 403. No claim of valid CAPTCHA acceptance.
- Both server switches now OFF (HTTP 503 verified), branch-specific Preview upload variable false, temporary Admin role removed (database count zero). Next candidate build must incorporate the false flag. Two labeled synthetic users, two fake objects and one seeded Inquiry remain; no email/payment/customer data produced.
- Combined CI pin updated to this backend SHA. New remote CI and candidate Preview must be checked after publication. Full browser upload/submit, hosted decoder resource checks, Admin UI role access, recovery and other release gates remain open. Both PRs remain Draft; Phases 1–2 incomplete, Phases 3–5 not started.
- Detailed backend evidence: `docs/staging/HOSTED_ACCEPTANCE_20261018.md`. No desktop control needed for this checkpoint.

## 2026-10-18 — Real browser Inquiry passed; auth lifecycle fixed
- Real browser CAPTCHA upload and submission now PASS on protected Staging. UI shows Submitted Successfully; database has one Inquiry with matching claimed upload, verified SHA-256 and idempotency record. This is separate from the management-seeded reader fixture. Hosted WASM decoded the real private upload.
- Backend `e06f5e5880acb0cd1d671b2a9cd11ed65052fcaf` corrects challenge-load timestamp handling: Google's siteverify enforces token expiry/single use; a long-open form is no longer rejected for a fresh valid token. Expected action/hostname/score, valid timestamp and server provider verification remain mandatory. Backend 112 Node tests and type-checks PASS. Detailed evidence and Google source links: `docs/staging/HOSTED_BROWSER_20261018.md`.
- Applied Staging-only role self-read with column SELECT and owner RLS. Eight hosted Auth/API checks PASS; guests/cross-user reads and all browser role writes stay denied.
- AuthContext now schedules role lookup outside synchronous Auth callbacks and invalidates stale requests after signout/account change/unmount. Missing roles and failures reset to customer. Removed LoginPage session/JWT console logs. Four regression tests PASS; frontend total 58 PASS.
- Temporary upload/Admin switches and the synthetic Admin assignment are enabled only for this controlled acceptance session and must be closed at its end. Production unchanged, both PRs Draft. Admin browser acceptance and remaining release gates require their own evidence.

## 2026-10-18 — Admin/Tracking accepted; isolated Sandbox prepared
- Admin browser now signs in, lists the real synthetic Inquiry and opens its private 2x2 image. Staging Inbox fetch is independent of other denied Admin tables. Refreshed sessions keep resolved pages mounted, while account changes invalidate stale roles; five Auth lifecycle regressions pass.
- Signed-in Inquiry upload and a 2048x2048 pseudo-random PNG submission passed on hosted services. Supabase shutdown telemetry: 382 ms CPU, 52,000,408 bytes memory; this is a shutdown sample, not a universal peak bound. Backend `34ae349eb4f2bf764396804aae2a06973de60b75`: 113 Node tests PASS.
- Owner separately approved Tracking Staging. Installed its guarded synthetic-only five-field lookup; all five HTTP cases PASS and the browser displays the paid fixture. Direct orders access remains denied.
- Owner confirmed an existing PayPal Sandbox and signed into Developer. Verified Dio Test credentials against Sandbox OAuth, stored secret only on Supabase Staging, and set public client/mode/opt-in only on the candidate Preview branch. Live credentials/settings unchanged.
- Added a guarded service-only SECURITY INVOKER checkout foundation for synthetic Staging. Hosted transactional probe verifies replay creates one order and decrements stock once, then rolls back; original stock restored. Anonymous/member RPC execution stays denied.
- Fixed capture normalization crashing for multi-product carts, shared canonical normalization between create/capture, and added a stable provider PayPal-Request-Id for capture retries. Pinned SDK/lockfile, explicit Production-live vs Staging-Sandbox routing and separate Preview opt-in; email/other live services stay blocked on Preview. First hosted Sandbox order creation returned 200 with the server-calculated amount. Capture/browser checkout acceptance is still in progress.
- Frontend: 64 Node tests PASS; both payment entrypoints type-check. CI now checks those entrypoints without credentials. Temporary access must be closed after controlled acceptance; no Production release or PR merge.

## 2026-10-18 — Sandbox capture/replay accepted; temporary access closed
- Hosted PayPal Sandbox capture succeeded for the server-calculated USD 27 synthetic order. A repeat and four concurrent capture retries returned the same order; stock changed once, 5 to 4, and one reservation was consumed. Changed-cart, wrong-Origin, missing-public-key and absent-reservation cases were rejected without data changes. Eight hosted acceptance assertions PASS.
- Checkout browser verified product/cart/form and Sandbox buttons. IAB opened the PayPal overlay but did not expose the popup. Full browser onApprove-to-confirmation, cancellation and failure-injected reconciliation remain unverified; API capture is separate evidence.
- Removed the duplicate ProductDetailPage cart drawer already supplied by App, plus unused state. Removed an inaccurate email-success log on Preview; live email stays guarded. Frontend Node suite: 64 PASS.
- Closed all three Staging server switches and verified disabled HTTP responses for upload/Admin/create/capture. Removed temporary Admin role (count zero), set all three branch Preview opt-ins false, restored buyer Payment Review ON and removed the temporary buyer password file. Candidate must rebuild before claiming its new client flags are active.
- Replaced the stale acceptance queue with a current ledger; updated recovery evidence. Offline restore and eight Storage backup files are verified, while platform recovery, independent backup retention, email/review/Admin mutation tests and release operations remain gates. Production unchanged, both PRs Draft, Phases 3–5 not started.

## 2026-10-18 — Current-main baseline included
- Combined candidate now also includes main 8b80d8a (Phase 1 / PR #18), preserving its Preview isolation documentation and regression files. Combined Node suite: 181 PASS. The prior 169-test result omitted those 12 baseline tests.
- Combined Source CI now checks out the pull-request event merge commit before the pinned backend overlay, so main's baseline is tested on every run. No remote database/deployment/secrets are used by this workflow.
- Rebuilt Preview verified exactly one cart drawer and disabled Checkout after session closure. Final workflow and candidate source identities must still be verified after publication.

## 2026-10-18 — Captured-payment recovery and expired reservation regression
- A controlled hosted drill temporarily held the saved synthetic transaction mapping and forced stock exhaustion. The already completed Sandbox payment returned paymentCaptured=true without a partial write. Restoring stock and retrying the same provider order reconstructed one paid record; concurrent retries retained that record and one stock decrement. Provider GET before/after showed the same single capture. Original order, stock and reservation fields restored exactly.
- The retained-but-expired active hold variant reproduced HTTP 400 on the previous handler. Moved the expiry decision after merchant-authenticated provider/cart verification: COMPLETED proceeds to reconciliation without another capture; a new capture still requires APPROVED and entirely active unexpired holds. Consumed holds cannot authorize new capture. Missing/mixed/invalid holds fail closed.
- Added four policy regressions (nine PayPal tests total); frontend 68 tests and capture Deno type-check PASS. The corrected capture handler was deployed only to Staging; the expired-hold hosted drill then PASS. Server switches closed again. Current-main combined test/build and final CI are verified separately at publication.
- Added a manual operator runbook. Deleted/missing reservation recovery, actual network-loss injection, popup onApprove, durable reconciliation operations and the other release gates remain open. No new capture, real funds, email, Production changes or PR merge.
