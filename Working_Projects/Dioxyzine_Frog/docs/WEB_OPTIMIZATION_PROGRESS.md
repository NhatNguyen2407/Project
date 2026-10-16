# Dioxyzine Frog — Debug & Optimization Progress

**Last change batch:** 2026-10-16 · Admin write consistency and Preview safety (Draft PR #19)
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
| Admin review reply & visibility | SOURCE FIXED in this batch: `.select('id')` and confirmed exactly-one matching row | NOT RELEASED; CI PENDING THIS COMMIT | Hosted admin role/permissions E2E pending |
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
