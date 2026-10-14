// Shared validation for order lookup, email references, and admin mutations.
// No network access or framework dependencies: can be unit-tested in Node.
const ORDER_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function normalizeOrderId(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return ORDER_UUID.test(trimmed) ? trimmed : null;
}

export function requireOrderId(value) {
  const id = normalizeOrderId(value);
  if (!id) throw new Error('A complete order UUID is required.');
  return id;
}

export function assertConfirmedMutation(result, expectedId) {
  if (result?.error) throw result.error;

  // PostgREST can resolve without throwing even when no row was changed.
  // Every admin action in this module targets exactly one row by primary key.
  const rows = result?.data;
  if (
    expectedId === null ||
    expectedId === undefined ||
    !Array.isArray(rows) ||
    rows.length !== 1 ||
    String(rows[0]?.id) !== String(expectedId)
  ) {
    throw new Error('Database did not confirm the change. Refresh and check your permissions.');
  }

  return rows[0];
}
