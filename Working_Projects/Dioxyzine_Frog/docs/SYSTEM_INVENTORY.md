# Dioxyzine Frog — System Inventory

> **Baseline (read-only):** 2026-10-14 (Asia/Bangkok)  
> **Workstream:** Phase 1 / Step 1 — Establish baseline & safe working branch  
> **Status:** Documentation only. No production, database, payment, or Sheet changes.  
> **Repository visibility:** PUBLIC — never add secrets, customer records, financial detail, or nonpublic Sheet links.

## 1. Source-control baseline

| Item | Confirmed state |
| --- | --- |
| Repository | `NhatNguyen2407/Project` |
| Default branch | `main` |
| Baseline commit | `f3cb525306caf7a69d5b3ded7a4b4485804ed1a2` |
| Baseline commit description | Merge PR #6 — pre-launch hardening |
| Application root | `Working_Projects/Dioxyzine_Frog/` |
| Phase 1 working branch | `audit/production-hardening` |
| Vercel production | `https://dioxyzinefrog.vercel.app` |
| Release policy | PR and testing first; do not deploy to production as part of the audit. |

**Important:** A Git branch is not a database sandbox. Vercel Preview may still call the live Supabase project unless explicitly configured otherwise. Never run payment or destructive tests against live data.

## 2. Application inventory

| Layer | Current implementation | Location / note |
| --- | --- | --- |
| Frontend | React SPA + Vite | `src/`, `package.json` |
| Hosting | Vercel | Production build: Vite |
| Authentication and database | Supabase | Browser uses publishable/anon credentials; access controlled by Auth/RLS |
| Checkout | PayPal Sandbox workflow (environment requires separate backend verification) | `supabase/functions/create-paypal-order/`, `capture-paypal-order/` |
| Captured-order storage | Server-side Supabase RPC | `process_paid_order` |
| Product management | Supabase products | `src/app/context/ProductContext.jsx`, `src/app/pages/AdminPage.jsx` |
| Customer inquiries | Supabase inquiries; legacy Apps Script mirroring | `src/app/service/api.js` |
| Customer messaging | EmailJS from client | Checkout/Admin flows |
| Images | Supabase Storage / Cloudinary | Upload utilities and Admin/Profile |
| Production monitoring | Sentry dependency and conditional initialization | `src/main.jsx` (DSN not observed in Vercel project env names) |
| Production operating data | Native Google Sheets, with separate worker workbooks | Names/identifiers intentionally withheld from this public file |

### Production snapshot

- Latest inspected Vercel production deployment: `dpl_5DtxN2UnMsFNVciNzmXbmZEvSnLp`.
- Deployment build state: `READY` on baseline commit; **this is not proof of end-to-end health**.
- Supabase project state: `ACTIVE_HEALTHY` at inspection.
- Active Supabase Edge Functions: `create-paypal-order`, `capture-paypal-order`, `verify-recaptcha`, `delete-account`.
- Local `package.json` scripts: `dev`, `build`. No automated test script observed.
- No app `*.test.*` / `*.spec.*` files found in inspected repository tree.
- The only observed GitHub workflow is `.github/workflows/claude-review.yml`, **not** a substitute for application CI tests.

### Current backend migration caution

Repository SQL files:
- `supabase/migrations/202610130001_security_hardening.sql`
- `supabase/migrations/202610130002_order_tracking_rpc_shape.sql`

Live migration history includes:
- `20261012140001` — `security_hardening_20261013`
- `20261012140254` — `order_tracking_rpc_shape_20261013`

The names describe similar changes but versions differ. **Do not blindly replay these files or alter migration history.** Reconcile live schema, code and migration records during Step 2.

## 3. Business-data boundaries

- **Supabase `orders`** are e-commerce purchase records, not necessarily the same as production orders in Sheets.
- **Google Sheets** maintains production jobs, worker assignments, due dates and operational finance.
- Separate worker workbooks have matched the main operations Sheet for the checked identifiers, assignees, statuses and deadlines at audit time; continuous synchronization has not been proven.
- Legacy Apps Script mirrors inquiry data asynchronously, with no verified delivery acknowledgement.
- Business spreadsheets must remain out of this public repository, including copies, CSVs, screenshots, exact customer data, private links and finance figures.

### Proposed system-of-record decisions (not implemented)

| Information | Proposed authoritative owner | Must validate with business owner |
| --- | --- | --- |
| Online payment / transaction | Supabase + PayPal confirmation | Yes |
| Online customer order | Supabase | Yes |
| Production progress / deadlines | Main management Sheet initially | Yes |
| Staff accounts / roles | Future PA module in Supabase | Yes |
| Tasks / reminders / appointments | Future PA module in Supabase | Yes |
| Operational finance | Finance workbook until reconciled | Yes |

## 4. Security and operational boundaries

- No API service-role keys in frontend, repo or browser logs.
- Do not log Supabase sessions or customer PII.
- RLS and privileged RPC grants must be tested, not guessed.
- AI must start **read-only**; a model must not have unrestricted SQL, payments, staff management or customer communication permissions.
- Production PayPal configuration in Supabase Edge Functions is distinct from Vercel's environment variables.
- Before the first data/schema change: verify backup, restoration, staging environment and migration history.

## 5. Roadmap gates

**Step 1 — Baseline:** inventory + issue register + test plan committed on a non-main branch. No production changes.

**Step 2 — Recovery readiness:** backup Google Sheets and Supabase; verify restore; reconcile migration history; establish DB staging. Requires an explicit follow-up.

**Step 3 — Regression safety:** add automated tests and CI. Requires an explicit follow-up.

**Phase 2 — Product fixes:** inquiry/backend reCAPTCHA, tracking identifiers, Admin write errors, payment resilience, observability.

**Phase 3 — Business data:** financial reconciliation, immutable production IDs, normalization, one-way Sheets synchronization.

**Phase 4–5 — Operations and AI:** RBAC/task/calendar/reminders, then LLM read tools and approval-based actions.

## 6. Verification log

- [x] Inspected `main` SHA and existing application paths.
- [x] Inspected production deployment state and target commit.
- [x] Inspected Supabase project and Edge Function presence.
- [x] Inspected live migration history (read-only).
- [x] Confirmed repository is public; sanitized this documentation.
- [ ] Tested website end-to-end (Step 3 onward).
- [ ] Verified backups and restoration (Step 2).
- [ ] Verified Preview isolation from live Supabase (Step 2).
- [ ] Validated all financial calculations (Phase 3).

**Do not mark any unchecked item complete based on a successful build alone.**
