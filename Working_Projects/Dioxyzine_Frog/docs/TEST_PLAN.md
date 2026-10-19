# Dioxyzine Frog - Phase 1 verification and closeout

Created 2026-10-14. Reconciled against recorded evidence on 2026-10-19.
**Phase 1 remains OPEN.** Verified recovery, CI, hosted APIs and browser checks
are listed separately below. An unchecked release condition is not a failed test,
and a planned test is not a completed one.

## Safety rules

- Use the exact reviewed Preview commit and synthetic Supabase Staging contract.
- A Preview URL or successful build does not prove backend isolation.
- Keep upload, Admin reader and PayPal Sandbox opt-ins OFF outside an approved
  test window. The owner deferred the next payment test; do not enable it yet.
- Never run Production migrations, payment capture/refund or destructive tests.
- Block real email recipients, operational Sheets writes and shared Cloudinary
  uploads from Preview. Do not copy the sensitive restore into hosted Staging.
- Keep private dumps, keys, customer data, provider identifiers and raw evidence
  outside this public repository. Do not delete local backups or decryption keys.

## Step 1 - Baseline and source control

- [x] Inventory the application, database, providers and migration differences.
- [x] Retain separate frontend/backend Draft PRs and a combined Preview candidate.
- [x] Recheck current main and Production on October 19. Two new main commits
  change documentation only; retain their contents in the Draft candidate.
- [ ] Immediately before release, recheck source, deployment, backend identity,
  runtime health and the exact final integration results.

## Step 2 - Recovery and isolated testing

| Check | Recorded result | Limit / remaining condition |
| --- | --- | --- |
| Database restore | PASS: 41 data-table counts and nine schema/access-control categories matched | Captured baseline, not an atomic snapshot of every external service |
| Auth/Storage recovery | PASS: ten API checks; synthetic sign-in, private access/expiry and eight backed-up objects | New local credentials; original passwords, OAuth and SMTP not exercised |
| Migration reconciliation | PASS: full application/Auth/Storage history fingerprints; historical pair compared in a rolled-back simulation | Do not replay the historical pair or repair live history automatically |
| Workbook restore | PASS: ten tabs, 2,623 formulas, 113,882 resolved cell/style comparisons and native samples | Dated backup; external imports and Apps Script not exercised |
| Encrypted off-device transfer | PASS: owner-only Drive archives downloaded, decrypted and checksum-verified; downloaded base restored | Independent key custody is OPEN |
| Available external media | PASS: 26 originals with API size, CDN MD5, SHA-256 and signature verification | 132 captured URLs already return 404; retain the private repair list |
| Readable provider Config | PASS: 17 Vercel definitions preserved; eight offline isolation checks | Five write-only definitions and provider/settings/secret recovery remain OPEN |
| Preview isolation | PASS: distinct Staging backend, build guards and prior hosted/browser evidence | Recheck runtime on each code-changing candidate |
| Rollback rehearsal | PASS: Preview alias moved to a prior READY candidate and restored, with readback | Preview routing only; no Production rollback/cutover claim |

The recovery drill uses an internal Docker network, tmpfs and **zero published
host ports**, with verified cleanup. This supersedes the old proposal to expose
port 55432 and perform a second-device LAN test. No encrypted-disk assertion is
made because local volume encryption was not verified.

- [ ] Owner retains the complete decryption identity independently of this device.
- [ ] Verify recovery/recreation of required provider settings and secret values
  through their controlling accounts, followed by an isolated rehearsal.
- [ ] Resolve or explicitly disposition unavailable source-media coverage before
  claiming a complete website recovery.

## Step 3 - Critical regression and acceptance

| Area | Verified evidence | Remaining acceptance |
| --- | --- | --- |
| Automated source tests | Prior combined candidate: 185 Node tests; payment entrypoints type-checked; seven CI workflows passed at recorded heads | Run suite/build and inspect CI for changed final source, including current main |
| Inquiry | Real CAPTCHA, private upload, hosted decode and guest/signed-in submission; atomic claim/hash and retry checks | Retention/abuse operations and broad all-input resource guarantees are not accepted |
| Auth/Admin read | Role isolation, nine Admin API checks, browser Inbox/private image and signed expiry | Other Admin mutation/review workflows remain Phase 2 |
| Tracking | Five HTTP checks and paid browser lookup; October 19 browser malformed/unknown ID rejection | Verify accessible input/button/error on corrected candidate; operational abuse controls remain Phase 2 |
| Storefront/cart | Product, cart and form inspected on prior candidate | October 19 found legacy ready-use links selecting custom pricing; verify both routes, totals, reload and keyboard after minimal fix |
| Checkout API | Sandbox USD 27 paid record; concurrent replay uses one capture/order/stock decrement | API results do not replace browser completion |
| Captured-payment recovery | DB failure and expired retained-reservation recovery passed using the same completed payment; fixtures restored | Deleted-reservation recovery and durable reconciliation operations remain Phase 2 |
| Checkout browser | SDK buttons and overlay inspected | Popup approval to Order Confirmed, cancel, delayed/uncertain result, reload and lost final response remain OPEN; owner deferred payment |
| Email / voucher / review | Source-contract coverage only | Scoped Staging integration, approved test recipient, retry/dedupe, voucher rollback and Admin writes remain Phase 2 release gates |

Every result must record source/environment, actual assertions, limitations and
evidence location. Source-contract tests, hosted API tests and browser
observations are distinct. See POST_OPTIMIZATION_ACCEPTANCE.md and
RECOVERY_READINESS.md; private detailed reports are not public artifacts.

## Final decision

Phase 1 cannot be marked complete while independent key custody, provider
recovery and critical browser acceptance remain open. Record an explicit
go/no-go decision and retain all local backups until owner custody is satisfied.
Completion of engineering checks does not authorize a Production release.

Review both Draft PRs against current main; review the security advisor and
database grants/RLS; coordinate frontend, Edge Functions and migration cutover
with rollback and monitoring before a separately approved release. Do not
silently waive missing payment evidence to make the checklist green.
