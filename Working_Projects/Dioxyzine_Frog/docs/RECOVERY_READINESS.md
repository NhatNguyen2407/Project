# Dioxyzine Frog - Recovery Readiness and Migration Reconciliation

**Assessment date:** 2026-10-14  
**Scope:** Phase 1 / Step 2 - backup verification and migration reconciliation.  
**Status:** PARTIALLY COMPLETE. Restore drill and database recovery point are NOT verified.

This document is kept in a **public GitHub repository**. It excludes private backup links, customer records, spreadsheet IDs, payment credentials, internal financial figures, and personal access information.

## 1. Recovery assessment

| Area | Verified outcome | Status |
| --- | --- | --- |
| Main management workbook copy | A separate native Google Sheets workbook was created and re-read with owner-only access | VERIFIED |
| Worker workbook copies | Three separate native copies were created and verified as owner-only | VERIFIED |
| Workbook structure | All ten tabs in the main workbook match the source tab names and grid dimensions | VERIFIED |
| Formula spot check | All 25 formula cells in two sampled dashboard/cashflow regions matched between source and copy | VERIFIED - SAMPLED |
| Main workbook restore drill | No actual restore into a disposable workspace performed | NOT TESTED |
| Database backup | Neither scheduled backup nor an independent logical snapshot has been verified as recoverable | NOT VERIFIED |
| Database restore drill | No staging/test restore performed | NOT TESTED |
| Storage assets backup | Storage API files require separate inventory/backup; database backups alone do not include object bytes | NOT VERIFIED |
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

**Security gate before any import:** Confirm Supabase CLI support for using a dedicated Docker bridge network with the host binding option `com.docker.network.bridge.host_binding_ipv4=127.0.0.1`. Reconfigure/recreate only the disposable local instance as needed and independently verify the new published bind address, without changing other Docker workloads or the Production project. Avoid using exposed local services for real user records. Documentation: https://supabase.com/docs/guides/local-development and https://docs.docker.com/engine/network/port-publishing/.

**2026-10-14 follow-up:** The operator created `dioxyzine_frog_restore_loopback` with Docker bridge option `com.docker.network.bridge.host_binding_ipv4=127.0.0.1` and restarted local PostgreSQL using `supabase db start --network-id dioxyzine_frog_restore_loopback`. Runtime inspection confirmed `HostConfig.NetworkMode=dioxyzine_frog_restore_loopback`, but Docker still published the container as `0.0.0.0:55432` and `[::]:55432`. `HostConfig.PortBindings` for `5432/tcp` showed `HostIp=""`, `HostPort="55432"`. Therefore network option alone **did not provide host-loopback-only exposure on this Windows Docker Desktop setup**.

**Proposed next safeguard (not yet applied):** A named Windows Defender Firewall inbound Block rule scoped to TCP local port `55432`, all network profiles, with administrative privileges and a documented removal command. Verify firewall rule state and continuing localhost access. **Do not import customer/Auth data until ingress protection is independently confirmed.** The published Docker port will continue to *display* wildcard addresses even when a host firewall blocks remote traffic; do not confuse the two. Avoid broad Docker daemon changes or removal of unrelated containers. References: https://docs.docker.com/desktop/features/networking/ and https://learn.microsoft.com/en-us/powershell/module/netsecurity/new-netfirewallrule.

**Next recovery gate:** Once database localhost-only exposure and connectivity are verified, review SQL import compatibility and order before an isolated dry-run. Keep real Auth data separate unless and until a secure, justified test is approved. Record actual restore results separately; no recovery claim is made from health checks alone.

## 5. Reference

Supabase documentation: https://supabase.com/docs/guides/platform/backups

Backups and restores may depend on the subscription plan. Never restore a production database in place as a test.
