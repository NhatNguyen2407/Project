import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertConfirmedMutation } from '../src/app/utils/orderIntegrity.js';

test('order status uses confirmed single-row update before UI changes and email', () => {
  const source = readFileSync(new URL('../src/app/pages/AdminPage.jsx', import.meta.url), 'utf8');
  const from = source.indexOf('const handleUpdateStatus = async');
  const to = source.indexOf('  // const handleUpdateShippingDate', from);
  assert.ok(from >= 0 && to > from);
  const handler = source.slice(from, to);

  const write = handler.indexOf(".update(updateData)");
  const filter = handler.indexOf(".eq('id', validatedOrderId)", write);
  const rowReturn = handler.indexOf(".select('id')", filter);
  const confirm = handler.indexOf('assertConfirmedMutation({ data, error }, validatedOrderId)', rowReturn);
  const updateUI = handler.indexOf('setPaypalOrders(', confirm);
  const email = handler.indexOf('await emailjs.send(', updateUI);

  assert.ok(write >= 0 && filter > write && rowReturn > filter && confirm > rowReturn);
  assert.ok(updateUI > confirm && email > updateUI, 'email should follow confirmed DB update and local refresh');
});

test('RLS-denied status write with no rows rejects before reporting success', () => {
  const id = '123e4567-e89b-42d3-a456-426614174000';
  assert.throws(
    () => assertConfirmedMutation({ data: [], error: null }, id),
    /Database did not confirm/,
  );
  const rls = new Error('permission denied');
  assert.throws(
    () => assertConfirmedMutation({ data: null, error: rls }, id),
    (error) => error === rls,
  );
});
