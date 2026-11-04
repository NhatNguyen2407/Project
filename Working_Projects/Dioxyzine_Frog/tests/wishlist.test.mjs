import test from 'node:test';
import assert from 'node:assert/strict';
import { createWishlistStore } from '../src/app/utils/wishlistStore.js';

const flush = () => new Promise(resolve => setImmediate(resolve));
function setup(t) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const requests = [];
  const client = { from(table) {
    assert.equal(table, 'wishlists');
    const call = { type: 'read', filters: {} };
    return {
      select(columns) { call.columns = columns; return this; },
      eq(key, value) { call.filters[key] = value; return this; },
      order() { return this; },
      upsert(payload, options) { Object.assign(call, { type: 'save', payload, options }); return this; },
      delete() { call.type = 'remove'; return this; },
      abortSignal(signal) {
        return new Promise((resolve, reject) => requests.push({ ...call, signal, resolve, reject }));
      },
    };
  } };
  const store = createWishlistStore(client, { timeoutMs: 100 });
  t.after(() => store.setUser(null));
  const load = async (items = [], userId = 'customer') => {
    store.setUser(userId);
    requests.at(-1).resolve({ data: items, error: null });
    await flush();
  };
  return { store, requests, load };
}

test('guests have an empty wishlist and cause no database requests', async t => {
  const { store, requests } = setup(t);
  store.setUser(null);
  assert.deepEqual(store.getSnapshot().items, []);
  assert.equal(await store.refresh(), false);
  await assert.rejects(store.setLiked('P1', true), /sign in/);
  assert.equal(requests.length, 0);
});

test('one account load serves every subscriber and is explicitly scoped to that account', async t => {
  const { store, requests, load } = setup(t);
  let a = 0, b = 0;
  const stop = store.subscribe(() => a++);
  store.subscribe(() => b++);
  await load([{ product_id: 'P1' }]);
  assert.equal(requests.length, 1);
  assert.deepEqual(requests[0].filters, { user_id: 'customer' });
  assert.deepEqual(store.getSnapshot().items, [{ product_id: 'P1' }]);
  assert.equal(a, b);
  stop();
  store.setUser(null);
  assert.ok(b > a);
});

test('account switches and sign-out clear old items and ignore late reads', async t => {
  const { store, requests, load } = setup(t);
  await load([{ product_id: 'P1' }]);
  store.refresh();
  const old = requests.at(-1);
  store.setUser('different-customer');
  assert.deepEqual(store.getSnapshot().items, []);
  assert.equal(old.signal.aborted, true);
  const current = requests.at(-1);
  old.resolve({ data: [{ product_id: 'private-old-item' }], error: null });
  current.resolve({ data: [{ product_id: 'P2' }], error: null });
  await flush();
  assert.deepEqual(store.getSnapshot().items, [{ product_id: 'P2' }]);
  store.setUser(null);
  assert.deepEqual(store.getSnapshot().items, []);
});

test('loads time out with a safe retry state and late responses cannot replace it', async t => {
  const { store, requests } = setup(t);
  store.setUser('customer');
  const stalled = requests[0];
  t.mock.timers.tick(100);
  await flush();
  assert.equal(stalled.signal.aborted, true);
  assert.equal(store.getSnapshot().loading, false);
  assert.match(store.getSnapshot().error, /Refresh/);
  stalled.resolve({ data: [{ product_id: 'late' }], error: null });
  await flush();
  assert.deepEqual(store.getSnapshot().items, []);
  const retry = store.refresh();
  requests.at(-1).resolve({ data: [{ product_id: 'P1' }], error: null });
  assert.equal(await retry, true);
  assert.equal(store.getSnapshot().error, null);
});

test('failed and malformed reads remain errors rather than a claimed empty result', async t => {
  const { store, requests } = setup(t);
  for (const result of [{ error: new Error('private diagnostic') }, { data: null, error: null }]) {
    store.setUser('customer');
    requests.at(-1).resolve(result);
    await flush();
    assert.equal(store.getSnapshot().loading, false);
    assert.match(store.getSnapshot().error, /could not/i);
    assert.doesNotMatch(store.getSnapshot().error, /private/);
  }
});

