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
test('order tracking validates full UUID before invoking public RPC', () => {
  const source = readSource('../src/app/pages/OrderTrackingPage.jsx');
  const start = source.indexOf('const handleSearch = async');
  const end = source.indexOf('const getCurrentStepIndex', start);
  assert.ok(start >= 0 && end > start);
  const handler = source.slice(start, end);

  assert.match(handler, /if\s*\(!normalizeOrderId\(idToSearch\)\)\s*\{[\s\S]*?\breturn;\s*\}/);
  const validation = handler.indexOf('normalizeOrderId(idToSearch)');
  const rpc = handler.indexOf("supabase.rpc(");
  assert.ok(validation >= 0 && rpc > validation);
  assert.match(handler, /['"]track_order_status['"]/);
  assert.match(handler, /search_id:\s*idToSearch\b/);
  assert.doesNotMatch(handler, /\.from\(\s*['"]orders['"]\s*\)/);
});

test('committed public tracking RPC limits exposed fields to paid orders', () => {
  // SQL source contract only; actual remote RPC permissions need staging tests.
  const sql = readSource('../supabase/migrations/202610130002_order_tracking_rpc_shape.sql');
  assert.match(sql, /returns\s+jsonb/i);
  const output = sql.match(/jsonb_build_object\(([\s\S]*?)\)\s*from\s+public\.orders\s+o/i);
  assert.ok(output, 'Expected public JSON response object');
  const keys = [...output[1].matchAll(/^\s*'([^']+)'\s*,/gm)].map((match) => match[1]);
  assert.deepEqual(keys, ['id', 'product_name', 'order_status', 'tracking_code', 'created_at']);
  assert.match(sql, /where\s+o\.id\s*=\s*search_id\s+and\s+lower\(coalesce\(o\.payment_status,\s*''\)\)\s*=\s*'paid'/i);
  assert.match(sql, /\blimit\s+1\s*;/i);
});
