# Dioxyzine Frog - Recovery Readiness and Migration Reconciliation

**Assessment date:** 2026-10-18
**Scope:** Phase 1 / Step 2. **Status: OPEN** pending independent key custody and provider/configuration recovery. Phase 1 browser acceptance is tracked separately.

This public document contains sanitized verification results only. Private backups, workbook identifiers, customer records, credentials, encryption keys and cloud archive links are excluded.

## Current evidence

| Area | Verified result | Practical limit |
| --- | --- | --- |
| Database recovery | Fresh read-only exports restored; all 41 data-table counts matched | Separate exports are not an atomic cross-service snapshot |
| Schema and access controls | 43 tables, 439 columns, 35 functions, 22 policies, 961 table/sequence ACL entries, 82 function ACL entries, 10 triggers, 150 indexes and 153 constraints matched captured source metadata | This compares the restored baseline with its captured source |
| SQL behavior | Guest denial, owner access, Admin role, paid-only Tracking and transaction rollback passed | Local isolated restore, not a hosted Production cutover |
| Auth/Storage services | Ten API checks passed: restored inventory, synthetic password login with new local credentials, denied administration, private access controls and actual signed URL expiry | Original user passwords, external OAuth and SMTP were not exercised |
| Storage binaries | Every backed-up binary uploaded through the recovered API, downloaded and checked by SHA-256 | Database exports alone do not contain Storage bytes |
| Off-device archive | Owner-only encrypted archive uploaded, downloaded, hash-checked, decrypted and restored successfully | Independent custody of the private key is still awaiting confirmation |
| Deployed backend source | Four currently deployed Edge Function sources downloaded | Secret inventory has names/digests, not recoverable values |
| Management workbook restore | Private backup restored into a separate owner-only native workbook; all ten tabs, locale/timezone and twelve conditional-format rules matched | The source is the dated private backup, not a fresh operational snapshot |
| Workbook cells/formulas | All 2,623 exported formula texts/coordinates and 113,882 resolved cell value/style comparisons passed; 1,438 native sampled cells also matched, including 73 formulas and 11 validation cells | Export comparison excludes cached formula results; external imports/scripts were not executed |
| Preview rollback | Alias moved to previous verified READY candidate and restored to current candidate; each mapping read back | Preview routing only; not Production rollback or browser regression |
| Staging isolation/closure | Separate Staging backend retained; temporary upload/Admin/payment switches disabled and temporary Admin revoked | Prior exact-source hosted/browser evidence remains in the acceptance ledger |

The isolated recovery used an internal Docker network, no published host ports, local credentials and tmpfs data. Created containers and the network were removed and cleanup verified. It did not send email or payment requests. No customer/Auth dump was imported into hosted Staging.

The backed-up Storage schema requires a compatible service version. A cached older image failed its upsert conflict target; using the compatible official image fixed the drill without modifying the backed-up schema.

Workbook verification used native cell/format/rule readback and resolved export comparison. Browser visual verification was unavailable because its tool could not initialize. No source workbook cells or sharing permissions were changed.

## Migration reconciliation

| Historical repository file | Captured live version |
| --- | --- |
| `202610130001_security_hardening.sql` | `20261012140001` |
| `202610130002_order_tracking_rpc_shape.sql` | `20261012140254` |

The captured live application history contains six entries; these two files are not a complete bootstrap schema. Matching names/descriptions alone do not establish equivalence.

The two historical files were exercised on a disposable full restoration inside a rolled-back transaction. The intermediate Tracking function was dropped only to simulate its historical pre-JSONB signature, and captured function ownership was re-established after recreation. This controlled setup is essential: blindly replaying the first file on the current JSONB function would attempt an incompatible return-type change.

All compared schema, policy, privilege, index, constraint and trigger metadata then matched the captured baseline. The raw definition hashes of `is_admin` and `track_order_status` differ because their SQL bodies are formatted differently; SQL tokens, signatures, security attributes, owners and grants match. The complete baseline history and managed Auth/Storage histories are retained privately.

**Canonical approach:**

1. Treat the verified full schema snapshot and captured live migration history as the recovery baseline.
2. Restore that baseline into an empty isolated target; do not use the two historical files as bootstrap migrations or replay them afterward.
3. Do not edit Production history merely to align filenames, rename applied versions, or run blanket `db push` / `db reset`.
4. Keep Staging-only migrations restricted to their guarded Staging project. Any later Production migration requires an explicit incremental cutover plan and new backup.
5. Recheck source/target identity and the live history immediately before an authorized release. This reconciliation did not modify Production migration history.

This closes the evidence gap for the historical pair's effective baseline behavior. It does not claim the repository can rebuild the entire platform from migration files alone.

## Remaining recovery work

- [x] Verify private native workbook backups.
- [x] Restore the management workbook into a distinct private native workbook.
- [x] Verify database/Auth/Storage restore, access controls and separate object bytes.
- [x] Verify encrypted off-device upload, download, decryption and restore.
- [x] Reconcile the historical migration pair and document the authoritative baseline.
- [x] Verify isolated Staging and rehearse Preview alias routing rollback.
- [ ] Confirm the owner has retained the decryption key independently of this device.
- [ ] Verify recovery or recreation of provider settings and secret values: OAuth, SMTP/email, PayPal, CAPTCHA, Sheets/Apps Script and Vercel configuration.
- [ ] Complete the separately tracked critical Checkout browser acceptance and final release review.

The owner selected a password manager for the key but has not yet confirmed that it was saved. Local backup copies remain retained. A same-device key file is not an independent recovery copy.

Provider-managed daily backup/PITR coverage has not been revalidated. The manual encrypted archive and tested local restoration do not establish that coverage or a hosted replacement-platform cutover.

## Repeat and cleanup safeguards

Use a fresh empty disposable target, an internal network and no host-published database ports. The earlier exposed local listener was stopped; an independent LAN-device test is unnecessary for the verified no-published-ports drill, and must not be assumed for any future exposed listener.

Use new local JWT/database credentials. Disable external OAuth/mail/payment effects in the restored test services. Record exact image identities and service compatibility; do not change restored schema merely to fit an older image.

Recreate service/provider secrets through their controlling accounts. Never publish an Auth dump, raw service logs, private workbook exports, secret values or decryption identities.

After independent key custody is confirmed, remove only exact verified temporary backup/restore paths. Preserve the key, active source worktrees and service data. No in-place Production restore, migration, payment or release is authorized by this drill.

The dated notes formerly in this file described historical preparation. This current assessment supersedes those old untested/partial statuses. Earlier disk-encryption claims were not independently revalidated; no current encryption-at-rest assertion is made for the local volumes.

## References

- [Supabase platform-to-self-hosted recovery](https://supabase.com/docs/guides/self-hosting/restore-from-platform)
- [Supabase backup and restore](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
