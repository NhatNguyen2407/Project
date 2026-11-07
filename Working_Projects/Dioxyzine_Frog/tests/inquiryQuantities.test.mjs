import test from 'node:test';
import assert from 'node:assert/strict';
import { getInquiryQuantities, INQUIRY_COUNT_MAX } from '../src/app/utils/inquiryQuantities.js';

test('valid inquiry counts are normalized exactly, without parseInt truncation or fallback values', () => {
  for (const quantity of [1, '1', 50, '50', INQUIRY_COUNT_MAX]) {
    assert.deepEqual(getInquiryQuantities({ quantity, accessoryQty: '2' }), { quantity: Number(quantity), accessoryQty: 2 });
  }
  assert.deepEqual(getInquiryQuantities({ quantity: '1e2', accessoryQty: '2e1' }), { quantity: 100, accessoryQty: 20 });
});

test('zero, negative, fractional, malformed and out-of-range quantities are rejected instead of becoming one', () => {
  for (const quantity of [0, '0', '-0', -1, '-1', 1.5, '1.5', '', ' ', undefined, null, true, [], {}, '1abc', 'NaN', NaN, Infinity, INQUIRY_COUNT_MAX + 1]) {
    assert.throws(() => getInquiryQuantities({ quantity }), /Quantity must be a whole number/);
  }
});

test('optional accessory count defaults only missing or blank input to zero', () => {
  for (const accessoryQty of [undefined, null, '', 0, '0']) {
    assert.deepEqual(getInquiryQuantities({ quantity: '1', accessoryQty }), { quantity: 1, accessoryQty: 0 });
  }
});

test('invalid accessories are rejected without rounding, clamping or silently becoming zero', () => {
  for (const accessoryQty of [-1, '-1', 1.5, '1.5', '2abc', true, [], {}, NaN, Infinity, INQUIRY_COUNT_MAX + 1]) {
    assert.throws(() => getInquiryQuantities({ quantity: '1', accessoryQty }), /Accessories per unit must be a whole number/);
  }
});
