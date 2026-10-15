import test from 'node:test';
import assert from 'node:assert/strict';
import {
  allowedOrigin,
  validCaptcha,
  validateInquiry,
} from '../supabase/functions/_shared/inquiryValidation.mjs';

const input = {
  subject: 'Product quote', customerName: 'Example',
  customerEmail: 'TEST@EXAMPLE.COM', contactInfo: 'example handle',
  productName: 'Custom plush', size: '10', quantity: '50',
  accessoryQty: '0',
  imageLink: 'https://res.cloudinary.com/example/image/upload/sample.png',
  note: 'Details',
};

test('validates and normalizes safe inquiry fields', () => {
  assert.deepEqual(validateInquiry(input), {
    subject: 'Product quote', customer_name: 'Example',
    customer_email: 'test@example.com', contact_info: 'example handle',
    product_name: 'Custom plush', size: '10', quantity: 50,
    accessory_qty: 0,
    image_link: 'https://res.cloudinary.com/example/image/upload/sample.png',
    note: 'Details',
  });
});
test('rejects invalid email, integer coercion, and oversized content', () => {
  assert.throws(() => validateInquiry({ ...input, customerEmail: 'invalid' }));
  assert.throws(() => validateInquiry({ ...input, quantity: '5oops' }));
  assert.throws(() => validateInquiry({ ...input, accessoryQty: -1 }));
  assert.throws(() => validateInquiry({ ...input, subject: 'x'.repeat(500) }));
  assert.throws(() => validateInquiry({ ...input, note: 'z'.repeat(3000) }));
});
test('requires HTTPS images on Cloudinary and rejects lookalike hosts', () => {
  assert.throws(() => validateInquiry({ ...input, imageLink: 'http://res.cloudinary.com/example' }));
  assert.throws(() => validateInquiry({ ...input, imageLink: 'https://res.cloudinary.com.evil.invalid/example' }));
  assert.throws(() => validateInquiry({ ...input, imageLink: 'https://example.invalid/image.jpg' }));
});
test('captcha must verify action, score, hostname and freshness', () => {
  const now = Date.parse('2026-10-15T10:00:00Z');
  const valid = { success: true, action: 'inquiry_submit', score: 0.9,
    hostname: 'dioxyzinefrog.vercel.app', challenge_ts: '2026-10-15T09:59:00Z' };
  const hosts = ['dioxyzinefrog.vercel.app'];
  assert.equal(validCaptcha(valid, hosts, now), true);
  for (const change of [
    { success: false }, { action: 'login' }, { score: 0.2 },
    { hostname: 'other.invalid' }, { challenge_ts: '2026-10-15T09:50:00Z' },
  ]) assert.equal(validCaptcha({ ...valid, ...change }, hosts, now), false);
});
test('Origin exact match, no wildcard or substring', () => {
  assert.equal(allowedOrigin('https://dioxyzinefrog.vercel.app', ['https://dioxyzinefrog.vercel.app']), true);
  assert.equal(allowedOrigin('https://dioxyzinefrog.vercel.app.evil.invalid', ['https://dioxyzinefrog.vercel.app']), false);
  assert.equal(allowedOrigin(null, ['https://dioxyzinefrog.vercel.app']), false);
});
