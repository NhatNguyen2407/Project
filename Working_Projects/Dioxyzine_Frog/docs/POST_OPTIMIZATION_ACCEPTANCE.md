# Post-optimization acceptance plan — Dioxyzine Frog

**Status:** DEFERRED UNTIL CODE OPTIMIZATION IS STABLE · **Owner decision:** run unverified operator-gated cases together, rather than blocking safe source fixes. Do not mark cases PASS based on CI/source analysis alone.

## Entry criteria
- Review PR #19 and PR #21 against the **current** `main` branch, including all changes merged through PR #18; resolve overlaps without losing Preview fail-closed isolation.
- GitHub Node tests, disposable PostgreSQL tests, and Vercel Preview builds succeed at each **final consolidated SHA**, not just older branch commits.
- Validate the existing Staging project and all test-only external destinations. Synthetic Staging has eight public tables but is **not** Production parity.
- The Staging-only tracking RPC SQL file in PR #19 has NOT been applied: the attempted migration was blocked. Do not assume hosted tracking works; obtain authorized review/application before test.
- No real customer/order/Auth data may be imported to hosted Staging. Do not touch Production migrations or PayPal live mode before release gates.

## Current optimization progress / delivery gates
- Source fixes in **Draft PR #19**: Checkout concurrent capture guard, external-effects fail-closed policy, Admin confirmed mutation checks, and synthetic Staging fixtures. GitHub CI may still be running on the new commit; validate exact SHA after push.
- Draft PR #21: trusted Inquiry submission, server-side CAPTCHA/rate budget/idempotency and Sheets mirror isolation; NOT merged or released.
- Not yet shipped: both Draft PRs require browser, sandbox, auth and recovery acceptance. This document is the deferred operator acceptance queue, not proof of completion.

## Deferred operator acceptance in order
- [ ] **Recovery:** local PostgreSQL port 55432 inaccessible from other LAN hosts; encrypted backup availability, separate disposable restore, schema/count/RLS verification and safe rollback. Record results without exposing dumps or secrets.
- [ ] **Preview identity:** inspect browser network requests to verify only Staging Supabase. Test Product/Price/Voucher read paths with synthetic fixtures. Verify guest/auth role restrictions and admin access cannot read restricted tables.
- [ ] **Tracking:** after authorized Staging RPC installation, test paid, unpaid, unknown and malformed UUID cases, 5-field response only, and direct `orders` SELECT denial; consider brute-force/rate limits.
- [ ] **Inquiry:** isolated Edge Function deployment + CAPTCHA hostname/action + rate-limit + idempotent retries and replay; stage-safe Google Sheets mirror (must remain OFF), test reference upload destination and RLS.
- [ ] **Checkout PayPal Sandbox:** separate Sandbox credentials/server functions, synthetic SKUs, successful capture, multiple `onApprove` callbacks, delayed capture, uncaptured error, unknown capture, double-click, reload/retry, stock reservation/reconciliation and loss of final HTTP response. Explicitly verify server-side idempotency.
- [ ] **Admin/email/storage:** synthetic admin account with least privilege, zero-row update, shipping-email test recipient only, Cloudinary sandbox upload destination, Apps Script test sheet, vouchers and review permissions. Verify `order_reviews` → `inquiries` sync triggers, list de-duplication, single-table reply/hide updates and Preview guards in browser.
- [ ] **Release:** reproduce all checks on the merged candidate, approve coordinated Inquiry function/frontend/RLS cutover, test rollback, verify live environment selection and monitor Production. Keep Draft PRs unmerged until approvals.

## Known boundaries
- A client-only PayPal callback gate prevents duplicate capture requests **within the mounted browser session**, not after reload/multiple devices. Server reconciliation is mandatory.
- In-memory checkout recovery must not be represented as a payment guarantee. On uncertain capture, block repeat payment and require operator review.
- Staging's sensitive tables currently use default-deny RLS, so some Admin/Checkout E2E paths require dedicated synthetic policies and server functions.
- Vercel Preview build READY proves compilation only. It does not prove backend identity, payment behavior, email delivery or database recovery.

Record acceptance evidence under Issue #17, including commit SHAs, environment, sanitized logs, pass/fail, owner, and remaining blockers. Do not publish credentials, customer payloads or payment transaction secrets.

## Draft PR #19 + #21 virtual integration checkpoint
- [ ] Exact PR #19 + pinned PR #21 SHA combined Node test and Preview build PASS in GitHub Actions (virtual worktree only).
- [ ] Re-run after **either** PR changes; CI pin deliberately becomes stale if PR #21 moves.
- [ ] Resolve the fact that Preview blocks Cloudinary uploads while Inquiry requires a reference image, using **synthetic, isolated storage only**. Do not connect real Cloudinary destinations or bypass fail-closed guards.
- [ ] Before a real release, assess cross-PR source integration, payment behavior, authenticated Admin permissions, hosted Supabase schema/RPC availability, edge deployment ordering, rollback and external integrations.
