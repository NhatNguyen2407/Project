# Hosted Sandbox acceptance — 2026-10-18

Environment: isolated Supabase Staging and protected candidate Preview.
Production is unchanged. Both feature PRs remain Draft.

## Server and provider: PASS

The existing merchant Sandbox app authenticated against PayPal Sandbox.
Its secret was saved only in Supabase Staging; the public client ID/mode/opt-in
were scoped to the candidate Preview branch. Server routing accepts only the
known Production/live pair or the exact Staging/Sandbox pair with explicit opt-in.

A server-created synthetic SKU checkout calculated USD 12 plus USD 15 shipping.
The approved fake buyer used Sandbox balance. Capture returned success and a
canonical stored order. The database contains one paid USD 27 synthetic order,
one consumed reservation and stock 4 after starting at 5.

A sequential repeat and four concurrent capture retries returned the original
order. The before/after order, stock and reservation snapshots were equal.
A changed cart, different Origin, missing explicit Staging caller key and unknown
reservation were rejected. Negative cases did not mutate the snapshot.

The paid-order RPC serializes by provider transaction using an advisory lock,
checks existing paid amount/status, and returns the existing order before stock
or voucher updates. The Staging foundation has a unique transaction index and
service-only RPC execution. Client RPC execution remains denied.

## Browser: PARTIAL

Verified product→cart→Checkout delivery form, USD 27 summary and Sandbox SDK
buttons on candidate 0e1593e35a7c3ccf6f4d0a8443d9a0d1534b5199.
The owner approved test Terms and the synthetic checkout. IAB opened PayPal's
overlay but did not expose the SDK popup, including its Click to Continue path.
Do not claim browser onApprove→confirmation success from API capture evidence.

Browser acceptance also found a duplicate cart drawer mounted by both App and
ProductDetailPage. The page-local duplicate and unused state were removed.
A misleading Preview email-success log was removed; the guarded live call stays unchanged.

## Cleanup and limits

All three temporary server switches are OFF; upload/Admin/Sandbox client opt-ins
on the candidate branch are false. The temporary Admin role was removed.
Buyer Payment Review was restored ON and the temporary local buyer password
file removed. No real funds, live credentials, email or Sheets writes were used.

Pending: popup-capable full browser checkout, failure-injected reconciliation,
delayed/uncertain capture, approved test-recipient emails and remaining release gates.
Origin plus a public caller key is not authentication or an abuse-control system.
No private payment/order identifiers or credentials are published in this report.

## Follow-up: persistence failure and expired hold — PASS

The existing completed USD 27 Sandbox payment was used for two controlled
failure/recovery drills; no new capture was created. With the stored transaction
mapping temporarily held and stock zero, the endpoint reported an already
captured payment that could not be recorded. After restoring test stock, retry
reconstructed one paid order. Concurrent repeats returned that same record;
provider GET still showed the original single capture. The original fixture
(order, stock and reservation) was restored exactly and server flags closed.

The retained-but-expired active reservation variant failed with HTTP 400 before
the fix, then passed after the handler checked authoritative provider status
before applying expiry to new captures. Four added policy tests also cover fresh
APPROVED, consumed/mixed/missing holds, invalid dates and unapproved states.
Frontend: 68 Node tests PASS; changed capture entrypoint type-check PASS.

See PAYPAL_RECONCILIATION_RUNBOOK.md for operator boundaries. Deleted reservation
recovery, durable operations, SDK popup callbacks and real network-loss injection
remain unverified. These server drills do not certify full browser Checkout.
