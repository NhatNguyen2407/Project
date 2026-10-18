import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { observeAuthState } from '../src/app/utils/authState.js';

function setup() {
  let callback, bootstrap;
  const jobs = [], states = [], lookups = [];
  const client = {
    auth: {
      onAuthStateChange(fn) { callback = fn; return { data: { subscription: { unsubscribe() {} } } }; },
      getSession() { return new Promise(resolve => { bootstrap = resolve; }); },
    },
    from() { return { select() { return { eq(_key, id) { return { maybeSingle() {
      return new Promise(resolve => { lookups.push({ id, resolve }); });
    } }; } }; } }; },
  };
  const stop = observeAuthState(client, state => states.push(state), fn => jobs.push(fn));
  return { emit: session => callback('SIGNED_IN', session), boot: value => bootstrap(value), jobs, states, lookups, stop };
}
const session = id => ({ user: { id } });
test('auth callback returns synchronously before any SDK role lookup', async () => {
  const f = setup();
  assert.equal(f.emit(session('admin')), undefined);
  assert.equal(f.lookups.length, 0);
  const pending = f.jobs.shift()();
  f.lookups[0].resolve({ data: { role: 'admin' }, error: null });
  await pending;
  assert.equal(f.states.at(-1).role, 'admin');
});
test('signout and account changes invalidate late privileged role responses', async () => {
  const f = setup();
  f.emit(session('old-admin'));
  const pending = f.jobs.shift()();
  f.emit(null);
  f.emit(session('member'));
  f.lookups[0].resolve({ data: { role: 'admin' } });
  await pending;
  assert.equal(f.states.at(-1).role, 'customer');
  const member = f.jobs.shift()();
  f.lookups[1].resolve({ data: null });
  await member;
  assert.deepEqual(f.states.at(-1), { user: { id: 'member' }, role: 'customer', loading: false });
});
test('late session bootstrap and disposed lookups cannot restore stale admin', async () => {
  const f = setup();
  f.emit(null);
  f.boot({ data: { session: session('stale-admin') } });
  await Promise.resolve();
  assert.equal(f.jobs.length, 0);
  f.emit(session('admin'));
  const pending = f.jobs.shift()();
  f.stop();
  f.lookups[0].resolve({ data: { role: 'admin' } });
  await pending;
  assert.equal(f.states.at(-1).role, 'customer');
});
test('role lookup failures fail closed and login never logs session objects', async () => {
  const f = setup();
  f.emit(session('admin'));
  const pending = f.jobs.shift()();
  f.lookups[0].resolve({ error: Error('denied'), data: { role: 'admin' } });
  await pending;
  assert.equal(f.states.at(-1).role, 'customer');
  const source = await readFile(new URL('../src/app/pages/LoginPage.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /console\.(?:log|debug|info)\([^;]*(?:data|session|user)/i);
});
