# Dioxyzine Frog — acceptance ledger

Updated 2026-10-18. PR #19 and #21 remain Draft; Production is unchanged.
Evidence below separates hosted checks, browser checks and source-only tests.
Historical progress entries are dated snapshots; this ledger supersedes their old open/closed states.

## Verified acceptance

| Area | Evidence | Limit |
| --- | --- | --- |
| Offline database recovery | 41 table row counts; 43 table definitions; 439 columns; 35 function hashes; 22 policies; table/function ACLs and 10 triggers matched. Role, paid tracking and rollback probes passed. | Isolated local PostgreSQL restore, not full hosted platform recovery. |
| Storage backup | All 8 files recovered; size and single-part MD5 match snapshot metadata; SHA-256 manifest retained privately. | Storage API re-upload and independent off-device retention not tested. |
| Hosted Storage/Auth | 19 API checks passed, including own-prefix access, cross-user/guest denial, type/size restrictions, overwrite denial and actual signed expiry. | Synthetic Staging only. |
| Inquiry browser | Real v3 CAPTCHA, private upload, hosted WASM decode and submit passed. Stored ticket claim, checksum and idempotency record verified. Signed-in 2048×2048 PNG (658,886 bytes) also submitted. | Decoder shutdown sample: 382 ms CPU / 52,000,408 bytes memory; not a peak bound or all-input guarantee. |
| Auth role isolation | 8 hosted checks passed: own role read only; cross-user reads and all client role writes denied. Auth refresh preserves mounted forms; stale account lookups invalidated. | Staging uses a guarded self-read migration. |
| Admin Inbox | 9 API checks plus browser login, real submitted Inquiry listing and private 2×2 image viewing passed; 60-second signed URL actually expired. | Read-only Inbox; not acceptance of all Admin mutation/email/review workflows. |
| Tracking | Approved Staging RPC installed. Paid result has exactly 5 fields; unpaid/unknown return null; malformed UUID rejected; direct orders SELECT denied. Paid browser lookup passed. | Public UUID lookup still needs operational abuse controls before release sign-off. |
| PayPal Sandbox | Merchant OAuth, server-calculated USD 27 order, fake buyer approval, capture and stored paid order passed. Repeated capture and 4 concurrent retries return the same order. Stock changed once (5→4); one consumed reservation. Changed cart, wrong Origin, missing caller key and unknown reservation rejected without data changes. | Sandbox only. Origin/public-key matching is isolation, not authentication or rate limiting. |
| Checkout UI | Product→cart→delivery form displays USD 27 and Sandbox SDK buttons. | IAB opened the PayPal overlay but did not expose its popup; browser onApprove→confirmation completion is NOT accepted. |
| Source integration | Backend 113 tests; frontend 68 tests; combined candidate including current main: 185 tests. Both payment entrypoints use pinned SDK/lockfile and type-check in CI. | Exact final commit workflow/deployment results must accompany release evidence. |

## Corrections made during hosted acceptance

- Bounded upload JSON body now accommodates supported CAPTCHA tokens.
- CAPTCHA freshness uses successful provider verification; an old challenge-load timestamp no longer rejects a fresh token. Action, exact hostname, score and valid timestamp remain checked.
- Signed-in upload JWT is verified through Auth rather than rejecting all user bearers.
- Auth callback role lookup runs outside the synchronous callback; refresh no longer unmounts a resolved form.
- Staging Inbox no longer fails because unrelated Admin tables are denied.
- Capture normalization handles multiple product IDs; create/capture share canonical quantities.
- Stable PayPal-Request-Id and transaction-level database idempotency protect same-payment retries.
- Product detail no longer mounts a second global cart drawer.
- Preview no longer logs a receipt as sent when its live email call was intentionally skipped.

## Session closure

Temporary server switches for upload, Admin reader and Sandbox payment are OFF.
The three corresponding candidate-branch Preview opt-ins are false. Rebuilt Preview displayed Checkout disabled; the product page now has exactly one cart drawer.
The temporary synthetic Admin assignment was revoked. Buyer Payment Review restored ON; temporary buyer password file removed.
Credentials stay server-only; no real funds, customer records, email or Sheets writes were used in these checks.

## Remaining release gates

- Complete SDK popup/onApprove→confirmation in a popup-capable test browser; verify cancellation, delayed/uncertain outcome, reload and loss of final response with the same payment.
- Controlled captured-but-not-recorded failure/recovery and the expired-retained-reservation variant now PASS, with exact fixture restoration and the same single provider capture. See PAYPAL_RECONCILIATION_RUNBOOK.md. Durable operations and deleted-reservation recovery remain unimplemented.
- Test synthetic voucher usage/rollback, shipping email to an approved test destination, review permissions/sync and remaining Admin mutations against a deliberately scoped Staging contract. Do not grant broad table access to make a test pass.
- Implement/review orphan retention and upload-abuse operations. A read-only 24-hour orphan inventory found zero eligible objects; no cleanup deletion was claimed.
- Verify full hosted Auth/Storage/provider/settings recovery, deployment rollback and an independent encrypted backup destination. Offline SQL recovery is already accepted.
- Review both PRs against current main; coordinate frontend/function/RLS cutover and rollback; approve release and monitoring. No Production migration, merge or deployment is implied.
- Phases 3–5 (data integration, PA and AI) have not started.

## Superseded proposal

A separate Cloudinary Staging account is no longer required. This project uses private Supabase Staging Storage for synthetic Inquiry references. Production keeps its existing Cloudinary path.

No credentials, customer payloads, bearer URLs, fixture UUIDs or payment transaction identifiers belong in public evidence.
