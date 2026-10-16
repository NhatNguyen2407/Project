import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  validateInquiryPayload,
  assessRecaptcha,
  parseAllowedHostnames,
  isAllowedRequestOrigin,
  validateCaptchaToken,
  SubmissionValidationError,
} from '../supabase/functions/submit-inquiry/validation.mjs';

const valid = {
  subject: 'Custom plush order',
  customerName: 'Test Customer',
  customerEmail: 'TEST@example.com',
  contactInfo: 'Test channel',
  productName: 'Sample Plush',
  size: '10cm',
  quantity: '50',
  accessoryQty: '0',
  imageLink: 'https://example.com/reference.png',
  note: 'Simple notes',
};
const now = Date.parse('2026-10-16T03:00:00Z');
const captcha = {
  success: true, action: 'inquiry_submit', score: 0.92,
  hostname: 'dioxyzinefrog.vercel.app',
  challenge_ts: '2026-10-16T02:59:30Z',
};
const allowedHostnames = ['dioxyzinefrog.vercel.app'];

test('valid payload is normalized with a field allowlist', () => {
  const row = validateInquiryPayload({ ...valid, user_id: 'forged-id', payment_status: 'paid', status: 'completed' });
  assert.equal(row.customer_email, 'test@example.com');
  assert.equal(row.quantity, 50);
  assert.equal(row.accessory_qty, 0);
  assert.equal(row.status, undefined);
  assert.equal(row.user_id, undefined);
  assert.equal(row.payment_status, undefined);
});
test('required fields, email and numeric values are rejected when invalid', () => {
  for (const input of [
    null, [], { ...valid, customerEmail: 'bad-address' }, { ...valid, customerName: '' },
    { ...valid, quantity: '0' }, { ...valid, quantity: '1.5' }, { ...valid, quantity: -1 },
    { ...valid, quantity: 9999999 }, { ...valid, accessoryQty: -1 },
    { ...valid, note: 'a'.repeat(2001) },
    { ...valid, subject: 'a'.repeat(161) },
  ]) assert.throws(() => validateInquiryPayload(input), SubmissionValidationError);
});
test('unsafe image reference URLs fail closed', () => {
  for (const imageLink of [
    'javascript:alert(1)', 'http://example.com/image', 'file:///tmp/a',
    'https://user:password@example.com/image', 'https://localhost/image',
    'https://example.com:8080/image', 'data:text/html,x',
  ]) assert.throws(() => validateInquiryPayload({ ...valid, imageLink }), SubmissionValidationError);
});
test('CAPTCHA token must have plausible size and no whitespace', () => {
  assert.equal(validateCaptchaToken('x'.repeat(120)), true);
  for (const token of [null, '', 'short', 'a'.repeat(8200), 'a'.repeat(40) + ' ']) {
    assert.equal(validateCaptchaToken(token), false);
  }
});
test('CAPTCHA must match verified action, hostname, score and freshness', () => {
  assert.equal(assessRecaptcha(captcha, { allowedHostnames, now }), true);
  const negatives = [
    { success: false }, { action: 'login' }, { hostname: 'evil.example' },
    { score: 0.1 }, { score: null }, { score: 1.01 },
    { challenge_ts: '2026-10-16T02:55:00Z' }, { challenge_ts: 'not-a-date' },
  ];
  for (const fields of negatives) {
    assert.equal(assessRecaptcha({ ...captcha, ...fields }, { allowedHostnames, now }), false);
  }
  assert.equal(assessRecaptcha(captcha, { allowedHostnames: [], now }), false);
});
test('allowed hosts and request origin are explicit, without wildcards', () => {
  assert.deepEqual(parseAllowedHostnames(' site.example,site.example, preview.example '), ['site.example', 'preview.example']);
  assert.equal(isAllowedRequestOrigin('https://shop.example', 'https://shop.example'), true);
  for (const origin of ['https://shop.example.evil.com', 'http://shop.example', 'null', undefined]) {
    assert.equal(isAllowedRequestOrigin(origin, 'https://shop.example'), false);
  }
});
test('client and server use one trusted submission endpoint', () => {
  const api = readFileSync(new URL('../src/app/service/api.js', import.meta.url), 'utf8');
  const page = readFileSync(new URL('../src/app/pages/InquiryPage.jsx', import.meta.url), 'utf8');
  const functionSrc = readFileSync(new URL('../supabase/functions/submit-inquiry/index.ts', import.meta.url), 'utf8');
  const handlerSrc = readFileSync(new URL('../supabase/functions/submit-inquiry/handler.mjs', import.meta.url), 'utf8');
  assert.match(api, /functions\.invoke\('submit-inquiry'/);
  assert.doesNotMatch(api, /from\('inquiries'\)\.insert/);
  assert.match(page, /api\.submitInquiry\(payload, token\)/);
  assert.doesNotMatch(page, /functions\.invoke\('verify-recaptcha'/);
  assert.match(functionSrc, /createInquiryHandler/);
  assert.match(handlerSrc, /validateInquiryPayload\(body\?\.inquiry, \{/);
  assert.match(handlerSrc, /stagingPrivateImages: ticketMode/);
  assert.match(handlerSrc, /INQUIRY_UPLOAD_STAGING_ENABLED/);
  assert.match(handlerSrc, /assessRecaptcha\(captcha/);
});
