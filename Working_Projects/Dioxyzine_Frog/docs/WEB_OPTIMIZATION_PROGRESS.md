# Dioxyzine Frog — Debug & Optimization Progress

**Last change batch:** 2026-10-16 · Storage image content check and guest-upload release gate (Draft PR #19)
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
