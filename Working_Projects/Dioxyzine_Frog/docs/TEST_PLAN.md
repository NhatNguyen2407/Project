# Dioxyzine Frog - Baseline and Regression Test Plan

**Created:** 2026-10-14 | **Status:** PLAN ONLY - NO TEST RUNS CLAIMED\
**Scope:** Phase 1, Step 1: describe verification before introducing new implementation.

## 0. Testing safeguards

- Never run payment capture/refund or destructive mutation against production.
- A preview Vercel URL **does not** imply staging database credentials. Prove environment isolation first.
- Use Supabase staging project and **sandbox** payment credentials for payment tests.
- Use synthetic fixtures; do not upload customer records, staff personal info, secrets, private Sheets, invoices or real transaction identifiers to this repository.
- Clean up only the test resources owned by the testing environment.
- Distinguish **automated assertion**, **manual confirmation** and **not yet tested**.
- For data changes, establish and validate recovery/rollback procedure before execution.

## 1. Baseline checks (Step 1)

| Check | Type | Pass criterion | Current state |
| --- | --- | --- | --- |
| Default branch SHA captured | Read-only | SHA matches inventory baseline | Observed |
| Production deployment metadata | Read-only | Deployment target commit matches main | Observed; build READY |
| Supabase availability | Read-only | Project status fetched | Observed ACTIVE_HEALTHY |
| Existing migration metadata | Read-only | History recorded without replay | Observed; reconciliation pending |
| App test toolchain | Repo read | Scripts and test files inventoried | No test scripts observed |
| Backup / restore readiness | Operational | Restore into separate environment succeeds | NOT TESTED |
| Preview backend isolation | Operational | Points to staging, not production DB | NOT TESTED |

## 2. Application acceptance matrix (Step 3 onward)

| Area | Positive path | Negative / fault path | Environment |
| --- | --- | --- | --- |
| Authentication | Valid login and role | Invalid/expired session, denied role | Staging |
| Products | List and detail visible | Empty catalog, fetch timeout, malformed record | Preview/staging |
| Inquiry | Valid request stored once | Missing reCAPTCHA, spam/rate limit, backend timeout | Preview/staging |
| Admin changes | Correct change persisted | RLS denies mutation, network errors, zero affected rows | Preview/staging |
| Shopping cart | Correct quantity and totals | Stale price, invalid quantity, stock unavailable | Preview/staging |
| Voucher | Correct discount | Invalid/expired/used-up voucher | Sandbox |
| Checkout | Payment creates one order | Duplicate callbacks, capture succeeded / DB failed | PayPal Sandbox + staging |
| Tracking | Correct order from emailed identifier | Wrong ID format, unknown ID, disclosure protection | Staging |
| Email | Single message queued and sent | Provider unavailable, retries, dedupe | Test email service |
| Reservation | Lock, consume, expire | Race conditions, expired rows, repeated order | Staging |
| Storage | Authorized upload | Disallowed file, ownership/RLS violations | Staging |
| Accessibility | Navigation, forms, keyboard | Error/success messaging | Preview |

## 3. Suggested testing infrastructure (not yet installed)

- **Unit/component:** Vitest + React Testing Library.
- **Browser E2E:** Playwright.
- **Data/RLS/API:** Supabase staging, SQL policy checks and Edge Function integration tests.
- **CI:** GitHub Actions for install, build, tests and baseline checks on pull requests.
- **Monitoring:** Sentry test-only event from controlled staging/preview without sensitive data.

Confirm package manager and lockfile before adding or updating dependencies. Do not run broad dependency upgrades as part of test setup.

## 4. Acceptance criteria for any fix PR

- [ ] Issue and scope documented.
- [ ] Root cause recorded; no customer data included.
- [ ] Test proves the broken behavior and the expected correction.
- [ ] Happy path + failure/permission path covered.
- [ ] No secrets or sensitive data in artifacts/logs.
- [ ] CI/build passes on exact PR commit.
- [ ] Preview reviewed against the correct isolated backend.
- [ ] Data migration includes backup plan and rollback strategy.
- [ ] Only authorized reviewer approves production merge.
- [ ] Post-deployment smoke check and monitoring results recorded.

## 5. Milestones

**Phase 1 Step 1 - complete when:** working branch exists, inventory + issues + test plan are in GitHub, all claims are marked correctly, and `main` remains unchanged.

**Phase 1 Step 2 - complete when:** verified backups (including formula-preserving workbook copies), restore practice, staging isolation, and migration reconciliation have written evidence. No claim is made until demonstrated.

