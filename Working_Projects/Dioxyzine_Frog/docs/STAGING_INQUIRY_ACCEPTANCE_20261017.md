# Inquiry Staging acceptance — 2026-10-17

This checkpoint prepares code and synthetic tests. The owner confirmed that
separate Staging reCAPTCHA v3 credentials do not exist yet and asked to prepare
code/tests first. No hosted migration, Edge deployment, secret change, Preview
upload toggle, Production write or PR merge is part of this checkpoint.

## Fixed defects

- A Storage object with valid size but missing or JSON-null `mimetype` could
  pass the ticket transaction because SQL `<> NULL` yields unknown. Both the
  reviewed draft and its Staging foundation now use null-safe comparison.
- Oversized or malformed metadata size could throw a numeric-cast error.
  Comparison against the ticket's canonical decimal text avoids that cast and
  rejects invalid/mismatched sizes consistently.
- Ticket registration explicitly rejects null MIME/size with SQLSTATE 22023.
- Invalid upload references (22023) return a sanitized HTTP 400. Backend
  outages remain 503; idempotency conflicts remain 409.
- A source-contract test now normalizes CRLF to run on Windows as well as CI.

## Evidence and reproduction

The new SQL regression failed against the previous foundation with
`Invalid Storage metadata accepted: {"size": 100}` before the fix. It passes
against the corrected foundation, using the real PostgreSQL 17 engine and
service_role calls. Storage tables are synthetic stubs, not the Storage API.

- `node --test tests/*.test.mjs`: 98 tests pass locally.
- `./scripts/verify-inquiry-upload-ticket-local.ps1`: creates a disposable
  PostgreSQL container from locally cached `postgres:17`, without network or
  published ports, with tmpfs data and read-only fixtures; cleans up on success
  and failure. The same SQL fixture runs in the existing GitHub SQL workflow.
- Covers missing/null/wrong-type MIME, missing/null/invalid/fractional/negative/
  oversized/mismatched size, malformed metadata, missing object, expired or
  claimed ticket, denied RPC grants, and no records/keys/claims on rejection.
- A completed request still replays its original ID after its object is
  removed. A new request cannot reuse an already claimed ticket.
- A contract test prevents divergence between ticket draft and foundation.

## Remaining release gates

1. Server-side image-content verification is **not implemented**. Neither
   browser signature checks nor Storage metadata prove the uploaded bytes are
   a valid, safe image. Prepare bounded server validation, preserving retries
   and atomic ticket claims, before opening guest upload.
2. Configure separate Staging reCAPTCHA v3 credentials, exact origin/hostname
   allowlists and server-only secrets. Never put secrets in chat or Vite vars.
3. Review/apply the Staging foundation and deploy the three functions, then
   verify guest/non-admin/admin access and upload via the actual Storage API.
4. Test private image signing/expiry, concurrency, orphan cleanup and quotas.
   Local metadata fixtures cannot establish hosted Storage behavior.
5. Integrate the current backend with PR #19 at a fixed source revision, verify
   Preview identity and isolation, and complete UI/API/database E2E with only
   synthetic data. Keep upload and release gated until acceptance is complete.

PR #19 and #21 remain Draft. This is not a hosted E2E or release approval.
