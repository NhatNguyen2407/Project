# Dioxyzine Frog — Improvement Progress

Last verified: **2026-10-16** (Asia/Bangkok). This is a **public**, redacted engineering status file. Do not publish customer data, internal financial metrics, backup links or secrets.

## Status snapshot

| Workstream | Progress | Verified evidence | Remaining gate |
| --- | --- | --- | --- |
| Phase 1 / Step 1: production baseline | **COMPLETE** | Main inventory, issue register and test plan were committed and merged as PR #7 | Keep snapshot current as architecture changes |
| Phase 1 / Step 2: data recovery and staging safety | **PARTIAL** | Private workbook backup inspected; source & backup sampled cell data/formulas match; recovery notes and local private export/hash checks recorded | Witnessed restore drill, independent network isolation, encrypted off-device backup, complete migration reconciliation, Supabase backup coverage, staging/Preview separation |
| Phase 1 / Step 3: test and CI safeguards | **PARTIAL** | Existing GitHub Actions CI successfully runs frozen pnpm install, Node tests and Vite build. PR #16 adds source-contract tests; run #38839456143 passed, including test-and-build job | Browser E2E; true Supabase RLS and Edge Function integration; PayPal Sandbox failure/reconciliation tests; review and merge PR #16 |
| Phase 2: critical site fixes | **PARTIAL** | Earlier fixes already on main include canonical order UUID checks, confirmed Admin mutations, and removal of auth session logging | Inquiry write/CAPTCHA bypass, notifications/retries, reporting, operational monitoring |
| Phase 3: operations and finance data | **NOT STARTED** | Business workflow issues inventoried | Reconciliation, identifiers, status mapping and Sheets integration |
| Phase 4: PA infrastructure | **NOT STARTED** | Design candidates noted in audit | Roles, tasks, calendar and reliable reminders |
| Phase 5: AI assistance | **NOT STARTED** | Safety/approval boundaries identified | Only proceed after trustworthy operations data and authorization controls |

## Recovery verification performed on 2026-10-16

- Created an additional native management workbook backup, verified owner-only Drive permissions and the expected ten tabs. The private backup URL is deliberately absent from this public repository.
- Compared two bounded sample areas: dashboard and cashflow, 25 rows × 10 columns per tab.
- In those areas, **89 populated cells** and their user-entered contents match the original. This includes **53 formula cells**. No mismatches were found in that sample.
- These checks **do not** prove that the whole workbook, dependent/imported spreadsheets, automation scripts or database can be restored.
- The original management workbook was observed with link-based `anyone: writer` permission. **Do not modify staff access without an approved access map.**
- Live Supabase development-branch list was empty. Production migration history does not share the filenames/version IDs of the checked-in final two SQL scripts.
- The previously documented local SQL/Auth/Storage private backup-hash checks were not re-performed in this session. Live restore remains unverified.

## Test verification performed on 2026-10-16

- Main already contains `.github/workflows/dioxyzine-frog-ci.yml`, `tests/orderIntegrity.test.mjs` and `tests/authSession.test.mjs`.
- PR #16 introduced `tests/criticalFlowContracts.test.mjs` to guard customer order IDs in emails and the Supabase Admin mutation-confirmation contract.
- All new assertions were checked against the exact source files on GitHub.
- GitHub Actions PR run **38839456143** reported `completed / success`; `test-and-build` job reported success for frozen dependencies, tests and build.
- A passing build + contract test is **not** evidence that full payment, role enforcement, tracking RPC, emails or inventory operations work end-to-end.

## Tracking

- Phase 1 Step 2 recovery/staging: [Issue #15](https://github.com/NhatNguyen2407/Project/issues/15)
- Phase 1 Step 3 integration/E2E: [Issue #17](https://github.com/NhatNguyen2407/Project/issues/17)
- Newly proposed additional contract tests: [Draft PR #16](https://github.com/NhatNguyen2407/Project/pull/16)
- Phase 1 recovery findings: `docs/RECOVERY_READINESS.md`
- Prioritized work list: `docs/AUDIT_ISSUES.md`

## Release rules

1. Continue with isolated, non-production tests before any database migration or payment-flow change.
2. Never mistake Vercel Preview for isolated staging without proving the Supabase URL/project binding is different from Production.
3. No bulk RLS policy changes, financial workbook edits or permission resets without a safe rollback and impact review.
4. Keep change PRs in draft until green checks + intended change reviewed. No merge or production deploy is implied by a passing PR check.

## Preview isolation safety — 2026-10-16 (additional review)

- Verified **PR #16** latest GitHub Actions run `38839615432`: completed successfully after the progress documentation commit.
- Created **[Draft PR #18](https://github.com/NhatNguyen2407/Project/pull/18)** on separate branch `safety/preview-backend-isolation`. It adds a fail-closed Vite build check for `VERCEL_ENV=preview`, requiring a distinct staging Supabase reference and its exact HTTPS project URL. The change does not alter Production/local build behavior.
- Six Preview guard test cases passed in local Node tests. GitHub Actions run **38840219391** completed successfully on PR #18 (frozen dependency installation, Node tests, Vite build).
- **No real staging backend was created**, and Vercel Preview runtime isolation was not demonstrated. Until staging variables are configured, this guard deliberately blocks Preview builds when merged.
- Neither Draft PR #16 nor Draft PR #18 was merged here. No Production database, Vercel environment variables, spreadsheet permissions, or payment configuration changed.

