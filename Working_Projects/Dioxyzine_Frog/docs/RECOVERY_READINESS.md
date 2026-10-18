# Dioxyzine Frog - Recovery Readiness and Migration Reconciliation

**Assessment date:** 2026-10-18
**Scope:** Phase 1 / Step 2 - backup verification and migration reconciliation.  
**Status:** Offline database restore VERIFIED; full hosted platform recovery and independent backup retention remain incomplete.

## Latest verified recovery checkpoint — 2026-10-18

A disposable local PostgreSQL restore completed with networking disabled, no
published port and data on tmpfs. All 41 data-table counts matched the snapshot.
Compared 43 table definitions, 439 columns, 35 function hashes, 22 RLS policies,
961 table/sequence ACL entries, 82 function grants and 10 triggers. Application,
Auth and Storage migration-history counts matched. Guest denial, owner access,
Admin role, paid-only Tracking and rollback probes passed.

All eight Storage files were recovered; byte sizes and single-part MD5 values
matched snapshot metadata, with a private SHA-256 manifest retained locally.
The three original SQL files still match their original manifest. No customer
data was imported into hosted Staging.

This is evidence of offline SQL recovery, not a complete Supabase platform
restoration. Hosted Auth/OAuth behavior, Storage API re-upload, provider settings,
Edge secrets, deployment rollback and an independent encrypted off-device copy
remain release gates. Docker was later closed; its stopped state does not undo
the recorded restore results. Do not start an exposed database to repeat this drill.

The dated assessment below is historical and is superseded by this checkpoint
where it says the offline restore or isolated Staging was unverified.

This document is kept in a **public GitHub repository**. It excludes private backup links, customer records, spreadsheet IDs, payment credentials, internal financial figures, and personal access information.

## 1. Recovery assessment

| Area | Verified outcome | Status |
| --- | --- | --- |
| Main management workbook copy | A separate native Google Sheets workbook was created and re-read with owner-only access | VERIFIED |
| Worker workbook copies | Three separate native copies were created and verified as owner-only | VERIFIED |
| Workbook structure | All ten tabs in the main workbook match the source tab names and grid dimensions | VERIFIED |
| Formula spot check | All 25 formula cells in two sampled dashboard/cashflow regions matched between source and copy | VERIFIED - SAMPLED |
| Main workbook restore drill | No actual restore into a disposable workspace performed | NOT TESTED |
| Database backup | Local logical exports and manifest hashes verified; successful restoration not demonstrated | EXPORT VERIFIED; RESTORE NOT VERIFIED |
| Database restore drill | No staging/test restore performed | NOT TESTED |
| Storage assets backup | Eight Storage objects copied and checked against local manifest hashes; re-upload/recovery not demonstrated | COPY VERIFIED; RESTORE NOT VERIFIED |
| Deployment rollback | Source revision and previous deployments identified; rollback not rehearsed | NOT TESTED |
| Staging database isolation | No existing Supabase development branch was returned | NOT VERIFIED |

**Important:** A copied Google Sheet is an operational snapshot, not a complete disaster-recovery solution. Copies kept under the same Google account/Drive are vulnerable to account-level access loss. Store an independent, access-controlled export when the team agrees on retention and ownership.

### Drive sharing advisory

Read-only permission inspection found:
- Main operations workbook: link-based permission `anyone: writer`.
- Three production worker workbooks: link-based permission `anyone: reader`.
- The newly created backup copies were owner-only at verification time.

The source files' permissions were **not changed** to avoid interrupting existing team workflows. Review and restrict access based on actual required roles before using these files as AI input sources.

## 2026-10-14 local backup verification update

A local operator performed the following steps on a BitLocker-protected Windows data volume, outside any Git working tree:

- Application database: separate roles, schema and data SQL exports were created. The SHA-256 hashes and byte sizes of the three SQL files matched their local manifest.
- Storage: both required object buckets were copied locally. Eight files were counted, and the file count, aggregate size and SHA-256 hashes matched the local Storage manifest.
- Auth: a separate Auth data-only export was inspected locally. Its user, identity and session row counts matched an independent read-only count from the live project at that time, and its SHA-256 matched the local manifest.
- Backups remain only on the local encrypted volume as far as currently verified. This is **not** an off-device or independently retained backup.
- Docker Desktop WSL disk migration from the nearly full system drive to the separate data volume was initiated through Settings. A post-restart Docker status check is still required.
- A local-only preflight helper is available at `scripts/verify-private-backups.ps1`. It checks backup manifests, hashes, Docker availability and free disk space without restoring anything or connecting to Production.

**Limits:** These checks establish local file integrity relative to locally generated manifests, not transactional consistency across the separate exports, not remote source checksums and not restore success. Auth exports may contain authentication secrets; never place them in this repository or attach them to issues. Supabase project settings, Edge Function secrets, provider configuration, and a separate encrypted off-device copy are not yet captured or verified.

