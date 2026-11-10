# Dioxyzine Frog

Dioxyzine Frog is an e-commerce website for custom plushies, dolls, and accessories. I work across the frontend and service integrations, including the parts of checkout and order management that require a backend.

**Website:** https://dioxyzinefrog.vercel.app

## What the application includes

- Custom and ready-use product listings and product detail pages
- Cart and checkout flows, with PayPal Sandbox integration
- Account registration, login, password recovery, profile management, and account deletion flows
- Order tracking, customer inquiries, feedback, and gallery pages
- Wishlist and account order views, plus administration UI for products, orders, and searchable read-only Inquiry details
- Responsive layouts, accessibility-oriented components, and basic SEO/analytics hooks

Some experimental tools have source files but are not active public routes. Their existence does not mean they are ready for production.

## Stack

| Area | Technology |
| --- | --- |
| Frontend | React, Vite, JavaScript, Tailwind CSS, Material UI, Radix UI |
| Navigation and UI | React Router, Motion, Recharts |
| Authentication, database, storage | Supabase |
| Backend operations | Supabase Edge Functions and SQL/RLS policies |
| Payments | PayPal Sandbox |
| Other integrations | Cloudinary, EmailJS, reCAPTCHA, Google Apps Script |
| Hosting | Vercel |

## Run locally

Use Node.js and pnpm. The application lives inside this folder, not at the repository root.

```bash
cd Working_Projects/Dioxyzine_Frog
pnpm install
pnpm dev
```

For the automated contract tests and a production build:

```bash
pnpm test
pnpm build
```

The Vite development server prints its local URL in the terminal.

## Environment and external services

The frontend reads configuration from Vite environment variables. Examples referenced in the application include:

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- `VITE_PAYPAL_CLIENT_ID`
- `VITE_RECAPTCHA_SITE_KEY`

Other integrations may require their own configuration. Add values locally or through Vercel environment settings, not in Git. Never place Supabase service-role keys, PayPal secrets, or other privileged credentials in variables prefixed with `VITE_`; those values are exposed to the browser.

A local frontend does not reproduce the full checkout system by itself. Payment processing uses the Supabase Edge Functions under `supabase/functions/` and requires compatible backend configuration. PayPal is configured for Sandbox testing; a successful Sandbox checkout is not proof of live-payment readiness.

Inquiry submissions use the `submit-inquiry` Edge Function. It verifies reCAPTCHA v3, validates customer fields and derives account ownership before calling a service-role-only save RPC. It reuses `RECAPTCHA_SECRET_KEY`; `RECAPTCHA_ALLOWED_HOSTNAMES` is an optional comma-separated list and defaults to `dioxyzinefrog.vercel.app`. Configure approved local/staging hosts on their own backend. See [TEST_PLAN.md](docs/TEST_PLAN.md) for the coordinated frontend/function/permission rollout and remaining browser checks. Sheets mirroring still uses the existing best-effort client path.

## Repository map

| Path | Contents |
| --- | --- |
| `src/app/pages/` | Storefront, auth, checkout, tracking, profile, and admin pages |
| `src/app/components/` | Shared interface, layout, and storefront components |
| `src/app/context/` | Auth, cart, products, wishlist, and language state |
| `src/app/service/` | Supabase, API, and media integrations |
| `supabase/functions/` | Payment creation/capture, account deletion, CAPTCHA verification and trusted Inquiry submission; shared count validation |
| `supabase/migrations/` | Versioned SQL changes tracked in source |
| `tests/` | Node-based tests for auth, account management, catalog, inquiries, wishlist, tracking, and payments |
| `scripts/` | Backup inspection, restore preparation, and environment checks |
| `supabase/tests/` | SQL regression checks for account permissions, deletion, Inquiry quantities and trusted submission/retry/rate limits |
| `docs/` | Audits, test plan, inventory, preview isolation, recovery notes |

## Testing and operational cautions

The repository includes automated tests and CI, but it also relies on manual end-to-end verification of payment, product, profile, and administration flows. See [TEST_PLAN.md](docs/TEST_PLAN.md).

Recent tracked SQL changes include atomic account deletion and inquiry quantity guards. These files demonstrate the intended backend rules, but Git history alone does not establish the state of the hosted database. Do not reapply repository migrations to a live database without checking its existing schema and migration history. The [recovery notes](docs/RECOVERY_READINESS.md) document differences between tracked migration filenames and live records, as well as recovery checks that remain incomplete.

Vercel Preview is not automatically isolated from Production Supabase. Check environment configuration before using real accounts or attempting any data-changing tests.

## Project documentation

- [System inventory](docs/SYSTEM_INVENTORY.md)
- [Audit issues](docs/AUDIT_ISSUES.md)
- [Test plan](docs/TEST_PLAN.md)
- [Preview backend isolation](docs/PREVIEW_ISOLATION.md)
- [Recovery readiness](docs/RECOVERY_READINESS.md)
- [Attributions](ATTRIBUTIONS.md)

This README describes code present in the repository. It does not claim that every integration, backup procedure, or production workflow has passed final verification.
