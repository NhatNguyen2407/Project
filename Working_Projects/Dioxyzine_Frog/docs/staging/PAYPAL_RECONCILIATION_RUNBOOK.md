# PayPal reconciliation — controlled operator procedure

This is a manual procedure, not a background reconciler or authorization to
change Production. Test only in the isolated synthetic Staging project unless
the release/cutover has separately been approved. Never request a new payment
to resolve an uncertain existing one.

## Decide from provider evidence

1. Retain the original provider order ID, canonical cart/voucher and shipping
   payload privately. Never place credentials or payment identifiers in issues.
2. Read the order using the configured merchant's server credentials and the
   correct Sandbox/live API. Verify the cart fingerprint, currency, amount and
   capture identity/status. A browser callback or local reservation is not proof
   that money was collected.
3. If the order and its capture are COMPLETED, retry the existing order through
   the capture endpoint. It skips the capture POST and attempts the transactional
   order write. An expired but retained active reservation does not prevent this
   recovery. Existing transaction IDs return the stored order without repeating
   stock or voucher effects.
4. If a new capture is still needed, only APPROVED plus entirely active,
   unexpired reservations is accepted. Missing, mixed, consumed-for-new-charge,
   invalid-date and expired reservations cannot authorize another capture.
5. If recording fails, preserve the captured/uncertain review state. Investigate
   stock, voucher and persistence errors; correct the underlying issue, then
   retry the same provider order. Do not invent stock or edit a real transaction
   to force success. Fulfillment/refund decisions require the merchant.
6. Missing/deleted reservations stay blocked. The current code has no automated
   recovery for this case; retain provider evidence and escalate for controlled
   manual resolution. Legacy lazy cleanup can remove expired active holds, so
   reservation retention and durable reconciliation remain release concerns.

## Verified synthetic failure drill — 2026-10-18

The provider confirmed one existing completed USD 27 Sandbox capture. The
original synthetic order stayed saved under a temporary transaction marker.
Its normal transaction lookup was empty, and stock was temporarily zero to
force a real paid-order RPC failure. No trigger or external notification was
attached to the Staging orders table.

- The endpoint reported paymentCaptured=true and did not partially write an
  order or alter the exhausted stock.
- Restoring the synthetic stock and retrying the same completed provider order
  reconstructed one paid order and decremented stock once.
- Repeating success concurrently returned that same reconstructed order.
- A second provider GET still showed the same single completed capture.
- The disposable reconstructed row was removed, and the saved original order,
  stock and reservation fields were restored exactly. Server switches closed.

The retained-but-expired active-reservation variant first reproduced HTTP 400
on the old handler. The corrected handler passed the same drill. Both runs used
the existing completed payment; no additional Sandbox charge was requested.

This tests server recovery and replay. It does not test actual HTTP packet loss,
SDK popup callbacks, deleted-reservation recovery, concurrent price/voucher
changes or unattended reconciliation. Do not reproduce the fixture manipulation
against real orders.

References: [Orders integration](https://developer.paypal.com/api/rest/integration/orders-api),
[REST idempotency headers](https://developer.paypal.com/api/rest/requests/),
[Orders status schema](https://developer.paypal.com/sdk/orders/v2/definitions/order/).
