import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeleteAccountHandler } from '../supabase/functions/delete-account/handler.js';

function setup(options = {}) {
  const calls = [];
  const files = options.files || [];
  const avatarStorage = {
    list: async (path, query) => {
      calls.push(['list', path, query]);
      return { data: files.slice(query.offset, query.offset + query.limit), error: options.listError };
    },
    remove: async paths => { calls.push(['remove', paths]); return { error: options.removeError }; },
  };
  const createClient = (url, key, configuration) => {
    calls.push(['client', key, configuration]);
    return key === 'anon' ? { auth: { getUser: async () => ({ data: { user: options.unauthorized ? null : { id: 'customer' } }, error: null }) } }
      : { storage: { from: bucket => { assert.equal(bucket, 'avatars'); return avatarStorage; } }, auth: { admin: {
        deleteUser: async id => { calls.push(['delete', id]); return { error: options.deleteError }; },
      } } };
  };
  const handler = createDeleteAccountHandler(createClient, name => ({ SUPABASE_URL: 'https://fixture.invalid', SUPABASE_ANON_KEY: 'anon', SUPABASE_SERVICE_ROLE_KEY: 'service' })[name]);
  const invoke = (body = { confirmation: 'DELETE', userId: 'customer' }, overrides = {}) => handler(new Request('https://fixture.invalid/delete-account', {
    method: 'POST', headers: { Authorization: 'Bearer fixture-token', 'Content-Type': 'application/json' }, body: JSON.stringify(body), ...overrides,
  }));
  return { calls, invoke };
}

test('account deletion rejects unsupported methods, missing sessions and invalid confirmation without creating clients', async () => {
  const { invoke, calls } = setup();
  assert.equal((await invoke(undefined, { method: 'GET', body: undefined })).status, 405);
  assert.equal((await invoke(undefined, { headers: {} })).status, 401);
  assert.equal((await invoke({ confirmation: 'delete' })).status, 400);
  assert.equal((await invoke(undefined, { body: '{invalid' })).status, 400);
  assert.deepEqual(calls, []);
});

test('invalid caller sessions cannot create a privileged client or mutate anything', async () => {
  const { invoke, calls } = setup({ unauthorized: true });
  assert.equal((await invoke()).status, 401);
  assert.equal(calls.filter(call => call[0] === 'client').length, 1);
  assert.equal(calls.some(call => ['list', 'remove', 'delete'].includes(call[0])), false);
});

test('a mismatched account ID cannot delete either account or initialize the privileged client', async () => {
  const { invoke, calls } = setup();
  const response = await invoke({ confirmation: 'DELETE', userId: 'victim' });
  assert.equal(response.status, 409);
  assert.equal(calls.some(call => call[0] === 'delete'), false);
  assert.equal(calls.filter(call => call[0] === 'client').length, 1);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('a confirmed deletion can target only the verified current account', async () => {
  const { invoke, calls } = setup();
  const response = await invoke();
  assert.deepEqual(await response.json(), { success: true });
  assert.deepEqual(calls.filter(call => call[0] === 'delete'), [['delete', 'customer']]);
});

test('avatar cleanup is paginated, batches below the Storage limit and finishes before Auth deletion', async () => {
  const files = Array.from({ length: 1005 }, (_, i) => ({ id: `file-${i}`, name: `customer-${i}.png` }));
  const { invoke, calls } = setup({ files });
  assert.equal((await invoke()).status, 200);
  assert.equal(calls.filter(call => call[0] === 'list').length, 11);
  const removals = calls.filter(call => call[0] === 'remove');
  assert.deepEqual(removals.map(call => call[1].length), [1000, 5]);
  assert.equal(calls.at(-1)[0], 'delete');
});

test('cleanup never removes another account path or treats a folder as an avatar file', async () => {
  const files = [{ id: 'own', name: 'customer-avatar.png' }, { id: 'other', name: 'other-customer-avatar.png' }, { id: null, name: 'customer-folder' }];
  const { invoke, calls } = setup({ files });
  assert.equal((await invoke()).status, 200);
  assert.deepEqual(calls.find(call => call[0] === 'remove')[1], ['customer-avatar.png']);
});

test('a failed avatar listing stops before Storage or Auth deletion', async () => {
  const { invoke, calls } = setup({ listError: new Error('private diagnostic') });
  const response = await invoke();
  assert.equal(response.status, 500);
  assert.equal(calls.some(call => ['remove', 'delete'].includes(call[0])), false);
  assert.doesNotMatch((await response.json()).error, /private diagnostic/);
});

test('failed Storage removal stops before Auth deletion and clearly reports partial cleanup', async () => {
  const { invoke, calls } = setup({ files: [{ id: 'own', name: 'customer-avatar.png' }], removeError: new Error('provider failure') });
  const response = await invoke();
  assert.equal(response.status, 500);
  assert.equal(calls.some(call => call[0] === 'delete'), false);
  assert.match((await response.json()).error, /avatar files may already/);
});

test('Auth deletion failures never return success or expose internal database errors', async () => {
  const { invoke } = setup({ deleteError: new Error('internal constraint details') });
  const response = await invoke();
  assert.equal(response.status, 500);
  const payload = await response.json();
  assert.equal(payload.success, false);
  assert.doesNotMatch(payload.error, /constraint/);
});

test('preflight is available without authentication and permits only POST and OPTIONS', async () => {
  const { invoke, calls } = setup();
  const response = await invoke(undefined, { method: 'OPTIONS', body: undefined, headers: {} });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Access-Control-Allow-Methods'), 'POST, OPTIONS');
  assert.deepEqual(calls, []);
});
