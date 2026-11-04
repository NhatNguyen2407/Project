import test from 'node:test';
import assert from 'node:assert/strict';
import { requestPasswordReset, registerCustomer, signInWithSocial, completePasswordRecovery, endRecoverySession } from '../src/app/service/authFlows.js';

const origin = 'https://shop.example';

test('reset email uses trimmed input and the recovery route, including non-disclosing server success', async () => {
  const calls = [];
  const client = { auth: { resetPasswordForEmail: async (...args) => { calls.push(args); return { error: null }; } } };
  await requestPasswordReset(client, '  customer@example.com  ', origin);
  assert.deepEqual(calls, [['customer@example.com', { redirectTo: `${origin}/reset-password` }]]);
});

test('reset email reports returned delivery, rate-limit and service errors rather than fake success', async () => {
  for (const status of [400, 429, 500]) {
    const error = Object.assign(new Error('provider unavailable'), { status });
    const client = { auth: { resetPasswordForEmail: async () => ({ error }) } };
    await assert.rejects(requestPasswordReset(client, 'customer@example.com', origin), error);
  }
  const client = { auth: { resetPasswordForEmail: async () => { throw new Error('offline'); } } };
  await assert.rejects(requestPasswordReset(client, 'customer@example.com', origin), /offline/);
});

test('registration trims customer details and returns the actual confirmation/session outcome', async () => {
  let submitted;
  let result = { user: { id: 'customer' }, session: null };
  const client = { auth: { signUp: async payload => { submitted = payload; return { data: result, error: null }; } } };
  const form = { email: ' customer@example.com ', fullName: ' Customer Name ', password: 'example-password' };
  assert.equal(await registerCustomer(client, form, origin), result);
  assert.deepEqual(submitted, {
    email: 'customer@example.com', password: form.password,
    options: { emailRedirectTo: `${origin}/login`, data: { full_name: 'Customer Name' } },
  });
  result = { user: { id: 'customer' }, session: { user: { id: 'customer' } } };
  assert.equal(await registerCustomer(client, form, origin), result);
});

test('registration errors are not reported as confirmation success', async () => {
  const client = { auth: { signUp: async () => ({ error: new Error('signup rejected') }) } };
  await assert.rejects(registerCustomer(client, { email: 'a@example.com', fullName: 'A', password: 'example-password' }, origin), /signup rejected/);
});

test('Google and Facebook use the same role-aware return route and surface OAuth failures', async () => {
  const calls = [];
  const client = { auth: { signInWithOAuth: async payload => { calls.push(payload); return { error: null }; } } };
  for (const provider of ['google', 'facebook']) await signInWithSocial(client, provider, origin);
  assert.deepEqual(calls, ['google', 'facebook'].map(provider => ({ provider, options: { redirectTo: `${origin}/login` } })));
  client.auth.signInWithOAuth = async () => ({ error: new Error('provider disabled') });
  await assert.rejects(signInWithSocial(client, 'google', origin), /provider disabled/);
});

function recoveryFlow() {
  const calls = [];
  const session = { user: { id: 'customer' } };
  let status = 'ready';
  const recovery = {
    getStatus: () => status,
    isRecoverySession: value => value === session,
    invalidate: () => { calls.push('invalidate'); status = 'invalid'; },
  };
  const client = { auth: {
    getSession: async () => ({ data: { session }, error: null }),
    updateUser: async payload => { calls.push(['update', payload]); return { error: null }; },
    signOut: async options => { calls.push(['signOut', options]); return { error: null }; },
  } };
  return { client, recovery, calls };
}

test('password updates require recovery proof and a matching current session', async () => {
  const { client, recovery, calls } = recoveryFlow();
  recovery.getStatus = () => 'invalid';
  await assert.rejects(completePasswordRecovery(client, recovery, 'example-password'), /Invalid recovery/);
  assert.deepEqual(calls, []);
  recovery.getStatus = () => 'ready';
  client.auth.getSession = async () => ({ data: { session: { user: { id: 'different-customer' } } }, error: null });
  await assert.rejects(completePasswordRecovery(client, recovery, 'example-password'), /Invalid recovery/);
  assert.deepEqual(calls, ['invalidate']);
});

test('failed session reads and password updates cannot claim success or sign out early', async () => {
  const { client, recovery, calls } = recoveryFlow();
  client.auth.getSession = async () => ({ error: new Error('session read failed') });
  await assert.rejects(completePasswordRecovery(client, recovery, 'example-password'), /session read failed/);
  assert.deepEqual(calls, []);
  client.auth.getSession = async () => ({ data: { session: {} }, error: null });
  recovery.isRecoverySession = () => true;
  client.auth.updateUser = async () => ({ error: new Error('password rejected') });
  await assert.rejects(completePasswordRecovery(client, recovery, 'example-password', () => calls.push('changed')), /password rejected/);
  assert.deepEqual(calls, []);
  assert.equal(recovery.getStatus(), 'ready');
});

test('successful recovery records the password change before ending only the current session', async () => {
  const { client, recovery, calls } = recoveryFlow();
  assert.equal(await completePasswordRecovery(client, recovery, 'example-password', () => calls.push('changed')), true);
  assert.deepEqual(calls, [['update', { password: 'example-password' }], 'changed', 'invalidate', ['signOut', { scope: 'local' }]]);
  assert.equal(recovery.getStatus(), 'invalid');
});

test('failed sign-out is retried without applying the password change twice', async () => {
  const { client, recovery, calls } = recoveryFlow();
  client.auth.signOut = async () => ({ error: new Error('offline') });
  assert.equal(await completePasswordRecovery(client, recovery, 'example-password', () => calls.push('changed')), false);
  assert.deepEqual(calls, [['update', { password: 'example-password' }], 'changed', 'invalidate']);
  client.auth.signOut = async () => { throw new Error('network error'); };
  assert.equal(await endRecoverySession(client), false);
  client.auth.signOut = async options => { calls.push(['signOut', options]); return { error: null }; };
  assert.equal(await endRecoverySession(client), true);
  assert.equal(calls.filter(call => Array.isArray(call) && call[0] === 'update').length, 1);
});
