# Hosted browser acceptance — 18 October 2026

Scope: Supabase `bvnnmvlfcduwmneipmsi`, protected Preview branch
`codex/inquiry-staging-candidate`. Synthetic data only, no customer messaging,
payments, Sheet writes or Production changes.

## Inquiry: PASS

On Preview source `2a6b69149b031d9a9fe73cf6554a8d1ee3d48db8`, the browser
obtained a real reCAPTCHA v3 upload token, received HTTP 201 from the issuer,
uploaded a 297-byte synthetic PNG and displayed a private reference attachment.
The submit action used a separate fresh token and reached the hosted decoder.
The browser displayed **Submitted Successfully!**.

Database evidence: exactly one browser-submitted Inquiry, one claimed ticket,
one matching idempotency record and a verified SHA-256 matching the local image.
Private fixture identifiers and request keys remain outside GitHub. This record
is distinct from the earlier management-seeded Admin fixture. Hosted WASM packaging/decoding is now proven
for this image, not every possible image/resource boundary.

## Long-open CAPTCHA form: fixed

The first submit attempts returned 403. Sanitized logs identified `freshness`.
The code incorrectly interpreted Google's `challenge_ts` as token creation time;
Google defines it as challenge **load** time. A fresh token generated while
filling a long-open form was being rejected despite provider success.

The validator now requires a valid non-future challenge timestamp while relying
on authenticated server-to-Google `siteverify` success for token expiry and
single use. Success, expected action, exact hostname and score >=0.5 remain
required. Tests retain timeout/duplicate rejection and add long-open-form
acceptance. No CAPTCHA threshold or origin allowlist was lowered.

Sources: [Google verification](https://developers.google.com/recaptcha/docs/verify),
[reCAPTCHA v3 execute timing](https://developers.google.com/recaptcha/docs/v3).
Backend: 112 Node tests PASS; both changed entrypoints type-check PASS.

## Role discovery: PASS

Applied the Staging-only self-read migration after checking isolated fixture
markers. Only authenticated SELECT on `user_id,role` is granted, with
`auth.uid() = user_id`; guest SELECT and all client role writes stay denied.
Eight real Auth/API checks PASS, including cross-user denial and unchanged
Admin assignment after denied insert/update/delete attempts.

## Further verified acceptance

- Admin browser signs in, lists both the management-seeded and real submitted
  Inquiry, requests a private reference by Inquiry ID and displays its 2x2 image.
  The reader stays isolated from other denied Admin tables.
- A signed-in browser also uploads and submits a 2048x2048 pseudo-random noise
  PNG (658,886 bytes). Its hosted ticket has a verified SHA-256 and is claimed.
  Supabase shutdown telemetry reports 382 ms CPU and 52,000,408 bytes memory.
  Shutdown memory is an observation, not a measured peak or proof for all images.
- The issuer now verifies a signed-in browser's JWT through Auth instead of
  rejecting every non-guest bearer. It issues the same scoped non-overwritable
  capability, with the same CAPTCHA and budgets; invalid JWT fails before issue.
  Backend suite: 113 Node tests PASS; issuer type-check PASS.
- Staging Tracking RPC was separately approved and installed. Five hosted
  checks PASS: paid result has exactly five fields, unpaid/unknown return null,
  malformed UUID rejected and direct orders SELECT denied. Browser paid lookup
  displays the synthetic product and tracking state.
- Orphan inventory at a 24-hour retention cutoff found zero expired unclaimed
  uploads. No customer files or recently issued capabilities were deleted.

The temporary synthetic Admin role and all temporary browser/server switches
must be removed/closed when this acceptance session finishes. Do not infer a
Production release from this report; PRs remain Draft until all release gates
have explicit evidence.
