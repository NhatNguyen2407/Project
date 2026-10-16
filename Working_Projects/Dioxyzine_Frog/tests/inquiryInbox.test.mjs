import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterInquiries,
  safeInquiryReferenceUrl,
  formatInquiryTimestamp,
} from '../src/app/utils/inquiryInbox.js';

const records = [
  { id: 'a', customer_name: 'Nguyễn A', product_name: 'Canvas Bag', created_at: '2026-01-02T01:00:00Z' },
  { id: 'b', customer_name: 'B', customer_email: 'b@example.com', product_name: 'Plush', created_at: '2026-03-02T01:00:00Z' },
  { id: 'c', subject: 'Custom plush', contact_info: 'Messaging', created_at: '2026-02-02T01:00:00Z' },
];

test('inbox shows all requests newest first without mutating source state', () => {
  const before = [...records];
  assert.deepEqual(filterInquiries(records).map((r) => r.id), ['b', 'c', 'a']);
  assert.deepEqual(records, before);
});

test('inbox supports case-insensitive customer, subject, email and product search', () => {
  assert.deepEqual(filterInquiries(records, '  PLUSH ').map((r) => r.id), ['b', 'c']);
  assert.deepEqual(filterInquiries(records, 'B@EXAMPLE.COM').map((r) => r.id), ['b']);
  assert.deepEqual(filterInquiries(records, 'canvas').map((r) => r.id), ['a']);
  assert.deepEqual(filterInquiries(records, 'unmatched'), []);
});

test('invalid and missing fields are tolerated', () => {
  assert.deepEqual(filterInquiries(null, 'q'), []);
  assert.deepEqual(filterInquiries([null, undefined, { id: 10 }, 'bad'], '').map(r => r.id), [10]);
  assert.deepEqual(filterInquiries(records, null).map(r => r.id), ['b', 'c', 'a']);
});

test('reference links reject executable and unsafe URL schemes', () => {
  for (const invalid of [
    '', ' ', null, undefined, 'javascript:alert(1)', 'data:text/html,hello',
    'file:///etc/passwd', 'http://example.com/picture.png',
    'https://user:pass@example.com/image', 'https://localhost/', 'https://demo.local/',
    'not-a-url', 'https://example.com/' + 'a'.repeat(2100),
  ]) {
    assert.equal(safeInquiryReferenceUrl(invalid), null);
  }
  assert.equal(safeInquiryReferenceUrl('https://example.com/design.png'), 'https://example.com/design.png');
});

test('date renderer handles malformed values without throwing', () => {
  assert.equal(formatInquiryTimestamp(''), 'Date unavailable');
  assert.equal(formatInquiryTimestamp('bad date'), 'Date unavailable');
  assert.equal(typeof formatInquiryTimestamp('2026-02-01T12:30:00Z'), 'string');
});
