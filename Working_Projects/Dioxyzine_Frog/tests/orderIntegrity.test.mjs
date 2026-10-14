import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeOrderId,
  requireOrderId,
  assertConfirmedMutation,
} from '../src/app/utils/orderIntegrity.js';

const orderId = '123e4567-e89b-42d3-a456-426614174000';

test('full UUIDs are accepted and trimmed for tracking', () => {
  assert.equal(normalizeOrderId(orderId), orderId);
  assert.equal(normalizeOrderId(`  ${orderId.toUpperCase()}  `), orderId.toUpperCase());
});

test('short IDs, payment capture IDs, empty and non-string inputs are rejected', () => {
  for (const invalid of [
    orderId.substring(0, 8),
    '9AB123CDE456789',
    '',
    '   ',
    null,
    undefined,
    123,
    `${orderId} extra`,
  ]) {
    assert.equal(normalizeOrderId(invalid), null);
  }
});

test('requireOrderId preserves valid canonical IDs but refuses malformed references', () => {
  assert.equal(requireOrderId(` ${orderId} `), orderId);
  assert.throws(() => requireOrderId('123e4567'), /complete order UUID/);
});

test('admin mutation must confirm exactly one matching row', () => {
  assert.deepEqual(assertConfirmedMutation({ data: [{ id: 'ITEM-7' }], error: null }, 'ITEM-7'), { id: 'ITEM-7' });
  assert.equal(assertConfirmedMutation({ data: [{ id: 42 }], error: null }, '42').id, 42);
});

test('admin mutation propagates database/RLS/network errors', () => {
  const error = new Error('RLS denied');
  assert.throws(
    () => assertConfirmedMutation({ data: null, error }, 'ITEM-7'),
    (caught) => caught === error,
  );
});

test('admin mutation refuses zero rows, mismatched rows, multiple rows and absent data', () => {
  const failed = [
    { data: [], error: null },
    { data: [{ id: 'OTHER' }], error: null },
    { data: [{ id: 'ITEM-7' }, { id: 'ITEM-8' }], error: null },
    { data: null, error: null },
    undefined,
  ];
  for (const result of failed) {
    assert.throws(
      () => assertConfirmedMutation(result, 'ITEM-7'),
      /Database did not confirm/,
    );
  }
});

test('admin mutation requires a target ID', () => {
  assert.throws(
    () => assertConfirmedMutation({ data: [{ id: undefined }], error: null }, undefined),
    /Database did not confirm/,
  );
});
