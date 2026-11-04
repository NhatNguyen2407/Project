import test from 'node:test';
import assert from 'node:assert/strict';
import { filterCustomProducts, getProductUrl } from '../src/app/utils/catalog.js';

const products = [
  { id: 'custom-borderless', type: 'custom', title: 'Printed Frog', category: ['Plushie'], cut_style: 'borderless' },
  { id: 'custom-bordered', type: 'custom', title: 'Printed Cat', category: ['Plushie'], cut_style: 'bordered' },
  { id: 'custom-unknown', type: 'custom', title: 'Custom Frog', category: ['Plushie'], cut_style: null },
  { id: 'custom-doll', type: 'custom', title: 'Frog Doll', category: ['Doll'], cut_style: null },
  { id: 'ready', type: 'readyuse', title: 'Ready Frog', category: ['Plushie'], cut_style: 'borderless' },
];
const ids = result => result.map(product => product.id);

test('custom catalog excludes ready-made products even when their category matches', () => {
  assert.deepEqual(ids(filterCustomProducts(products)), ['custom-borderless', 'custom-bordered', 'custom-unknown', 'custom-doll']);
  assert.deepEqual(ids(filterCustomProducts(products, { category: 'Plushie' })), ['custom-borderless', 'custom-bordered', 'custom-unknown']);
});

test('cut style filters distinguish explicit classifications without guessing missing data', () => {
  assert.deepEqual(ids(filterCustomProducts(products, { category: 'Plushie', cutStyle: 'borderless' })), ['custom-borderless']);
  assert.deepEqual(ids(filterCustomProducts(products, { category: 'Plushie', cutStyle: 'bordered' })), ['custom-bordered']);
  assert.deepEqual(ids(filterCustomProducts(products, { category: 'Plushie', cutStyle: 'All' })), ['custom-borderless', 'custom-bordered', 'custom-unknown']);
});

test('category, case-insensitive search and cut style work together', () => {
  assert.deepEqual(ids(filterCustomProducts(products, { category: 'Plushie', search: 'FROG', cutStyle: 'borderless' })), ['custom-borderless']);
  assert.deepEqual(ids(filterCustomProducts(products, { category: 'Doll', cutStyle: 'borderless' })), ['custom-doll']);
  assert.deepEqual(filterCustomProducts(products, { search: 'no match' }), []);
  assert.deepEqual(filterCustomProducts([]), []);
});

test('ready-made links use product type even from a custom category URL', () => {
  assert.equal(getProductUrl(products[4]), '/products/readyuse/ready');
  assert.equal(getProductUrl(products[4], 'plushie'), '/products/readyuse/ready');
});

test('custom links preserve category navigation and legacy URLs', () => {
  assert.equal(getProductUrl(products[0], 'plushie'), '/products/custom/plushie/custom-borderless');
  assert.equal(getProductUrl(products[0]), '/product/custom-borderless');
});
