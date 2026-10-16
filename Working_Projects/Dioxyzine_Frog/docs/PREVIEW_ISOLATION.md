# Vercel Preview / Supabase Backend Isolation

**Status (2026-10-16): Guard implemented on a Draft PR; staging environment NOT YET provisioned or validated.**

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

1. Obtain cost authorization and provision a separate Supabase environment; current Production project has no listed development branches.
2. Configure Preview-only variables in Vercel, leaving Production unchanged.
3. Confirm preview build runs successfully **using only synthetic test data** and query a staging-specific safe marker to verify runtime target.
4. Check other integrations are disabled/mocked or sandboxed and that all staff/customer data is synthetic.
5. Run RLS, login, inquiry, Admin and payment **Sandbox** E2E tests.
6. Record restore results separately in recovery documentation; **never restore over Production to practice**.

Related tracking: [Issue #15](https://github.com/NhatNguyen2407/Project/issues/15), [Issue #17](https://github.com/NhatNguyen2407/Project/issues/17).
