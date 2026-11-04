# Dioxyzine Frog - Baseline and Regression Test Plan

**Created:** 2026-10-14 | **Updated:** 2026-11-04\
**Scope:** Current four-part functional review, with the older baseline retained below.

## Storefront review - 2026-11-04

I am prioritizing functional reliability in this four-part review. On 2026-11-04, I deferred product content and Cut Style classification until after the functional work. Missing catalog data does not block Part 1. The older phases below remain a historical baseline.

| Part | Current status |
| --- | --- |
| 1. Products and cart | Functional scope complete; 25 automated tests and production build PASS; hosted checks recorded below; product content and Cut Style classification deferred |
| 2. Auth, Profile and Wishlist | In progress: 2.1 accepted for customer login/sign-out; 2.2 implemented with automated checks; real email and OAuth acceptance pending; 2.3 and 2.4 pending |
| 3. Inquiry and Admin | Not tested in this review |
| 4. PayPal Sandbox | Not tested in this review |

| Part 1 issue | Change | Verification / remaining work |
| --- | --- | --- |
| Ready-made item shows Custom Quote on a generic product URL | Detail behavior uses product type; cards show ready-made prices and use consistent links | Production `/product/RDY-01` shows $40 and Add to Cart; back/previous/next links stay in ready-made; route tests PASS |
| Custom tab includes ready-made products | Filter product type before category, search and cut style | Production shows 15 CUS products, no RDY cards; category/search regression tests PASS |
| Cut Style always returns an empty list | Preserve `cut_style` in product context; disable styles with no classified products; Admin preserves unspecified values | Production keeps all seven unclassified plushies visible and disables unavailable styles; both classified styles and null values pass automated tests; catalog classification deferred, not a blocker for Part 1 |
| Two cart drawers open on product detail | Keep only the application-level drawer | Production has one drawer; adding, increasing to two ($80), reloading, decreasing to one ($40), checkout navigation and removal PASS; test cart emptied |

**Release verified:** `main@b1170f4`, Vercel Production READY, checked on 2026-11-04. No payment was initiated. These browser checks cover the listed paths only. Admin saving a classification has not been tested with a real write.

No catalog rows, orders, customer records or payment settings were changed. Missing cut styles must be classified later from confirmed product specifications, not inferred from a title or an ambiguous pricing code. The filter becomes available as classified products are saved in Admin. Verification of Admin saving remains in Part 3. Hosted verification does not imply user acceptance.

## Part 2 review - 2026-11-04

I am fixing one small group at a time. Findings below are confirmed in current source or backend metadata; this does not mean every failure has been reproduced with a real customer account.

| Step | Confirmed problem and cause | Fix / status |
| --- | --- | --- |
| 2.1. Session initialization and permissions | The Auth callback awaited a role query; the whole app was hidden until initialization finished; failed or hung reads had no recovery; late responses could overwrite a newer account or retain an old role; Login duplicated the role lookup and competed with PublicRoute navigation; Login/Register printed full Auth responses | IMPLEMENTED: synchronous notification callback, deferred role queries, 10-second deadlines, retry UI on Auth routes, cancellation and response ordering, role reset on account change, shared signed-in redirect and removal of response logs |
| 2.2. Registration and password recovery | Forgot Password treats every HTTP 400 as success; Reset Password treats any existing session as a valid recovery session and checks errors only in the URL fragment; after changing the password it redirects to Login without ending the recovery session | IMPLEMENTED: report returned delivery errors; require an SDK recovery event or a stored marker matching that verified session; check both URL error locations; end the current recovery session before Login; retry failed sign-out without changing the password again; consistent signup-confirmation and OAuth return routes. Real email and OAuth acceptance pending |
| 2.3. Profile and account deletion | Saving performs separate writes, so failure can follow an earlier successful change; immediate reload hides notices; membership perks are advertised without checkout enforcement; deployed delete-account v6 sets inquiries.contact_info to null although the column is NOT NULL, after other records may already have changed | PENDING: clear partial-result handling, persistent notices and profile refresh, accurate membership text, and consistent account anonymization; never test deletion on a real account |
| 2.4. Wishlist | ProductCard does not reset the liked state on sign-out/account change and does not cancel stale reads; removal updates the UI without confirming affected rows | PENDING: reset and scope state by account, cancel stale reads and confirm persisted mutations |

