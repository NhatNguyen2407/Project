# Hosted Staging acceptance — 2026-10-18

Work performed 17–18 October 2026 (Asia/Saigon). Scope: only Supabase
`bvnnmvlfcduwmneipmsi` and Vercel Preview branch
`codex/inquiry-staging-candidate`. Production and main remain unchanged.

## Established on hosted services

- Applied migration `20261017153749_staging_inquiry_verified_backend_foundation`
  after checking synthetic-only data, migration history, private Storage and
  direct INSERT cutover. Four new RPCs use SECURITY INVOKER and service-role-only
  EXECUTE grants. Three internal tables have RLS and no client grants/policies.
  Verified those grants after applying; no Inquiry was created by the migration.
- Deployed `submit-inquiry`, `issue-inquiry-upload`, `admin-inquiries` to Staging.
  CORS OPTIONS returns 204 only for the exact allowed Preview origin; a foreign
  origin returns 403. No other production function was deployed or changed.
- Staging CAPTCHA site 770957295 is separate from the website key. Secret stays
  on Supabase; the public Site Key override is limited to this Preview branch.
- Verified Preview `D7xcBDKt6xPvjdD8b1ZuAHbrKGLD` READY, source `87a6df6`,
  alias `dioxyzinefrog-git-codex-inquiry-staging-ac4daa-bibii-s-projects.vercel.app`.
  User logged into the protected Preview; no shareable bypass URL was created.
- Actual Storage/Auth acceptance: 19 checks PASS. Includes scoped signed upload,
  no overwrite (including client upsert=true), wrong-path denial, private guest
  read denial, owner-folder RLS and cross-user denial, no self-admin grant,
  bucket size/MIME enforcement, byte-for-byte authenticated download, matching
  MD5 ETag and database metadata challenge, signed download and actual expiry.
- Two synthetic confirmed Auth users were created via admin API without sending
  invitation email. Credentials are private local fixtures, outside the repo.
  A temporary Admin role was separately approved by the owner for reader tests.
- Hosted Admin API denies guest, member, invalid JWT and server-key misuse.
  Verified Admin can list; arbitrary object paths and nonexistent IDs are denied.
  A management-seeded fake Inquiry is used to check image signing separately
  from browser submission. It is not a successful CAPTCHA/submit-inquiry test.
  Nine Admin checks PASS, including a 297-byte private image download through
  the 60-second signed URL. After expiry the same URL returns HTTP 400.

## Real-browser failure and fix

The first real upload returned HTTP 413 before consuming any upload budget.
Hosted request logs confirmed this response. The issuer limited its entire JSON
body to 1024 bytes, while the shared CAPTCHA validator supports tokens of up to
8192 characters. Short synthetic tokens had hidden this mismatch.

The issuer now bounds the body at 16,384 bytes (same byte budget as submission),
retains the token length/metadata allowlists, and returns 413 for streamed bodies
over the limit as well as oversized Content-Length. It still verifies CAPTCHA,
origin, public key and both durable budgets before issuing a capability.

Regression reproduced 413 vs expected 201 before the fix, then passed afterward.
Tests exercise an 8192-character token, an 8193-character rejection, excessive
declared length and oversized ASCII/multibyte streamed bodies. Local Node suite:
111 PASS; changed Deno entrypoint type-check PASS. Hosted bogus-token request of
8250 bytes now reaches CAPTCHA verification and returns 403, rather than 413.
This establishes the size fix, not success for a valid real CAPTCHA token.

## Still incomplete

- A completed browser upload and submission with real reCAPTCHA, followed by
  hosted image WASM verification, atomic Inquiry/claim/hash/key and response UI.
  No customer Inquiry was created. A later retry was interrupted; do not call it
  a successful upload or E2E run.
- Representative high-complexity image CPU/peak-memory checks on hosted Edge.
- Admin Inbox browser view: Staging user_roles RLS currently has no client read
  policy, so the existing client role lookup cannot establish Admin UI access.
  Server authorization has been checked separately. Do not open broad role-table
  access merely to make the UI test pass.
- Guest capability ownership/abuse review, orphan cleanup and operational quotas;
  full recovery/off-device backups, checkout/Sandbox and other release gates.

## Session closure verified 2026-10-18 00:35 UTC

Both server switches are OFF: upload and Admin endpoints return HTTP 503 for
the allowed origin. The branch-specific Preview upload variable is false; the
next candidate build must incorporate it. The temporary Admin role was removed
and a database query confirms zero matching roles. No desktop control is needed.

Keep both PRs Draft. Two synthetic Auth users, two fake image objects and one
management-seeded Inquiry remain labeled fixtures. No browser-submitted Inquiry,
customer data, email, payment or production write was produced by these tests.
