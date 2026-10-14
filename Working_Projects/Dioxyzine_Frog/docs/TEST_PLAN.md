# Dioxyzine Frog - Baseline and Regression Test Plan

**Created:** 2026-10-14 | **Status:** PLAN ONLY - NO TEST RUNS CLAIMED  
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