**Next recovery gate:** Verify Docker Engine after its data-directory move, inspect the local preflight report, then devise a disposable isolated restore environment. The repository has only two later migration files while Production records six migrations; never run a blanket local `supabase db reset` as a surrogate for a full production restoration. No restore to or reset of Production is authorized.

**Google Sheets access decision:** Existing source workbooks retain their current sharing arrangement at the owner's request. Permission changes are deferred and are not a blocker for this backup validation. Do not alter operational spreadsheet permissions during the recovery drill.

## 2. Git versus live Supabase migration history

| Feature | Git repository migration | Live migration record |
| --- | --- | --- |
| Security hardening | `202610130001_security_hardening.sql` | `20261012140001_security_hardening_20261013` |
| Tracking response shape | `202610130002_order_tracking_rpc_shape.sql` | `20261012140254_order_tracking_rpc_shape_20261013` |

**Observation:** The version identifiers differ. Identical descriptions do not by themselves prove that migrations are equivalent.

Read-only database checks further established:
- `public.is_admin()` exists as a `SECURITY INVOKER` function with role lookup.
- `public.track_order_status(uuid)` returns a limited JSONB object for paid orders, matching the **effective result of both repository migration files when applied in order**.
- All eight ordinary tables in the `public` schema have RLS enabled.
- Role-specific RLS policies and table grants are present on the inspected tables.

**Reconciliation state: PARTIAL.** The sampled critical function signatures and behavior match the intended latest design. A complete object-by-object SQL diff, complete privilege check, and migration history resolution are still required.

### Change safety

Do not:
1. Re-run old migration files against live data;
2. Edit production migration history merely to make names match;
3. Create a new schema migration before verifying an isolated environment and recoverable backup;
4. Export live customer data into the public repository.

## 3. Steps needed to close Step 2

1. Confirm the project's Supabase backup availability in **Database > Backups** and whether daily backups/PITR are enabled by its plan. Do not infer coverage from project health.
2. Capture a verified, appropriately encrypted database snapshot (including schema and application data), with owner-controlled retention and **no public repo upload**.
3. Inventory and separately back up necessary Supabase Storage object files; database backups do not contain Storage object bytes.
4. Provision an isolated Supabase staging branch/project if the team chooses to do so; avoid any chargeable provisioning before cost confirmation.
5. Prove restoration to an isolated test environment, validate schema + representative data counts and role policies, and record recovery time.
6. Reconcile the two local SQL files against the exact live schema and migration history; document the safe canonical approach before migration work.
7. Confirm Vercel Preview environment points to staging rather than production Supabase.
8. Review who needs to edit/view the operations Sheets, then replace broad public permissions without breaking staff workflow.

## 4. Recovery acceptance criteria

- [x] Separate private copy of management workbook exists and was verified.
- [x] Separate private copies of three worker workbooks exist and were verified.
- [x] Main workbook tab structure and 25 sampled formula cells were checked.
- [x] Live migration list captured and compared with repo filenames.
- [x] Two critical live functions inspected and matched to latest intended shape.
- [ ] External or independently controlled backup of management data verified.
- [ ] Recoverable production database backup verified.
- [ ] Storage file backup verified.
- [ ] Supabase staging environment established and isolated.
- [ ] Database and workbook restore drills performed.
- [ ] Full SQL/schema diff and migration reconciliation completed.
- [ ] Preview isolation documented and tested.
- [ ] Public link permissions remediated with team-approved access rules.

Until all required recovery checks pass, **Step 2 remains open**.

## Isolated local restore preparation and database readiness

Docker Desktop reported its WSL disk location on the encrypted data drive after restart; subsequent local preflight reported the Docker Engine reachable and all application, Storage, and Auth backup hashes matching their local manifests. This confirms neither a database restore nor an end-to-end recovery.

A new preparatory helper is available at `scripts/prepare-restore-workspace.ps1`. It builds a disposable local Supabase CLI project in a directory alongside the backup repository, separate from the live-linked application clone. It refuses to overwrite a pre-existing workspace, assigns a distinct local project identifier and database port, and disables the normal migration and seed workflow in its generated configuration. **It does not start Docker containers, import SQL, execute production queries or restore customer data.** CLI behavior must be checked on the operator's installed version before attempting any local database start.

Recovery drill design constraints:
- The canonical live migration history has six entries, while the repository has only the two most recent SQL files. Do not replay these as a substitute for restoring the schema snapshot.
- Inspect roles/schema/data/Auth SQL for compatibility before choosing restore order and commands. If any ambiguity exists, stop before import.
- Keep real Auth dumps and any restored credentials on encrypted local storage only. Never expose a local instance containing copied real accounts or let a test app connect to live services.
- A full platform recovery plan still needs non-SQL settings, Edge Function secrets, and tested Storage object re-upload, plus an off-device protected copy.
- Do not apply `supabase db reset`, migrations, or restore commands against the linked Production project.

