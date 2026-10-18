export function normalizePayPalItems(items, { coerceQuantities = false } = {}) {
  if (!Array.isArray(items) || items.length === 0) throw new Error('Invalid cart items');
  const quantities = new Map();
  for (const item of items) {
    const id = typeof item?.id === 'string' ? item.id.trim() : '';
    const qty = coerceQuantities ? Number(item?.qty) : item?.qty;
    if (!id || !Number.isSafeInteger(qty) || qty <= 0) throw new Error('Invalid cart item');
    const total = (quantities.get(id) || 0) + qty;
    if (!Number.isSafeInteger(total)) throw new Error('Invalid aggregate quantity');
    quantities.set(id, total);
  }
  return [...quantities].sort(([a], [b]) => a.localeCompare(b))
    .map(([id, qty]) => ({ id, qty }));
}

export async function captureRequestId(orderId) {
  if (typeof orderId !== 'string' || !/^[A-Za-z0-9]{1,64}$/.test(orderId))
    throw new Error('Invalid PayPal order identifier');
  const bytes = new TextEncoder().encode('capture:' + orderId);
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return 'cap-' + Array.from(hash.subarray(0, 16), n => n.toString(16).padStart(2, '0')).join('');
}

// Called only after the merchant-authenticated provider order and cart match.
// A completed payment needs reconciliation, never a second capture. Expiry
// prevents a new charge but must not prevent recording an existing payment.
export function shouldCapturePayPalOrder(reservations, providerStatus, now = Date.now()) {
  if (!Array.isArray(reservations) || reservations.length === 0)
    throw new Error('Stock reservation is missing; payment requires review.');
  const allActive = reservations.every(row => row?.status === 'active');
  const allConsumed = reservations.every(row => row?.status === 'consumed');
  if (!allActive && !allConsumed)
    throw new Error('Stock reservation is in an invalid state; payment requires review.');
  if (providerStatus === 'COMPLETED') return false;
  if (providerStatus !== 'APPROVED')
    throw new Error('PayPal order is not approved for capture');
  if (allConsumed)
    throw new Error('Consumed reservation cannot authorize another capture.');
  if (!Number.isFinite(now) || reservations.some(row => {
    const expiresAt = new Date(row.expires_at).getTime();
    return !Number.isFinite(expiresAt) || expiresAt <= now;
  })) throw new Error('Reservation expired; review payment status before another checkout.');
  return true;
}

export function payPalServerEnvironment(url, mode, stagingEnabled) {
  if (url === 'https://xeljnocizvlmefqovvfw.supabase.co' && mode === 'live')
    return { staging: false, base: 'https://api-m.paypal.com', reserveRpc: 'reserve_product_stock', paidRpc: 'process_paid_order' };
  if (url === 'https://bvnnmvlfcduwmneipmsi.supabase.co' && mode === 'sandbox' && stagingEnabled === 'true')
    return { staging: true, base: 'https://api-m.sandbox.paypal.com', reserveRpc: 'staging_reserve_product_stock', paidRpc: 'staging_process_paid_order' };
  throw new Error('Payment environment is disabled');
}
export function storedPayPalId(id, staging) {
  if (typeof id !== 'string' || !/^[A-Za-z0-9]{1,64}$/.test(id)) throw new Error('Invalid PayPal identifier');
  return staging ? 'STG-SANDBOX-' + id : id;
}
export function assertStagingPaymentCaller(request, config, publicKey, allowedOrigin) {
  if (!config.staging) return;
  if (request.method !== 'POST' || !publicKey ||
      request.headers.get('apikey') !== publicKey ||
      !allowedOrigin || request.headers.get('origin') !== allowedOrigin ||
      !/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || ''))
    throw new Error('Staging payment caller not permitted');
}
