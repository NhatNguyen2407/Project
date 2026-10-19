import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createCaptureAttemptGate } from '../src/app/utils/captureAttemptGate.js';

test('duplicate approval is blocked synchronously until backend responds', () => {
  const gate = createCaptureAttemptGate();
  assert.equal(gate.begin('PAYPAL-FAKE-1'), true);
  assert.equal(gate.isLocked(), true);
  assert.equal(gate.begin('PAYPAL-FAKE-1'), false);
  assert.equal(gate.begin('PAYPAL-FAKE-2'), false);
  assert.equal(gate.status(), 'processing');
});

test('uncertain result must stay locked for support review', () => {
  const gate = createCaptureAttemptGate();
  gate.begin('PAYPAL-FAKE-1');
  assert.equal(gate.requireReview(), true);
  assert.equal(gate.confirmUncaptured('PAYPAL-FAKE-1'), false);
  assert.equal(gate.begin('PAYPAL-FAKE-1'), false);
  assert.equal(gate.status(), 'review');
});

test('only explicit non-capture response for same order permits retry', () => {
  const gate = createCaptureAttemptGate();
  gate.begin('PAYPAL-FAKE-1');
  assert.equal(gate.confirmUncaptured('PAYPAL-OTHER'), false);
  assert.equal(gate.isLocked(), true);
  assert.equal(gate.confirmUncaptured('PAYPAL-FAKE-1'), true);
  assert.equal(gate.isLocked(), false);
  assert.equal(gate.begin('PAYPAL-FAKE-2'), true);
});

test('confirmed capture cannot be processed again in the same mounted session', () => {
  const gate = createCaptureAttemptGate();
  assert.equal(gate.begin('PAYPAL-FAKE-1'), true);
  assert.equal(gate.complete('PAYPAL-OTHER'), false);
  assert.equal(gate.complete('PAYPAL-FAKE-1'), true);
  assert.equal(gate.requireReview(), false);
  assert.equal(gate.confirmUncaptured('PAYPAL-FAKE-1'), false);
  assert.equal(gate.begin('PAYPAL-FAKE-1'), false);
  assert.equal(gate.status(), 'completed');
});

test('empty PayPal approval ID never starts a capture', () => {
  const gate = createCaptureAttemptGate();
  for (const bad of [undefined, null, '', '  ', 12]) assert.equal(gate.begin(bad), false);
  assert.equal(gate.isLocked(), false);
});

test('Checkout must guard approval, error, retries and creation using the gate', () => {
  const source = readFileSync(new URL('../src/app/pages/CheckoutPage.jsx', import.meta.url), 'utf8');
  assert.match(source, /useRef\(null\)/);
  assert.match(source, /onApprove=\{async \(data\) => \{[\s\S]*?captureAttemptRef\.current\.begin\(approvedOrderId\)/);
  assert.match(source, /captureAttemptRef\.current\.confirmUncaptured\(approvedOrderId\)/);
  assert.match(source, /captureAttemptRef\.current\.requireReview\(\)/);
  assert.match(source, /captureAttemptRef\.current\.complete\(approvedOrderId\)/);
  assert.match(source, /onError=\{\(err\) => \{[\s\S]*?status === 'processing'/);
  assert.match(source, /createOrder=\{async \(\) => \{\s*if \(captureAttemptRef\.current\.isLocked\(\)\)/);
});