### Local database readiness verification (2026-10-14)

The operator successfully ran `scripts/prepare-restore-workspace.ps1` and started the local database using `supabase db start` in the isolated (unlinked) workspace.

Read-only runtime checks confirmed:
- Container `supabase_db_dioxyzine_frog_restore_drill` reported `Up (healthy)`.
- `docker exec ... pg_isready -U postgres -d postgres` returned `accepting connections`.
- Local PostgreSQL is mapped to host port `55432`. **It currently binds `0.0.0.0` and `[::]`**, which may permit access from outside the host if network/firewall settings allow it.
- **No application database, Storage object, or Auth SQL dump has been restored.**

**Historical security gate:** A dedicated Docker bridge network was prepared with `com.docker.network.bridge.host_binding_ipv4=127.0.0.1`, but Windows Docker Desktop continued publishing the database to wildcard host interfaces; network isolation was therefore **not demonstrated**. See subsequent runtime and Windows Firewall results below. Do not import real user records before independently verifying network ingress protection. References: https://supabase.com/docs/guides/local-development and https://docs.docker.com/engine/network/port-publishing/.

**2026-10-14 follow-up:** The operator created `dioxyzine_frog_restore_loopback` with Docker bridge option `com.docker.network.bridge.host_binding_ipv4=127.0.0.1` and restarted local PostgreSQL using `supabase db start --network-id dioxyzine_frog_restore_loopback`. Runtime inspection confirmed `HostConfig.NetworkMode=dioxyzine_frog_restore_loopback`, but Docker still published the container as `0.0.0.0:55432` and `[::]:55432`. `HostConfig.PortBindings` for `5432/tcp` showed `HostIp=""`, `HostPort="55432"`. Therefore network option alone **did not provide host-loopback-only exposure on this Windows Docker Desktop setup**.

**Proposed next safeguard (not yet applied):** A named Windows Defender Firewall inbound Block rule scoped to TCP local port `55432`, all network profiles, with administrative privileges and a documented removal command. Verify firewall rule state and continuing localhost access. **Do not import customer/Auth data until ingress protection is independently confirmed.** The published Docker port will continue to *display* wildcard addresses even when a host firewall blocks remote traffic; do not confuse the two. Avoid broad Docker daemon changes or removal of unrelated containers. References: https://docs.docker.com/desktop/features/networking/ and https://learn.microsoft.com/en-us/powershell/module/netsecurity/new-netfirewallrule.

**Windows Firewall rule created (operator confirmation, 2026-10-14):** The operator used an elevated PowerShell session to create a named rule `Dioxyzine Frog Restore Drill - Block Remote PostgreSQL`, with `Direction=Inbound`, `Action=Block`, `Protocol=TCP`, `LocalPort=55432`, `Profile=Any`. A subsequent `Get-NetFirewallRule` reported `Enabled=True`, `Inbound`, `Block`. **This confirms rule presence, not that Docker Desktop's network traffic is blocked in practice.** Docker documents that traffic to containers traverses `com.docker.backend.exe` on Windows; actual LAN reachability remains untested.

Next perform a *read-only* localhost TCP test using `Test-NetConnection -ComputerName 127.0.0.1 -Port 55432`. If local TCP connectivity fails, do not modify firewall rules without diagnosis. If local TCP succeeds, test reachability from a separate LAN device or establish another appropriately scoped isolation control before restoring live customer/Auth data. A test to the PC's own LAN address from the same PC **does not substitute** for an independent LAN device test. Do not mistake a wild-card Docker port mapping for a verified access-control result.

**Local TCP check completed:** Operator ran `Test-NetConnection -ComputerName 127.0.0.1 -Port 55432` after creating the firewall rule. Result: `TcpTestSucceeded=True` with interface `Loopback Pseudo-Interface 1`. This proves localhost reachability only. The separate-LAN-device negative test remains pending before any restore of personal/Auth data.

**Next recovery gate:** Once database localhost-only exposure and connectivity are verified, review SQL import compatibility and order before an isolated dry-run. Keep real Auth data separate unless and until a secure, justified test is approved. Record actual restore results separately; no recovery claim is made from health checks alone.

## 5. Reference

Supabase documentation: https://supabase.com/docs/guides/platform/backups

Backups and restores may depend on the subscription plan. Never restore a production database in place as a test.

## 2026-10-16 read-only cross-environment audit

This checkpoint used only metadata queries through the connected Supabase tools and reviewed repository migration files. No production or staging SQL writes, data exports, restore, payment calls, or new resources were performed. Do not treat this inventory as a full semantic schema diff.

