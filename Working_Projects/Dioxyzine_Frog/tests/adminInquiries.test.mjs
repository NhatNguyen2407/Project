import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { filterAdminInquiries, getInquiryReferenceUrl } from '../src/app/utils/adminInquiries.js';

const inquiries = [
  { id: 'fixture-new', subject: 'Doll request', customer_name: 'Alex', customer_email: 'alex@example.invalid', product_name: 'Custom Doll', quantity: 1, accessory_qty: 0 },
  { id: 'fixture-old', subject: 'Plushie quote', customer_name: 'Sam', customer_email: 'sam@example.invalid', product_name: 'Printed Plushie', note: null },
];

test('inquiry search matches subject, customer, email, product and full ID without changing source data', () => {
  for (const query of [' DOLL ', 'alex', 'ALEX@EXAMPLE.INVALID', 'custom doll', 'fixture-new']) {
    assert.deepEqual(filterAdminInquiries(inquiries, query), [inquiries[0]]);
  }
  assert.deepEqual(filterAdminInquiries(inquiries, ''), inquiries);
  assert.deepEqual(filterAdminInquiries(inquiries, '   '), inquiries);
  assert.deepEqual(filterAdminInquiries(inquiries, 'not found'), []);
  assert.deepEqual(filterAdminInquiries([], 'doll'), []);
  assert.equal(inquiries[0].quantity, 1);
  assert.equal(inquiries[0].accessory_qty, 0);
});

test('legacy missing inquiry fields remain searchable and original ordering is retained', () => {
  assert.deepEqual(filterAdminInquiries([inquiries[0], {}, inquiries[1]], 'example.invalid'), inquiries);
  assert.deepEqual(filterAdminInquiries([{ id: 'legacy', customer_name: null }], 'missing'), []);
});

test('design links accept HTTPS references and reject executable, insecure or malformed URLs', () => {
  assert.equal(getInquiryReferenceUrl('https://example.invalid/design.png'), 'https://example.invalid/design.png');
  for (const url of [null, undefined, '', '/image.png', 'invalid', 'javascript:alert(1)', 'data:image/svg+xml,<svg/>', 'http://example.invalid/image.png', 'https://name:pass@example.invalid/image.png']) {
    assert.equal(getInquiryReferenceUrl(url), null);
  }
});

test('inquiry views render real counts, escaped customer text, bounded lists and the empty state', async () => {
  // Compile JSX with Vite's installed toolchain, without adding a browser test dependency.
  const require = createRequire(import.meta.url);
  const { build } = createRequire(require.resolve('vite'))('esbuild');
  const temporary = await mkdtemp(fileURLToPath(new URL('../node_modules/.inquiry-render-', import.meta.url)));
  try {
    const output = `${temporary}/component.mjs`;
    await build({ entryPoints: [fileURLToPath(new URL('../src/app/components/admin/AdminInquiries.jsx', import.meta.url))], outfile: output, bundle: true, platform: 'node', format: 'esm', packages: 'external' });
    const { AdminInquiries, InquiryDetails } = await import(pathToFileURL(output).href);
    const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));
    const details = render(InquiryDetails, { inquiry: { ...inquiries[0], image_link: 'https://example.invalid/design.png', note: '<script>fixture</script>' }, date: 'Fixture date' });
    assert.match(details, /Quantity<\/dt><dd[^>]*>1<\/dd>/);
    assert.match(details, /Accessories per unit<\/dt><dd[^>]*>0<\/dd>/);
    assert.match(details, /&lt;script&gt;fixture&lt;\/script&gt;/);
    assert.doesNotMatch(details, /<script\b/);
    assert.match(details, /rel="noopener noreferrer"/);
    assert.doesNotMatch(render(InquiryDetails, { inquiry: { image_link: 'javascript:alert(1)' } }), /href=/);
    assert.match(render(AdminInquiries, { inquiries: [], onRefresh() {} }), /No inquiries yet\./);
    const rows = Array.from({ length: 26 }, (_, i) => ({ ...inquiries[0], id: `fixture-${i}`, subject: `Fixture subject ${i}` }));
    const list = render(AdminInquiries, { inquiries: rows, onRefresh() {} });
    assert.match(list, /Showing 25 of 26 inquiries/);
    assert.match(list, /Show more inquiries/);
    assert.doesNotMatch(list, /Fixture subject 25/);
    assert.match(list, /for="inquiry-search"/);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
