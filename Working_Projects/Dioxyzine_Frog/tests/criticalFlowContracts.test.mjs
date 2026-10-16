import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Lightweight source-contract regression guards. These checks complement,
// but cannot replace, integration tests against an isolated Supabase instance.
const readSource = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('checkout confirmation email uses application order ID, not PayPal capture ID', () => {
  const source = readSource('../src/app/pages/CheckoutPage.jsx');
  assert.match(source, /order_id:\s*orderId\b/);
  assert.doesNotMatch(source, /order_id:\s*transactionId\b/);
});

test('shipping email uses full validated application UUID', () => {
  const source = readSource('../src/app/pages/AdminPage.jsx');
  assert.match(source, /const\s+validatedOrderId\s*=\s*requireOrderId\(order\.id\)/);
  assert.match(source, /order_id:\s*validatedOrderId\b/);
  assert.doesNotMatch(source, /order_id:\s*order\.id\.substring\s*\(/);
});

test('delete product and voucher writes require successful database confirmation', () => {
  const source = readSource('../src/app/pages/AdminPage.jsx');
  const segment = (start) => {
    const from = source.indexOf(start);
    const to = source.indexOf('\n  };', from + start.length);
    assert.ok(from >= 0 && to > from, `Expected Admin handler boundary: ${start}`);
    return source.slice(from, to);
  };
  for (const body of [
    segment('const handleDeleteProduct'),
    segment('const handleToggleVoucher'),
    segment('const handleDeleteVoucher'),
  ]) {
    assert.match(body, /assertConfirmedMutation\(\{\s*data,\s*error\s*\},\s*id\)/);
    assert.match(body, /\.select\(['"]id['"]\)/);
  }
});