| Area | Production (live metadata) | Staging (live metadata) | Gate |
| --- | --- | --- | --- |
| Public tables | 8, all with RLS | 1 (`inquiries`), with RLS | Full-app tests BLOCKED |
| Public function signatures | 12 | 1 (`consume_inquiry_quota(text)`) | Order/Admin RPC tests BLOCKED |
| Public RLS policies | 14 | 1 | Role matrix differs by design |
| Migration history | 6 live entries | 3 inquiry-focused entries | Histories must NOT be merged or replayed blindly |
| `inquiries` fields | 27 | 14 | Missing 13 live application fields in Staging |
| Inquiry data | Not exported or replicated | No inquiry rows at inspection | Synthetic fixtures only |
| Edge Functions | Not verified in this checkpoint | None deployed at earlier inspection | Inquiry endpoint integration BLOCKED |

Staging's `inquiries` table has its own quantity constraints and a simplified column set; it is a limited, independent test contract, **not a restore of Production**. The 13 additional Production inquiry columns relate to delivery/payment/review/administration fields. Production also has `orders`, `order_reviews`, `products`, `vouchers`, `wishlists`, `user_roles`, and `stock_reservations`; these are absent from Staging.

**Role/RLS boundary:** Staging grants neither SELECT nor INSERT to `anon` for `inquiries`; `authenticated` has SELECT-only with owner-scoped RLS; Staging's `consume_inquiry_quota(text)` can be executed by `service_role` only. Production intentionally includes a public Inquiry INSERT policy and an `anon` INSERT grant; this remains a live bypass of the planned trusted server-side CAPTCHA submission. Do **not** revoke it independently: coordinate Edge Function deployment, compatible frontend release, verification, and rollback per Draft PR #21. No Production permissions changed.

**Function access inventory:** Production has twelve public SQL/RPC functions. The inspected mutating payment/stock functions (`process_paid_order`, `reserve_product_stock`, `decrement_product_stock`, and `increment_voucher_usage`) are callable by `service_role`, not by `anon` or `authenticated`. Public `track_order_status(uuid)` and `get_public_reviews(text)` are intentionally callable by guests using `SECURITY DEFINER`. Review their returned fields, object grants, and abuse controls before certifying the overall security posture; presence of an advisor warning alone does not prove exploitation. Supabase Security Advisor reports warnings for externally callable `SECURITY DEFINER` functions and an informational notice for `stock_reservations` with RLS but no policy. No automatic privilege changes were applied. [Security lint guidance](https://supabase.com/docs/guides/database/database-linter).

**Migration history:** Production records `20261012140001` and `20261012140254` for the security and tracking revisions, while repository files are `202610130001_security_hardening.sql` and `202610130002_order_tracking_rpc_shape.sql`. Names and overlapping intended behavior are not full SQL equivalence; the two repository files cannot replace the earlier four Production migrations. Staging's three `20261015...` inquiry migrations represent a separate partial test schema. Do not repair history, replay files, or deploy those changes to Production without a reviewed canonical baseline and isolated restore.

**Backup coverage:** Supabase organization is on the Free plan. [Supabase Database Backups documentation](https://supabase.com/docs/guides/platform/backups) states platform-managed daily backups cover Pro/Team/Enterprise, and recommends self-managed off-site exports for Free. Therefore no platform daily recovery point/PITR is established. Previously validated local encrypted SQL/Auth/Storage export hashes are **not** evidence of a successful restore or independent off-device retention. No new backup was made by this audit.

### Remaining Phase 1 / Step 2 release gates

1. Independently verify that the Windows host's local PostgreSQL port 55432 is **not reachable from another LAN device** before importing any live Auth/customer dump. Existing localhost success and Windows firewall rule presence do not prove network isolation.
2. Verify local restore prerequisites, sensitive-dump handling and source consistency, then perform a witnessed isolated restore in a disposable environment (never overwrite Production). Record timings, non-sensitive schema/row-count parity, RPC signatures, RLS and rollback result; keep raw dumps private.
3. Establish independent encrypted off-device backup retention and separately verify recoverable Storage object bytes; document recovery point/RPO and expected RTO without publishing sensitive paths.
4. Reconcile full Production schema, policies, functions, triggers, and migration history with a canonical reviewed baseline before attempting to make Staging full-app compatible. Do not copy Production customer, order or Auth data into hosted Staging.
5. Verify Vercel browser/runtime backend identity and sandbox all external integrations before Staging E2E; a Preview build reporting READY is not sufficient.

**Gate decision:** Phase 1 / Step 2 remains PARTIAL. Do not merge the security/inquiry cutover or treat Staging as production-equivalent based on these metadata checks.
