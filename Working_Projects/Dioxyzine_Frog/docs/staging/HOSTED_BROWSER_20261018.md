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

The temporary synthetic Admin role and all temporary browser/server switches
must be removed/closed when this acceptance session finishes. Do not infer a
Production release from this report; PRs remain Draft until all release gates
have explicit evidence.
