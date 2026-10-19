# Dioxyzine Frog - Audit Issue Register

> Snapshot: 2026-10-14. This file is in a **public repository** and intentionally contains no customer data, internal financial amounts, private operational document links, credentials or tokens.
>
> State legend: **CONFIRMED** = observed in source/config/metadata; **REQUIRES VALIDATION** = needs active end-to-end testing or business approval; **PLANNED** = missing capability.
>
> Priority: P0 = fix before expanding functionality; P1 = necessary before AI write access; P2 = incremental improvement.

## Phase 1 - Safeguards and baseline

| ID | Priority | Issue / risk | Evidence | Proposed remedy | Verification |
| --- | --- | --- | --- | --- | --- |
| DF-001 | P0 | Schema migration filenames/versions differ from recorded production migration history | Repo SQL filenames vs Supabase migration metadata; CONFIRMED | Compare live schema and applied migration bodies; document canonical history; no blind replay | Diff reviewed and no unexpected migrations run |
| DF-002 | P0 | Backup and restore procedure is not yet demonstrated | REQUIRES VALIDATION | Record backup location, access owner, retention; restore into safe isolated instance | Successful restore drill and timestamped checklist |
| DF-003 | P0 | Preview may use production Supabase environment | REQUIRES VALIDATION | Verify env isolation; provision dedicated staging project where needed | Preview backend target checked without exposing secrets |
| DF-004 | P1 | Automated testing is not configured in app | Only `dev`/`build` scripts; no observed test suite; CONFIRMED | Add unit, integration, RLS and browser smoke tests | CI runs tests on PRs |
| DF-005 | P1 | No comprehensive release and rollback runbook | REQUIRES VALIDATION | Record release checklist, rollback boundary, ownership and post-deploy smoke checks | Dry-run process documented |

## Phase 2 - Customer and application safety

| ID | Priority | Issue / risk | Evidence | Proposed remedy | Verification |
| --- | --- | --- | --- | --- | --- |
| DF-006 | P0 | Inquiry insert can bypass reCAPTCHA checks performed by frontend | `service/api.js`, database INSERT policy, `verify-recaptcha` function; CONFIRMED design gap | Verify token + validate payload + insert in one trusted endpoint, with rate limiting and constrained permissions | Direct unauthorized write fails; legitimate submission succeeds |
| DF-007 | P0 | Tracking ID in outbound emails does not match full UUID required by tracking page | `CheckoutPage.jsx`, `AdminPage.jsx`, `OrderTrackingPage.jsx`; CONFIRMED | Send valid canonical lookup identifier/link | Paid order lookup succeeds using emailed identifier |
| DF-008 | P0 | Some Admin mutations do not check Supabase response errors before showing success | `AdminPage.jsx` product delete and voucher actions; CONFIRMED | Check `error` and affected rows; refresh on inconsistency | Denied mutations show failure and do not change UI falsely |
| DF-009 | P1 | No dedicated customer-inquiry workflow/inbox | Current Admin tabs and query use; CONFIRMED | Create status and ownership workflow + UI | Inquiry lifecycle test |
| DF-010 | P1 | Inquiry Apps Script mirroring is fire-and-forget | `service/api.js`; CONFIRMED | Durable backend outbox, delivery acknowledgement and retries | Failures are visible and replay safely |
| DF-011 | P1 | Email notifications are sent from browser without durable retries | Checkout/Admin EmailJS path; CONFIRMED | Backend notification outbox with idempotency | Failure+retry creates no duplicates |
| DF-012 | P1 | Captured payment might not be reflected in DB if persistence fails | Capture function explicitly handles `paymentCaptured: true`; REQUIRES VALIDATION of recovery operations | Reconciliation workflow by transaction ID | Simulated persistence failure is surfaced and reconciled |
| DF-013 | P1 | Vercel/Supabase PayPal runtime configuration are distinct | Edge Function env code; CONFIRMED | Verify backend mode separately, keep Sandbox tests isolated | Documented environment checks without printing secrets |
| DF-014 | P1 | Browser auth-session object is logged | `AuthContext.jsx`; CONFIRMED | Remove sensitive console output | Automated check + browser inspection |
| DF-015 | P1 | Password leak screening / privileged RPC exposure need security review | Supabase Advisor; CONFIRMED warnings; vulnerability not established | Audit grants, scope, parameter validation and password settings | Security tests and advisor review |
| DF-016 | P1 | Sentry is conditional on a DSN not observed in Vercel env keys | `main.jsx` and Vercel env-name inspection; CONFIRMED configuration gap | Set environment DSNs and PII scrubbing; validate capture | Controlled error received in correct project |
| DF-017 | P1 | Return/refund and stock-restocking workflows are not modeled end-to-end | Order statuses and status handler; REQUIRES VALIDATION | Design explicit return approval, refund and stock disposition | No automatic inventory or payment changes from status alone |
| DF-018 | P2 | Expired reservation can remain labeled active until lazy cleanup | Database sample and reservation RPC; CONFIRMED | Add expiration cleanup/status semantics and monitoring | Expired rows are not counted as valid reservations |
| DF-019 | P2 | Legacy Apps Script catalog reads coexist with Supabase product catalog | `service/api.js` vs `ProductContext.jsx`; CONFIRMED | Inventory references and deprecate unused path | Exactly one supported storefront product source |
| DF-020 | P2 | Advisor reports possible RLS performance/index optimizations | Supabase performance advisor; CONFIRMED warnings | Measure and optimize safe, high-impact queries | Query plans and smoke tests improve / remain correct |

