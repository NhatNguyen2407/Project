# Guest Inquiry reference upload — staged security design

**Status:** DESIGN ONLY. No guest upload endpoint or live configuration authorized.
**Environment:** Supabase Staging project `bvnnmvlfcduwmneipmsi`; Production Cloudinary must remain untouched.

## Why the current Preview path stops at sign-in
- The private `inquiry-test-references` bucket permits only `authenticated` INSERT and SELECT under a user-owned UUID folder. It deliberately has no `anon` policy and no UPDATE or DELETE policy.
- Staging currently has zero Auth users and zero Edge Functions. Source unit tests only verify fake SDK interactions; they cannot certify live RLS, upload, signed URLs or guest Inquiry submission.
- A signed download URL issued for one hour is a *temporary viewing link*. Inquiries need a durable **private object reference**, not that expiring URL. Do not store the current signed link as the permanent customer reference.

## Proposed server-mediated guest flow
1. The browser requests a one-time upload authorization from a future **Staging-only** Edge Function, with a valid reCAPTCHA token for a distinct upload action, an allowed exact Origin and a minimal image metadata declaration. Neither CORS nor a public API key alone authenticates a caller.
2. The server validates token freshness/action/hostname, enforces a persistent rate budget and an upper bound on image count/size, and creates a random non-overwritable path in a dedicated **quarantine/guest** prefix, not another user's folder. It returns a tightly scoped signed upload token. All service-role credentials stay server-side.
3. The browser uploads one image with the issued token. The bucket enforces 5 MiB and PNG/JPEG/WebP; backend verification must also examine image content rather than trusting client-provided MIME, and apply cleanup/abuse controls. Treat upload URLs/tokens as bearer capabilities.
4. A trusted server confirms the uploaded object and connects its **bucket + object path** to the Inquiry within the coordinated `submit-inquiry` flow, with single-use issuance, matching identity/request binding and durable idempotency. The server must not accept arbitrary storage URLs as proof of an authorized upload.
5. Authorized views mint short-lived signed **download** URLs on demand. Orphaned or expired uploads are cleaned up under a scoped retention policy with explicit tests.

## Required gates before deployment
- Implement rate-budget, CAPTCHA/mock HTTP and concurrency tests in disposable CI. Deploy to hosted Staging only after a reviewed server-side grant model exists.
- Keep guest INSERT absent on `storage.objects`. Test owner/cross-user/anon denials with synthetic accounts and a real browser.
- Confirm Supabase Storage's actual signed upload token validity and cancellation/cleanup behavior from current docs during implementation.
- Never copy real designs, customer information, Production API keys or production service-role secrets to Staging.
- Coordinate with Draft PR #21's Inquiry Edge Function and RLS cutover. Do not merge the draft frontend independently of the backend.

## Exit condition
Successful isolated Staging guest upload, rejected abuse cases, a durable stored object reference, authorized preview retrieval and verified cleanup, all reproduced on a release candidate. Until then: **DEFERRED / NOT RELEASED**.