test('like and unlike change shared state only after the database confirms the correct row', async t => {
  const { store, requests, load } = setup(t);
  await load();
  const adding = store.setLiked('P1', true);
  const add = requests.at(-1);
  assert.deepEqual(store.getSnapshot().items, []);
  assert.deepEqual(add.payload, { user_id: 'customer', product_id: 'P1' });
  assert.deepEqual(add.options, { onConflict: 'user_id,product_id' });
  add.resolve({ data: [{ user_id: 'customer', product_id: 'P1' }], error: null });
  assert.equal(await adding, true);
  assert.equal(store.getSnapshot().items[0].product_id, 'P1');
  const removing = store.setLiked('P1', false);
  const remove = requests.at(-1);
  assert.deepEqual(remove.filters, { user_id: 'customer', product_id: 'P1' });
  assert.equal(store.getSnapshot().items.length, 1);
  remove.resolve({ data: [{ user_id: 'customer', product_id: 'P1' }], error: null });
  assert.equal(await removing, true);
  assert.deepEqual(store.getSnapshot().items, []);
});

test('duplicate clicks and refreshes cannot race a pending write', async t => {
  const { store, requests, load } = setup(t);
  await load();
  const writing = store.setLiked('P1', true);
  const count = requests.length;
  assert.equal(await store.setLiked('P1', true), false);
  assert.equal(await store.refresh(), false);
  assert.equal(requests.length, count);
  requests.at(-1).resolve({ data: [{ user_id: 'customer', product_id: 'P1' }], error: null });
  await writing;
  assert.deepEqual(store.getSnapshot().pending, []);
});

test('parallel writes to different items preserve both results', async t => {
  const { store, requests, load } = setup(t);
  await load();
  const first = store.setLiked('P1', true);
  const firstRequest = requests.at(-1);
  const second = store.setLiked('P2', true);
  requests.at(-1).resolve({ data: [{ user_id: 'customer', product_id: 'P2' }], error: null });
  await second;
  firstRequest.resolve({ data: [{ user_id: 'customer', product_id: 'P1' }], error: null });
  await first;
  assert.deepEqual(store.getSnapshot().items.map(x => x.product_id).sort(), ['P1', 'P2']);
});

test('zero, absent, mismatched or multiple mutation rows never produce success', async t => {
  const { store, requests, load } = setup(t);
  for (const data of [[], null, [{ user_id: 'someone-else', product_id: 'P1' }], [{ user_id: 'customer', product_id: 'P2' }], [{ user_id: 'customer', product_id: 'P1' }, { user_id: 'customer', product_id: 'P1' }]]) {
    await load([{ product_id: 'P1' }]);
    const writing = store.setLiked('P1', false);
    requests.at(-1).resolve({ data, error: null });
    await assert.rejects(writing, /Could not confirm/);
    assert.deepEqual(store.getSnapshot().items, [{ product_id: 'P1' }]);
    assert.deepEqual(store.getSnapshot().pending, []);
  }
});

test('write failure, timeout and account changes cannot restore stale liked state', async t => {
  const { store, requests, load } = setup(t);
  await load();
  const failed = store.setLiked('P1', true);
  requests.at(-1).resolve({ error: new Error('RLS rejection') });
  await assert.rejects(failed, /Could not confirm/);
  assert.deepEqual(store.getSnapshot().items, []);
  await load();
  const stalled = store.setLiked('P1', true);
  const late = requests.at(-1);
  const rejection = assert.rejects(stalled, /Could not confirm/);
  t.mock.timers.tick(100);
  await rejection;
  late.resolve({ data: [{ user_id: 'customer', product_id: 'P1' }], error: null });
  await flush();
  assert.deepEqual(store.getSnapshot().items, []);
  await load();
  const old = store.setLiked('P1', true);
  store.setUser(null);
  assert.equal(await old, false);
  assert.deepEqual(store.getSnapshot().items, []);
});