**Phase 1 Step 3 - complete when:** implemented tests exercise critical browser, Supabase and sandbox payment workflows; CI reports actual pass/fail status.

## 6. Baseline limitations

A `READY` Vercel build is only a build/deploy result. A healthy Supabase project status is not proof that every RPC, email or frontend flow works. Historical order counts, customer details and private operational metrics intentionally do not belong in this public test plan.

## Phase 1 closeout batch (2026-10-16)

**Scope:** Phase 1 Steps 1-3 in sequence. This is an engineering preparation and acceptance plan, not a claim that full-site E2E or restore succeeded. Keep unmerged until the final gate review.

### Step 1 - Baseline (already complete)

- [x] Record repository and Production deployment baseline; preserve the currently deployed main SHA.
- [x] Inspect existing DB schema, migration histories, role grants and staged change branches.
- [ ] Immediately before release, recheck Production SHA, account/project identity and runtime health.

### Step 2 - Safety, recovery and isolated Preview (preparation complete; verification deferred)

- [x] Configure existing Vercel Preview with a distinct Supabase Staging URL, public client key and exact allowlisted project reference.
- [x] Implement fail-closed Preview build guard and source/negative tests; confirm Vercel Preview build READY for the guarded branch.
- [x] Record schema gaps and migration differences in RECOVERY_READINESS.md. Staging is only inquiry-focused and must not be treated as a restored live DB.
- [ ] Run independent negative LAN-ingress check for the local restore Postgres listener before using any customer/Auth dump.
- [ ] Perform isolated restore to disposable local infrastructure and check RLS, RPC signatures, representative counts, time-to-restore and rollback. Do not put data/credentials in the repository.
- [ ] Verify independent encrypted off-device backup and separately recoverable Storage objects.

### Step 3 - Automated and staged validation

- [x] Enable existing GitHub Actions frozen dependency install, unit/source regression suite and Vite build.
- [x] Add checkout confirmation ID, shipping notification ID, admin mutation confirmation, tracking input validation and public tracking SQL response-contract tests.
- [ ] Confirm GitHub CI and Preview build for the **final combined commit**; previous independent PR green checks do not establish integration correctness.
- [ ] Obtain runtime browser evidence that Preview requests connect only to Staging. Never conduct mutation testing based solely on a build-time guard.
- [ ] Build/provision synthetic Staging contract, separate from a sensitive Production restore, before testing Auth, Admin, products, order tracking and backend functions.
- [ ] Browser E2E: storefront/product/cart/navigation, inaccessible admin without role, invalid/unknown tracking ID, inquiry error/success, status persistence, validation and accessibility basics.
- [ ] Controlled integration: RLS denial/authorized paths, RPC response shape, rate limits, idempotent inquiry submission and email failure behavior; check no real recipients receive messages.
- [ ] PayPal **Sandbox only**: successful capture and record, duplicate/retry, captured-payment persistence uncertainty, stock reservation expiry, and reconciliation by transaction ID. No live capture/refund.
- [ ] Record restore/E2E results and reviewed release/rollback decision. Do not merge sensitive security or checkout changes without this evidence.

### Deferred operator test batch - run once at the end of Step 3

**A. Local/Recovery:** Confirm encrypted disk and Docker health, negative inbound LAN test to local Postgres port 55432, isolated dump compatibility and local restore, selective schema/count/RPC/RLS verification; protect raw reports and remove disposable test data securely.

**B. Browser:** Review intended isolated Vercel Preview, verify backend project identity in safe diagnostics, use only dummy test accounts/content, confirm guest/authenticated/admin roles, inquiries, storefront/cart and tracking; no production writes.

**C. External integrations:** Sandbox PayPal and stock order paths, test-only EmailJS recipients, separate Cloudinary bucket/preset, Google Apps Script/Sheets isolation, reCAPTCHA permitted hosts, and rollback. Stop if any integration still points to Production or sends messages to real users.

**D. Final gate:** Recheck exact commit CI/build and Supabase security advisor, compare database changes and grant/RLS cutover plans, document go/no-go, approve a release only after recovery and staged tests pass.

### Explicit exclusions until the final gate

- No Production migration, RLS/grant edits, mass data copying or live PayPal capture.
- No automatic merge of Phase 2 PRs (#12, #14, #19, #20, #21): each needs a separate impact assessment; Inquiry cutover specifically must coordinate frontend, function, rate limit and RLS.
- CI success means only the automated checks executed successfully; it never certifies runtime security or payment correctness.
