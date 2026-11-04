import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { observeAuthSession, getSignedInPath } from '../src/app/utils/authSession.js';

test('auth provider does not log session payloads to the browser console', () => {
  const source = readFileSync(new URL('../src/app/context/AuthContext.jsx', import.meta.url), 'utf8');

  // A session contains access/refresh tokens; logging its full object is unsafe.
  assert.doesNotMatch(source, /console\.(?:log|info|debug|warn|error)\s*\([^;]*(?:\bsession\b|\bcurrentUser\b)/i);
});

test('login and registration do not print Auth responses containing credentials', () => {
  for (const file of ['LoginPage.jsx', 'RegisterPage.jsx']) {
    const source = readFileSync(new URL(`../src/app/pages/${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /console\.(?:log|info|debug|warn|error)\s*\([^;]*(?:\bdata\b|\bsession\b)/i);
  }
});

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const session = id => ({ user: { id } });
const flush = () => new Promise(resolve => setImmediate(resolve));
const roleReply = role => ({ data: role ? { role } : null, error: null });

function setup(t) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const startup = deferred();
  const changes = [];
  const requests = [];
  let callback;
  let unsubscribed = false;
  const client = {
    auth: {
      getSession: () => startup.promise,
      onAuthStateChange: listener => {
        callback = listener;
        return { data: { subscription: { unsubscribe: () => { unsubscribed = true; } } } };
      },
    },
    from(table) {
      assert.equal(table, 'user_roles');
      return {
        select(column) { assert.equal(column, 'role'); return this; },
        eq(column, userId) { assert.equal(column, 'user_id'); this.userId = userId; return this; },
        maybeSingle() { return this; },
        abortSignal(signal) {
          const reply = deferred();
          requests.push({ userId: this.userId, signal, ...reply });
          return reply.promise;
        },
      };
    },
  };
  const stop = observeAuthSession(client, state => changes.push(state), { timeoutMs: 100 });
  t.after(stop);
  return {
    startup, changes, requests, stop,
    emit: (event, value) => callback(event, value),
    latest: () => changes.at(-1),
    unsubscribed: () => unsubscribed,
  };
}

test('a visitor without a session settles without requesting account permissions', async t => {
  const auth = setup(t);
  auth.startup.resolve({ data: { session: null }, error: null });
  await flush();
  assert.deepEqual(auth.latest(), { user: null, role: 'customer', loading: false, error: null });
  assert.equal(auth.requests.length, 0);
});

test('Auth callback returns synchronously before any Supabase role request starts', async t => {
  const auth = setup(t);
  assert.equal(auth.emit('SIGNED_IN', session('admin')), undefined);
  assert.equal(auth.requests.length, 0);
  t.mock.timers.tick(0);
  assert.equal(auth.requests.length, 1);
  auth.requests[0].resolve(roleReply('admin'));
  await flush();
  assert.deepEqual(auth.latest(), { user: { id: 'admin' }, role: 'admin', loading: false, error: null });
});

test('a stale startup session cannot replace a newer sign-in event', async t => {
  const auth = setup(t);
  auth.emit('SIGNED_IN', session('new-user'));
  auth.startup.resolve({ data: { session: session('old-admin') }, error: null });
  await flush();
  t.mock.timers.tick(0);
  assert.deepEqual(auth.requests.map(request => request.userId), ['new-user']);
  auth.requests[0].resolve(roleReply(null));
  await flush();
  assert.equal(auth.latest().user.id, 'new-user');
  assert.equal(auth.latest().role, 'customer');
});

test('sign-out cancels pending permissions and ignores a late admin response', async t => {
  const auth = setup(t);
  auth.emit('SIGNED_IN', session('admin'));
  t.mock.timers.tick(0);
  auth.emit('SIGNED_OUT', null);
  assert.equal(auth.requests[0].signal.aborted, true);
  auth.requests[0].resolve(roleReply('admin'));
  await flush();
  assert.deepEqual(auth.latest(), { user: null, role: 'customer', loading: false, error: null });
});

test('switching from admin to an account without a role clears the old privilege immediately', async t => {
  const auth = setup(t);
  auth.emit('SIGNED_IN', session('admin'));
  t.mock.timers.tick(0);
  auth.requests[0].resolve(roleReply('admin'));
  await flush();
  auth.emit('SIGNED_IN', session('customer'));
  assert.equal(auth.latest().role, 'customer');
  assert.equal(auth.latest().loading, true);
  t.mock.timers.tick(0);
  auth.requests[1].resolve(roleReply(null));
  await flush();
  assert.equal(auth.latest().role, 'customer');
  assert.equal(auth.latest().loading, false);
});

test('newer role results win when requests finish in the wrong order', async t => {
  const auth = setup(t);
  auth.emit('SIGNED_IN', session('same-user'));
  t.mock.timers.tick(0);
  auth.emit('TOKEN_REFRESHED', session('same-user'));
  t.mock.timers.tick(0);
  auth.requests[1].resolve(roleReply('customer'));
  await flush();
  auth.requests[0].resolve(roleReply('admin'));
  await flush();
  assert.equal(auth.latest().role, 'customer');
  assert.equal(auth.latest().error, null);
});

test('refreshing an already loaded account does not put its page back into loading', async t => {
  const auth = setup(t);
  auth.emit('SIGNED_IN', session('customer'));
  t.mock.timers.tick(0);
  auth.requests[0].resolve(roleReply('customer'));
  await flush();
  auth.emit('TOKEN_REFRESHED', session('customer'));
  assert.equal(auth.latest().loading, false);
  t.mock.timers.tick(0);
  auth.requests[1].resolve(roleReply('customer'));
  await flush();
});

test('permission errors end loading, clear admin role and expose only a safe retry message', async t => {
  const auth = setup(t);
  auth.emit('SIGNED_IN', session('user'));
  t.mock.timers.tick(0);
  auth.requests[0].resolve({ data: null, error: new Error('private network details') });
  await flush();
  assert.equal(auth.latest().role, 'customer');
  assert.equal(auth.latest().loading, false);
  assert.match(auth.latest().error, /Please retry/);
  assert.doesNotMatch(auth.latest().error, /private/);
  auth.emit('SIGNED_IN', session('user'));
  assert.equal(auth.latest().loading, true);
});

test('a hung permissions request times out and cannot restore admin with a late result', async t => {
  const auth = setup(t);
  auth.emit('SIGNED_IN', session('user'));
  t.mock.timers.tick(0);
  t.mock.timers.tick(100);
  assert.equal(auth.requests[0].signal.aborted, true);
  assert.equal(auth.latest().loading, false);
  assert.match(auth.latest().error, /permissions/);
  auth.requests[0].resolve(roleReply('admin'));
  await flush();
  assert.equal(auth.latest().role, 'customer');
  assert.match(auth.latest().error, /permissions/);
});

test('a failed session read ends loading with a retry message', async t => {
  const auth = setup(t);
  auth.startup.resolve({ data: { session: null }, error: new Error('session error') });
  await flush();
  assert.equal(auth.latest().user, null);
  assert.equal(auth.latest().loading, false);
  assert.match(auth.latest().error, /session/);
});

test('a rejected session read is handled without an unhandled rejection', async t => {
  const auth = setup(t);
  auth.startup.reject(new Error('offline'));
  await flush();
  assert.equal(auth.latest().loading, false);
  assert.match(auth.latest().error, /Please retry/);
});

test('a hung startup read times out and a late session cannot bypass the retry state', async t => {
  const auth = setup(t);
  await flush();
  t.mock.timers.tick(100);
  assert.equal(auth.latest().loading, false);
  assert.match(auth.latest().error, /session/);
  auth.startup.resolve({ data: { session: session('late-user') }, error: null });
  await flush();
  assert.equal(auth.latest().user, null);
  assert.equal(auth.requests.length, 0);
});

test('unmount unsubscribes, aborts requests and ignores all late completions', async t => {
  const auth = setup(t);
  auth.emit('SIGNED_IN', session('user'));
  t.mock.timers.tick(0);
  const count = auth.changes.length;
  auth.stop();
  assert.equal(auth.unsubscribed(), true);
  assert.equal(auth.requests[0].signal.aborted, true);
  auth.requests[0].resolve(roleReply('admin'));
  auth.startup.resolve({ data: { session: session('old-user') }, error: null });
  t.mock.timers.tick(200);
  await flush();
  assert.equal(auth.changes.length, count);
});

test('sign-out before the deferred request starts prevents the request entirely', async t => {
  const auth = setup(t);
  auth.emit('SIGNED_IN', session('user'));
  auth.emit('SIGNED_OUT', null);
  t.mock.timers.tick(0);
  assert.equal(auth.requests.length, 0);
  assert.equal(auth.latest().user, null);
});

test('signed-in routing uses only the resolved role and defaults to the customer page', () => {
  assert.equal(getSignedInPath('admin'), '/admin');
  for (const role of ['customer', 'unknown', null, undefined]) assert.equal(getSignedInPath(role), '/profile');
});
