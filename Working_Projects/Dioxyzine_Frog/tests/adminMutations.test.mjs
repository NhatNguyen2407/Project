import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertConfirmedMutation, requireOrderId } from '../src/app/utils/orderIntegrity.js';

const source = readFileSync(new URL('../src/app/pages/AdminPage.jsx', import.meta.url), 'utf8');
const id = '123e4567-e89b-42d3-a456-426614174000';
const event = { preventDefault() {} };

function fixture(result) {
  const calls = { success: [], errors: [], effects: 0, mail: 0, trace: [], writes: [], filters: [] };
  const query = {
    eq(column, value) { calls.filters.push([column, value]); return this; },
    select() { calls.trace.push('confirm'); return Promise.resolve(result); },
    then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); },
  };
  for (const type of ['update', 'insert', 'upsert']) {
    query[type] = payload => { calls.writes.push({ type, payload }); return query; };
  }
  const changed = () => { calls.effects += 1; };
  const scope = {
    supabase: { from: () => query }, assertConfirmedMutation, requireOrderId,
    toast: { success: value => calls.success.push(value), error: value => calls.errors.push(value) },
    setUpdatingId() {}, setPaypalOrders: changed, setOrders: changed,
    orders: [{ id }], paypalOrders: [{ id }], replyInputs: { [id]: 'Fixture reply' },
    window: { prompt: () => 'FIXTURE-TRACKING' }, environment: {},
    emailjs: { send: async () => { calls.mail += 1; calls.trace.push('mail'); } },
    productForm: { id, image_cover: '', images_gallery: '' }, editingProduct: { id },
    coverFile: null, galleryFiles: [], isSavingProduct: false, setIsSavingProduct() {},
    fetchData: async () => changed(), setIsModalOpen: changed,
    voucherForm: { code: '  fixture  ' }, hasExpiration: false,
    setIsVoucherModalOpen: changed, setVoucherForm() {}, setHasExpiration() {},
  };
  return { calls, scope };
}

function handler(name, scope) {
  const start = source.indexOf(`const ${name} = async `);
  const end = source.indexOf('\n  };', start);
  assert.ok(start >= 0 && end > start, `Missing handler: ${name}`);
  // Execute the actual handler with fake services; Vite environment values stay synthetic.
  const expression = source.slice(source.indexOf('async', start), end + 4).replaceAll('import.meta.env', 'environment');
  return Function(...Object.keys(scope), `return (${expression});`)(...Object.values(scope));
}

const actions = [
  ['handleUpdateStatus', [{ id }, 'confirmed']],
  ['handleSaveReply', [id]],
  ['handleToggleReviewVisibility', [id, false]],
  ['handleSaveProduct', [event]],
  ['handleSaveVoucher', [event]],
];

test('unconfirmed Admin writes never change visible records, close forms or report success', async () => {
  for (const result of [
    { data: [], error: null }, { data: null, error: null }, { data: [{}], error: null },
    { data: [{ id }, { id }], error: null }, { data: null, error: new Error('Denied fixture') },
  ]) {
    for (const [name, args] of actions) {
      const { scope, calls } = fixture(result);
      await handler(name, scope)(...args);
      assert.equal(calls.success.length, 0, name);
      assert.equal(calls.effects, 0, name);
      assert.equal(calls.mail, 0, name);
      assert.equal(calls.errors.length, 1, name);
    }
  }
});

test('confirmed Admin writes complete their normal UI updates', async () => {
  for (const [name, args] of actions) {
    const { scope, calls } = fixture({ data: [{ id }], error: null });
    await handler(name, scope)(...args);
    assert.equal(calls.errors.length, 0, name);
    assert.equal(calls.success.length, 1, name);
    assert.ok(calls.effects > 0, name);
    assert.ok(calls.trace.includes('confirm'), name);
  }
});

test('shipping email runs only after the database confirms the target order', async () => {
  for (const data of [[], [{ id: 'other-order' }], [{ id }]]) {
    const { scope, calls } = fixture({ data, error: null });
    await handler('handleUpdateStatus', scope)({ id, customer_email: 'fixture@example.invalid' }, 'shipping');
    assert.equal(calls.mail, data[0]?.id === id ? 1 : 0);
    if (calls.mail) assert.ok(calls.trace.indexOf('confirm') < calls.trace.indexOf('mail'));
  }
});

test('product creation inserts and editing updates only the original product', async () => {
  for (const editing of [false, true]) {
    const { scope, calls } = fixture({ data: [{ id }], error: null });
    scope.editingProduct = editing ? { id } : null;
    await handler('handleSaveProduct', scope)(event);
    assert.equal(calls.writes[0].type, editing ? 'update' : 'insert');
    if (editing) assert.deepEqual(calls.filters, [['id', id]]);
  }
});

test('voucher codes and review replies normalize meaningful input and reject blank replies', async () => {
  const { scope, calls } = fixture({ data: [{ id }], error: null });
  await handler('handleSaveVoucher', scope)(event);
  assert.equal(calls.writes[0].payload[0].code, 'FIXTURE');
  for (const text of ['   ', '  Fixture reply  ']) {
    const reply = fixture({ data: [{ id }], error: null });
    reply.scope.replyInputs[id] = text;
    await handler('handleSaveReply', reply.scope)(id);
    assert.equal(reply.calls.writes.length, text.trim() ? 1 : 0);
    if (text.trim()) assert.equal(reply.calls.writes[0].payload.admin_reply, 'Fixture reply');
    else assert.equal(reply.calls.errors.length, 1);
  }
});
