# Staging Inquiry image verification

Prepared 2026-10-17. Source and synthetic acceptance only; no hosted deployment
or upload flag was changed. This supersedes the earlier missing server-content
verification gate in the first 2026-10-17 acceptance checkpoint.

## Request path

1. The guest issuer registers a random UUID ticket, then signs a single Storage
   path with `upsert:false`. The bucket remains private.
2. `submit-inquiry` validates origin, application key, CAPTCHA, budgets, payload
   and optional verified user before calling the Staging-only
   `create_verified_inquiry_idempotent` RPC. A different RPC name prevents an
   older metadata-only backend from silently accepting a new submission.
3. A completed request returns its saved ID immediately. New requests validate
   an unexpired/unclaimed ticket and matching Storage size/MIME, then return a
   verification challenge without writing an Inquiry, request key or claim.
4. The server downloads only the exact fixed Staging project/bucket/UUID path.
   Redirects are forbidden. The download has an 8-second abort signal, a 5 MiB
   absolute bound and an exact declared-byte bound. Response type, ETag, actual
   MD5 and file signature must match the challenge.
5. Pinned `@imagemagick/magick-wasm@0.0.44` decodes the forced PNG/JPEG/WebP
   format. PNG/WebP container checks reject animation and malformed lengths.
   Images must be still images with each side at most 2048 pixels. WASM pixel
   cache/request limits are 64 MiB, disk fallback is disabled, and profile size
   is bounded. These are library resource limits, not a claim about total
   process memory or hosted CPU usage.
6. The server calculates SHA-256 and sends internal verification evidence in a
   second RPC call with the same canonical payload hash and request key. The
   browser input allowlist discards `_verified_image`; the client cannot provide
   this evidence through the HTTP endpoint.
7. The final transaction rechecks the ticket and current Storage metadata/ETag,
   validates evidence, then creates the Inquiry, claims the ticket, saves its
   SHA-256/time and records idempotency atomically. Concurrent same-key calls
   replay the committed result. Database locks are not held during HTTP/decode.

Production retains the existing HTTPS image-reference contract and base RPC.
WASM initialization is lazy and is never needed for committed Staging retries.
Function configuration declares handler-managed authorization for all three
Inquiry endpoints, including CORS preflight. Guest issuance validates CAPTCHA/
budgets; Admin reads still require `Auth.getUser` and the database admin role.
The two Staging-only handlers also require their explicit server enable flags.

## Assumptions and scope

- Standard single-part Storage uploads provide a 32-hex MD5 `metadata.eTag`.
  Missing, weak or multipart ETags fail closed. Verify this contract on hosted
  Staging before enabling upload; the synthetic transport cannot establish it.
- Guests cannot overwrite/delete their `guest/<UUID>` objects. Signing uses
  `upsert:false`; existing owner-folder policies must not grant access to the
  guest namespace. Review this with the actual Storage API and RLS.
- Final metadata comparison detects a change between challenge and commit.
  It does not create a distributed lock over external object storage. Changes
  by privileged operators after verification remain outside this guarantee.
- Successful decoding is not malware scanning, content moderation or removal
  of embedded metadata. SHA-256 records which bytes were inspected.
- Ticket paths are bearer capabilities for the pending upload/claim flow.
  Cross-account abuse and a stronger guest-session ownership contract remain
  separate release-review items.

## Verified locally

- Node suite: 109 tests, including download bounds, malformed challenges,
  response/actual-checksum mismatch, wrong type, decoder limits, internal proof
  filtering, missing backend/verifier, replay and conflict behavior.
- Deno: three Edge entrypoints type-check; four HTTP smoke tests plus real WASM
  decoding for PNG/JPEG/WebP, truncation/corruption/spoofing and an oversized
  JPEG frame. Decoder recovery after rejection is tested.
- PostgreSQL 17: synthetic ticket schema, least-privilege RPC calls, missing/
  malformed metadata, verification challenges, invalid/stale proof, claim/hash
  audit, expiry and replay. No inquiry/key/claim on rejected validation.
- Combined HTTP/WASM/PostgreSQL: ticket issuance, synthetic upload, all three
  formats, Inquiry persistence, actual role-table Admin checks, private reference
  signing, guest/member denial, expired link, retry after image deletion,
  corrupt/spoofed/stale rejection and four concurrent submissions yielding one
  record. CAPTCHA, Auth identity and Storage transport are test doubles.

Local reproduction after dependency install, from the app directory:

```powershell
./scripts/verify-inquiry-upload-ticket-local.ps1 -DenoExecutable 'path/to/deno'
```

Requires cached `postgres:17` and pinned Deno dependencies. The runner creates
its own labeled container with network disabled, no published ports, tmpfs
database and read-only fixtures, then removes only that container on completion.
CI runs the same SQL and combined test on a guarded disposable localhost DB.

## Hosted acceptance remaining

Staging reCAPTCHA credentials were created on 2026-10-17 (site 770957295).
The secret is stored only in Supabase Staging; the public Site Key is scoped
to the Vercel Preview branch `codex/inquiry-staging-candidate`. Before enabling:
review migration history/foundation preflight, reconcile direct INSERT/RLS
cutover, package and smoke-test WASM in the actual Edge runtime, measure memory/
CPU with representative boundary images, verify real signed-upload overwrite
denial and ETag behavior, test actual Auth/Admin permissions and signed expiry,
define orphan cleanup/quota handling, then validate the combined Preview UI.
Keep both PRs Draft and upload switches disabled until these gates pass.

## Local Edge Runtime boundary checkpoint (2026-10-17)

The decoder and its pinned npm/WASM assets were bundled into an ESZIP and
run with Supabase Edge Runtime v1.77.4, image digest
`sha256:ad45164b7548bf5820ed7be714789c17ac2865edce79a09cfb4c3756c3d365a8`.
The user worker had 256 MiB memory and 2000 ms hard CPU limits. The runtime
had no external network, source tree or npm cache mounted; only the main
test service and the generated bundle were mounted read-only.

Real 2048x2048 PNG/JPEG/WebP fixtures initially all failed. ImageMagick's
AreaResource uses `size < limit`, so a limit equal to the maximum pixel area
forced the boundary image onto the disabled disk cache. Raising the area
threshold by one pixel fixes the inclusive boundary without increasing the
64 MiB cache/request limits or allowing a larger decoded width/height.
See [the upstream comparison](https://github.com/ImageMagick/ImageMagick/blob/main/MagickCore/resource.c).

After the fix, all three 2048x2048 formats passed (about 260/99/84 ms elapsed
in this synthetic local run); all three real 2049x2049 fixtures were rejected.
The Deno regression now generates valid fixtures at both sizes and checks
acceptance/rejection with the real decoder. These small solid-color files
establish the pixel boundary, not worst-case CPU/memory behavior for every
file up to 5 MiB. Hosted runtime equivalence, peak memory and representative
high-complexity images remain acceptance gates.

References: [Supabase WASM image processing](https://supabase.com/docs/guides/functions/examples/image-manipulation),
[WebP container specification](https://developers.google.com/speed/webp/docs/riff_container),
[PNG specification](https://www.w3.org/TR/png-3/).