## Phase 3 - Business-data consistency

| ID | Priority | Issue / risk | Evidence | Proposed remedy | Verification |
| --- | --- | --- | --- | --- | --- |
| DF-021 | P0 | Cash-flow formulas reference wrong columns in expense source | Finance workbook; CONFIRMED, details intentionally private | Correct in workbook copy, reconcile with records, approve changes | Independently matched sample-month totals |
| DF-022 | P0 | Sign convention for marketplace expense may distort profit | Dashboard expense formulas; CONFIRMED arithmetic, accounting interpretation pending | Approve sign convention, separate income/expense categories | Financial reconciliation signed off |
| DF-023 | P1 | Historical open production items have past deadlines and may have stale status | Main operations Sheet; CONFIRMED condition, actual overdue requires worker review | Owner-led reconciliation, status/deadline corrections | Exceptions resolved or explicitly annotated |
| DF-024 | P1 | Production-order identifiers may be mutable | Sheet-based row/order numbering; DESIGN RISK | Introduce stable internal IDs and external source mapping | Resorting/row insertion creates no duplicate order |
| DF-025 | P1 | Production and online payment orders have no confirmed mapping | Separate Sheet and Supabase records; CONFIRMED integration gap | Build external order link table with provenance | Cross-system records linked or flagged unresolved |
| DF-026 | P1 | Mixed quantity semantics and missing due-date values | Operations Sheet; CONFIRMED | Structured item quantities and explicit unknown due dates | Validation and exception report |
| DF-027 | P1 | Workflow statuses represent different dimensions across systems | Source system schemas; CONFIRMED | Separate production, fulfillment and payment status | Mapping documented and tested |
| DF-028 | P1 | Staff members in operations Sheets are not backed by staff role accounts | Sheet assignee names vs `user_roles`; CONFIRMED | Staff directory, identity linking, least-privilege RBAC | User sees only entitled tasks |
| DF-029 | P1 | Finance and e-commerce transactions have different currencies/sources | Source systems; CONFIRMED | Monetary amount+currency+exchange-rate metadata; sandbox tagging | Correct segmented reporting |
| DF-030 | P1 | Worker sheet synchronization mechanism not verified | Read-only snapshot matches; mechanism REQUIRES VALIDATION | Establish authoritative source and conflict resolution rules | Update simulation and round-trip verification in copies |

## Phase 4-5 - Required PA capabilities (PLANNED)

| ID | Priority | Required capability | Proposed implementation | Verification |
| --- | --- | --- | --- | --- |
| DF-031 | P1 | Task, assignment, schedule and staff data models | Reviewed schema, RLS and APIs | CRUD+authorization tests |
| DF-032 | P1 | Reliable reminders and notifications | Scheduler, outbox, retries, deduplication and cancellation | Due/overdue/reschedule scenarios |
| DF-033 | P1 | Auditable action history | Immutable-ish event log with actor and old/new values | Trace actor+timestamp for each change |
| DF-034 | P1 | AI tool and approval boundary | Read-only functions first, constrained write proposals later | Red-team tests for privilege escalation and prompt injection |
| DF-035 | P1 | Integration observability and data quality checks | Sync logs, reconciliation reports and alerts | Stale/conflicting sources detected |
| DF-036 | P2 | PA evaluation suite | Representative, anonymized business scenarios | Measured accuracy and safe failure behavior |

## Issue workflow

`untriaged → confirmed → planned → implementation → review → verified → released`.

Before treating any fix as done, record:
1. An owning issue / PR and scope;
2. Before/after evidence without customer or financial data;
3. Test outcome and affected systems;
4. Release target (preview or production) and rollback instructions.

**Review rule:** Do not make database, production, financial workbook, payment, or AI permission changes as part of Step 1.
