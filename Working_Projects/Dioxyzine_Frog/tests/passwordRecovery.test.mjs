import test from 'node:test';
import assert from 'node:assert/strict';
import { createPasswordRecoveryTracker, hasAuthRedirectError } from '../src/app/utils/passwordRecovery.js';

const NOW = 1800000000000;
const KEY = 'dioxyzine_password_recovery';
const session = (user = 'customer', id = 'recovery-session', expires = NOW / 1000 + 3600) => ({
  user: { id: user }, expires_at: expires,
  access_token: `header.${Buffer.from(JSON.stringify({ session_id: id })).toString('base64url')}.signature`,
  refresh_token: 'private-refresh-token',
});

function setup(t, options = {}) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const values = new Map();
  const storage = {
    getItem: key => values.get(key),
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  if (options.marker) values.set(KEY, options.marker);
  let callback, unsubscribed = false, clock = NOW;
  const client = { auth: { onAuthStateChange: listener => {
    callback = listener;
    return { data: { subscription: { unsubscribe: () => { unsubscribed = true; } } } };
  } } };
  const tracker = createPasswordRecoveryTracker(client, { storage, now: () => clock, timeoutMs: 100, ...options });
  t.after(() => tracker.dispose());
  return {
    tracker, values, emit: (event, value) => callback(event, value),
    advance: ms => { clock += ms; t.mock.timers.tick(ms); },
    unsubscribed: () => unsubscribed,
  };
}

test('ordinary signed-in sessions cannot open password recovery', t => {
  const { tracker, emit } = setup(t);
  emit('INITIAL_SESSION', session());
  t.mock.timers.tick(0);
  assert.equal(tracker.getStatus(), 'invalid');
  assert.equal(tracker.isRecoverySession(session()), false);
});

test('a URL recovery label alone does not establish recovery authorization', t => {
  assert.equal(hasAuthRedirectError('https://shop.example/reset-password?type=recovery'), false);
  const { tracker, emit } = setup(t);
  emit('SIGNED_IN', session());
  assert.equal(tracker.getStatus(), 'invalid');
});

test('recovery events received before React subscribes remain available without storing tokens', t => {
  const { tracker, emit, values } = setup(t);
  const recovery = session();
  emit('PASSWORD_RECOVERY', recovery);
  const changes = [];
  const stop = tracker.subscribe(status => changes.push(status));
  assert.deepEqual(changes, ['ready']);
  assert.equal(tracker.isRecoverySession(recovery), true);
  const saved = values.get(KEY);
  assert.deepEqual(JSON.parse(saved), { userId: 'customer', sessionId: 'recovery-session', expiresAt: recovery.expires_at });
  assert.equal(saved.includes(recovery.access_token), false);
  assert.equal(saved.includes(recovery.refresh_token), false);
  stop();
  tracker.invalidate();
  assert.deepEqual(changes, ['ready']);
});

test('SDK initial-session and recovery-event ordering cannot discard a genuine recovery', t => {
  const { tracker, emit } = setup(t);
  emit('INITIAL_SESSION', session());
  emit('PASSWORD_RECOVERY', session());
  t.mock.timers.tick(0);
  assert.equal(tracker.getStatus(), 'ready');
  emit('INITIAL_SESSION', session());
  assert.equal(tracker.getStatus(), 'ready');
});

test('a verified marker restores the same recovery session after reload', t => {
  const marker = JSON.stringify({ userId: 'customer', sessionId: 'recovery-session', expiresAt: NOW / 1000 + 60 });
  const { tracker, emit } = setup(t, { marker });
  emit('INITIAL_SESSION', session());
  assert.equal(tracker.getStatus(), 'ready');
  emit('TOKEN_REFRESHED', session('customer', 'recovery-session', NOW / 1000 + 7200));
  assert.equal(tracker.getStatus(), 'ready');
});

