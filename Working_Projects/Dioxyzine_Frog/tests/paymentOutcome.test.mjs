import test from 'node:test';
import assert from 'node:assert/strict';
import { needsPaymentReview } from '../src/app/utils/paymentOutcome.js';

test('captured payment with failed order recording requires support review', () => {
  assert.equal(needsPaymentReview({ success: false, paymentCaptured: true }), true);
});

test('unknown capture response or network error must not permit a second payment', () => {
  assert.equal(needsPaymentReview(null, new Error('Network timeout')), true);
  assert.equal(needsPaymentReview(undefined, new Error('Gateway interrupted')), true);
});

test('explicitly failed uncaptured transaction can be retried', () => {
  assert.equal(needsPaymentReview({ success: false, paymentCaptured: false }), false);
  assert.equal(needsPaymentReview({ success: false }), false);
});
