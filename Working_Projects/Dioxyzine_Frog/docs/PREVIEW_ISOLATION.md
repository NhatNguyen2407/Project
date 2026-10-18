# Vercel Preview / Supabase Backend Isolation

**Status (2026-10-16): Preview-only URL and staging project marker verified against the separate, healthy Supabase Staging project. GitHub CI and guarded Vercel Preview BUILD have passed. Browser/runtime identity, complete staging compatibility and external integration isolation remain unverified.**

## Purpose

Vercel Preview builds must never silently connect to the live Dioxyzine Frog database when someone tests checkout, Admin, inquiries, or account actions.

An isolated database is a **separate Supabase project** or an authorized development branch with its own project reference. A Vercel Preview deployment does not by itself create or isolate a backend.

## Required Vercel Preview-only settings

- `VITE_SUPABASE_URL`: `https://<isolated-project-ref>.supabase.co`.
- `STAGING_SUPABASE_REF`: the exact Supabase project reference for the isolated test backend. **Not a key, secret, or production ref.**
- `VITE_SUPABASE_ANON_KEY`: public/publishable key of that same isolated Supabase project, not the Production key.
- Check all external integrations (PayPal sandbox, Mail/EmailJS recipients, Apps Script links, Cloudinary upload targets) separately before E2E tests. This guard checks only the Supabase URL/host and project reference.

The Vite build performs an exact project reference and HTTPS host comparison when `VERCEL_ENV=preview`. It rejects missing refs, the known Production project, wrong/malformed URLs and suspicious extra URL components. No key values are printed.

**Consequence until staging is configured:** Vercel Preview builds are deliberately blocked. This is a fail-closed safety behavior, not a Vite regression.

## Initial read-only environment audit (2026-10-16 — historical, before reconnect)

- Production and Staging are distinct, existing Supabase projects. No new project/branch was created in this audit.
- Staging has one `public` table (`inquiries`, 14 columns), with RLS enabled and three recorded inquiry-focused migrations. Production has eight `public` tables; its `inquiries` table has 27 columns. Staging is **not** a full copy of the live application schema.
- Staging currently lists zero Edge Functions. The Staging security advisor reported no notices, which is not a substitute for authorization or integration testing.
- The Vercel integration returned HTTP 403 for reading project/environment metadata and build logs in the expected team scope. Preview environment values could not be independently verified or modified. The PR #18 Vercel Preview deployment is ERROR, while its GitHub CI completed successfully; the precise Preview build failure cannot be confirmed from logs.
- Consequently, no Preview E2E tests, restore rehearsal, payment test, RLS change, or Production modification were performed. The Preview gate must stay fail-closed until the correct staging URL **and matching public key** are configured for Preview only.
- Do not attempt full-site E2E on this partial staging schema. Before testing, reconcile missing schema and integrations using synthetic data, check authorization boundaries and sandbox external services, and perform a separately documented isolated restore rehearsal.

## Follow-up checkpoint: configured Preview build (2026-10-16)

The earlier 403/ERROR observations above describe **the initial check only** and were resolved by using authorized project-level access without an unnecessary team-scope argument, followed by the owner's Preview-only staging marker configuration.

- Preview-only `VITE_SUPABASE_URL` and `STAGING_SUPABASE_REF` were read directly and matched the distinct existing Supabase Staging project; the Production Supabase URL and deployment configuration were not edited as part of this checkpoint.
- The Preview-only public client key was replaced with the Staging project's key in an earlier controlled configuration step. Vercel currently returns its type and metadata but **does not return the sensitive key value**, so an independent byte-level re-comparison could not be performed in this later audit. Verify application API connectivity in the runtime acceptance batch.
- PR HEAD `11b185d`: GitHub Actions run `38877723947` completed successfully, including frozen dependency installation, Node tests and Vite build; Vercel Preview deployment `dpl_GD5DgmUBjkXQQLr4PL2jiFwNRByM` was `READY` on that exact commit.
- The build guard checks the Supabase URL and staging reference at build time only; it does **not** verify the bundled API key, browser network target or isolation of EmailJS, Cloudinary, Apps Script or PayPal integrations.
- Hosted Staging remains inquiry-only with no full order/payment backend. **Do not perform stateful Checkout/Admin/Inquiry E2E until all required fixtures and external test providers are isolated.** No restore or data migration was performed in this checkpoint.

## Behavior and scope

| Build context | Result |
| --- | --- |
| Local development, `VERCEL_ENV` unset | No additional restriction |
| Vercel Production, `VERCEL_ENV=production` | No additional restriction; Production build preserved |
| Vercel Preview without `STAGING_SUPABASE_REF` | FAIL: staging not configured |
| Vercel Preview pointing to Production | FAIL |
| Vercel Preview matching a **separate** staging ref and exact URL | PASS |
| Vercel Preview matching staging Supabase but using a wrong anon key | **Not detected here; must be manually verified / tested** |

The guard does not prove that a stage project exists, that its `anon` key matches, that RLS is safe, or that other integrations are sandboxed. Stage provision and a privileged live-production restore are **not** part of this PR.

## Verification

The `tests/previewBackendIsolation.test.mjs` suite covers successful staging configuration, intentional local/Production exemption, missing/invalid references, Production backend, incorrect host, non-HTTPS URLs, URL paths, ports, credentials, queries and fragments.

Before marking staging safe:

1. Use the existing isolated Supabase Staging project for narrow tests; do **not** provision a new billable branch or project. First confirm its budget, schema, RLS and test-only credentials.
2. Configure Preview-only variables in Vercel, leaving Production unchanged.
3. Confirm preview build runs successfully **using only synthetic test data** and query a staging-specific safe marker to verify runtime target.
4. Check other integrations are disabled/mocked or sandboxed and that all staff/customer data is synthetic.
5. Run RLS, login, inquiry, Admin and payment **Sandbox** E2E tests.
6. Record restore results separately in recovery documentation; **never restore over Production to practice**.

Related tracking: [Issue #15](https://github.com/NhatNguyen2407/Project/issues/15), [Issue #17](https://github.com/NhatNguyen2407/Project/issues/17).