### 2.1 verification

- `pnpm test`: 41/41 PASS, including 17 Auth checks. The Auth lifecycle cases use a simulated client and clock, not real account credentials.
- Covered: anonymous startup, synchronous callback/deferred request, startup/event races, sign-out, admin-to-customer switch, missing roles, reordered responses, token refresh without returning to loading, RLS/network-style errors, hung reads, aborted requests, cleanup and role-based redirect selection.
- `pnpm build`: PASS. The existing large-bundle warning remains; no dependencies changed.
- Public pages now render while Auth is checking; only Auth/protected routes wait or show a retryable error. Server authorization remains in Supabase, not in the frontend role state.
- Read-only backend inspection: user_roles and wishlists policies scope access to auth.uid(); no customer records, roles, RLS policies, credentials or payment settings changed. Staging remains INACTIVE.
- Production `main@899ac86`: READY on 2026-11-04. Anonymous browser checks PASS: Login renders after reload; empty submission shows required-field errors; unauthenticated `/profile` redirects to `/login`; Home still renders its catalog. No credentials were entered and no Auth records changed.
- User acceptance on 2026-11-04: customer login and sign-out PASS, with no functional issue reported. Reload and live Admin sign-in were not explicitly confirmed. OAuth, recovery emails, user-driven password changes and account deletion remain untested.
- The user also reported Chromium's missing-autocomplete diagnostic on the Login password field. Added `autoComplete="username"` for the email and `autoComplete="current-password"` for the existing password. This improves password-manager field recognition; it does not change authentication logic. The production build passes for this markup-only change.

The historical loss of site access has not been attributed conclusively to Auth. Moving database work out of notifications follows [Supabase's Auth callback guidance](https://supabase.com/docs/reference/javascript/auth-onauthstatechange); the timeout and ordering defects are independently visible in the application code.

### 2.2 verification

- `pnpm test`: 62/62 PASS, including 21 new recovery and registration/service checks. These use simulated Auth responses, sessions and clocks; they do not prove email delivery or provider configuration.
- Covered: ordinary sessions denied recovery, early recovery events, SDK event ordering, reload with the same verified session, account/session changes, sign-out, expired proof, malformed tokens/storage, disabled storage, both URL error locations, startup deadline and cleanup.
- Covered: trimmed signup/reset input, explicit confirmation/reset return URLs, consistent Google/Facebook return routes, returned HTTP 400/429/500 and network failures, session revalidation before password update, update failure, local sign-out and independent sign-out retry.
- The recovery marker contains only user/session identifiers and a bounded expiry, never access/refresh tokens or passwords. It is scoped to the browser tab, matches the current session and expires no later than the original token or one hour. Supabase still authorizes the password update.
- Registration, reset and recovery inputs now have matching labels and autocomplete attributes. Registration retains the existing reCAPTCHA check before signup.
- `pnpm build`: PASS; the existing large-bundle warning remains. No dependencies, Auth records, database policies, provider settings or payment settings changed.
- Production `main@872771d`: READY on 2026-11-04. Anonymous browser checks PASS: direct reset access and query/fragment errors show the invalid-link page; requesting a new link opens Forgot Password; empty/malformed email stays on the form with an error; empty registration shows required-field and terms errors; labels and autocomplete values match the intended fields. No Auth request was submitted and no email or credentials were used.
- GitHub Actions `Dioxyzine Frog CI` for `872771d`: PASS (frozen dependency install, all tests and production build).
- Real confirmation-email delivery, opening a genuine recovery email, password update followed by login with the new password, and Google/Facebook consent/redirect completion are NOT TESTED. Use only an inbox controlled by the tester; dummy addresses without inbox access cannot verify these paths.

**Next checkpoint:** complete 2.2 real email/OAuth acceptance; the next implementation group is 2.3 Profile/account deletion. The remaining reload/Admin live checks are tracked above. Product titles, images, descriptions, pricing data and Cut Style classification remain a separate deferred catalog update. Part 3 and Part 4 have not started.

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