test('account changes and new sessions invalidate the old recovery proof', t => {
  const { tracker, emit, values } = setup(t);
  emit('PASSWORD_RECOVERY', session());
  emit('SIGNED_IN', session('other-customer'));
  assert.equal(tracker.getStatus(), 'invalid');
  assert.equal(values.has(KEY), false);
  emit('PASSWORD_RECOVERY', session());
  emit('SIGNED_IN', session('customer', 'different-session'));
  assert.equal(tracker.getStatus(), 'invalid');
  emit('PASSWORD_RECOVERY', session());
  emit('SIGNED_OUT', null);
  assert.equal(tracker.getStatus(), 'invalid');
  assert.equal(values.has(KEY), false);
});

test('recovery proof expires within one hour even if tokens have a longer lifetime', t => {
  const { tracker, emit, advance, values } = setup(t);
  emit('PASSWORD_RECOVERY', session('customer', 'recovery-session', NOW / 1000 + 7200));
  assert.equal(JSON.parse(values.get(KEY)).expiresAt, NOW / 1000 + 3600);
  advance(3600000);
  assert.equal(tracker.isRecoverySession(session('customer', 'recovery-session', NOW / 1000 + 7200)), false);
  emit('TOKEN_REFRESHED', session('customer', 'recovery-session', NOW / 1000 + 7200));
  assert.equal(tracker.getStatus(), 'invalid');
});

test('expired or malformed tokens and malformed stored markers fail closed', t => {
  const { tracker, emit } = setup(t, { marker: '{broken JSON' });
  emit('PASSWORD_RECOVERY', session('customer', 'recovery-session', NOW / 1000));
  assert.equal(tracker.getStatus(), 'invalid');
  emit('PASSWORD_RECOVERY', { ...session(), access_token: 'invalid' });
  assert.equal(tracker.getStatus(), 'invalid');
  emit('PASSWORD_RECOVERY', session());
  assert.equal(tracker.isRecoverySession({ ...session(), expires_at: NOW / 1000 }), false);
});

test('a marker with no session identity cannot authorize a malformed current session', t => {
  const { tracker, emit } = setup(t, { marker: JSON.stringify({ userId: 'customer', sessionId: null, expiresAt: NOW / 1000 + 60 }) });
  emit('INITIAL_SESSION', { ...session(), access_token: 'invalid' });
  t.mock.timers.tick(0);
  assert.equal(tracker.getStatus(), 'invalid');
});

test('query and fragment Auth errors override cached recovery sessions', t => {
  for (const suffix of ['?error=access_denied', '#error_code=otp_expired', '?error_description=Expired']) {
    assert.equal(hasAuthRedirectError(`https://shop.example/reset-password${suffix}`), true);
  }
  assert.equal(hasAuthRedirectError('invalid URL'), true);
  const { tracker, emit, values } = setup(t, {
    redirectError: true,
    marker: JSON.stringify({ userId: 'customer', sessionId: 'recovery-session', expiresAt: NOW / 1000 + 60 }),
  });
  emit('PASSWORD_RECOVERY', session());
  assert.equal(tracker.getStatus(), 'invalid');
  assert.equal(values.has(KEY), false);
});

test('recovery still works with browser storage disabled', t => {
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
  const { tracker, emit } = setup(t, { storage: blocked });
  emit('PASSWORD_RECOVERY', session());
  assert.equal(tracker.isRecoverySession(session()), true);
  tracker.invalidate();
  assert.equal(tracker.getStatus(), 'invalid');
});

test('startup has a retryable deadline and disposal prevents late notifications', t => {
  const { tracker, emit, advance, unsubscribed } = setup(t);
  advance(100);
  assert.equal(tracker.getStatus(), 'error');
  emit('PASSWORD_RECOVERY', session());
  assert.equal(tracker.getStatus(), 'ready');
  tracker.dispose();
  assert.equal(unsubscribed(), true);
  emit('SIGNED_OUT', null);
  assert.equal(tracker.getStatus(), 'ready');
});
