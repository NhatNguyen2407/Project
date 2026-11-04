import test from 'node:test';
import assert from 'node:assert/strict';
import { profileFromUser, mergeOrderReview, prepareReorder, saveCustomerProfile, deleteCustomerAccount } from '../src/app/service/customerProfile.js';

function setup() {
  const user = { id: 'customer', email: 'current@example.com', user_metadata: { full_name: 'Customer', avatar_url: 'https://example.invalid/old.png' } };
  let saved = user;
  const calls = [];
  const storage = {
    upload: async (path, file, options) => { calls.push(['upload', path, file, options]); return { error: null }; },
    getPublicUrl: path => ({ data: { publicUrl: `https://example.invalid/${path}` } }),
    remove: async paths => { calls.push(['remove', paths]); return { error: null }; },
  };
  const client = {
    auth: {
      getSession: async () => ({ data: { session: { user } }, error: null }),
      getUser: async () => ({ data: { user: saved }, error: null }),
      updateUser: async (attributes, options) => {
        calls.push(['update', attributes, options]);
        saved = { ...user, user_metadata: { ...user.user_metadata, ...attributes.data }, new_email: attributes.email || user.new_email };
        return { data: { user: saved }, error: null };
      },
      signOut: async options => { calls.push(['signOut', options]); return { error: null }; },
    },
    storage: { from: bucket => { assert.equal(bucket, 'avatars'); return storage; } },
    functions: { invoke: async (...args) => { calls.push(['invoke', ...args]); return { data: { success: true }, error: null }; } },
  };
  const save = (form = profileFromUser(user), password = '', confirmation = '', avatar = null) =>
    saveCustomerProfile(client, user, form, password, confirmation, avatar, 'https://shop.example');
  return { user, client, storage, calls, save };
}

test('profile updates combine metadata, password and requested email in one Auth write', async () => {
  const { user, calls, save } = setup();
  const result = await save({ fullName: ' Updated Name ', email: ' new@example.com ', avatarUrl: user.user_metadata.avatar_url }, 'new-example-password', 'new-example-password');
  assert.deepEqual(calls, [['update', {
    data: { full_name: 'Updated Name', avatar_url: user.user_metadata.avatar_url },
    email: 'new@example.com', password: 'new-example-password',
  }, { emailRedirectTo: 'https://shop.example/profile' }]]);
  assert.equal(result.emailPending, true);
  assert.equal(result.user.email, user.email);
  assert.equal(profileFromUser(result.user).email, 'new@example.com');
});

test('saving unrelated changes does not resend an already pending email or a blank password', async () => {
  const { user, save, calls } = setup();
  user.new_email = 'pending@example.com';
  const result = await save();
  assert.equal(result.emailPending, true);
  assert.equal('email' in calls[0][1], false);
  assert.equal('password' in calls[0][1], false);
});

test('all profile validation runs before file upload or Auth writes', async () => {
  const { user, save, calls } = setup();
  const form = profileFromUser(user);
  const cases = [
    [{ ...form, fullName: ' ' }, '', '', null],
    [{ ...form, email: 'invalid' }, '', '', null],
    [form, 'short', 'short', null],
    [form, 'valid-password', 'different-password', null],
    [form, '', '', { type: 'image/svg+xml', size: 10 }],
    [form, '', '', { type: 'image/png', size: 0 }],
    [form, '', '', { type: 'image/png', size: 5 * 1024 * 1024 + 1 }],
  ];
  for (const args of cases) await assert.rejects(save(...args));
  assert.deepEqual(calls, []);
});

test('an account mismatch blocks profile writes', async () => {
  const { client, calls, save } = setup();
  client.auth.getSession = async () => ({ data: { session: { user: { id: 'someone-else' } } }, error: null });
  await assert.rejects(save(), /account changed/);
  assert.deepEqual(calls, []);
});

test('avatar paths use the account prefix and verified MIME extension', async () => {
  const { user, calls, save } = setup();
  const avatar = { name: '../../misleading.html', type: 'image/png', size: 100 };
  const result = await save(profileFromUser(user), '', '', avatar);
  assert.equal(calls[0][0], 'upload');
  assert.match(calls[0][1], /^customer-[\da-f-]+\.png$/);
  assert.equal(calls[1][0], 'update');
  assert.equal(result.user.user_metadata.avatar_url, `https://example.invalid/${calls[0][1]}`);
});

test('a rejected Auth update cleans only the new upload after verifying it is not referenced', async () => {
  const { client, user, save, calls } = setup();
  client.auth.updateUser = async () => ({ error: new Error('provider rejected update') });
  await assert.rejects(save(profileFromUser(user), '', '', { type: 'image/webp', size: 10 }), error => {
    assert.match(error.message, /Could not confirm/);
    assert.equal(error.currentUser, user);
    return true;
  });
  assert.equal(calls.at(-1)[0], 'remove');
  assert.deepEqual(calls.at(-1)[1], [calls[0][1]]);
});

test('an uncertain update never deletes an avatar that the server already saved', async () => {
  const { client, user, save, calls } = setup();
  let updated;
  client.auth.updateUser = async attributes => {
    updated = { ...user, user_metadata: attributes.data };
    throw new Error('lost response');
  };
  client.auth.getUser = async () => ({ data: { user: updated }, error: null });
  await assert.rejects(save(profileFromUser(user), '', '', { type: 'image/jpeg', size: 10 }), /Could not confirm/);
  assert.equal(calls.some(call => call[0] === 'remove'), false);
});

test('an unverified saved state cannot trigger upload cleanup or a success result', async () => {
  const { client, user, save, calls } = setup();
  client.auth.updateUser = async () => ({ error: new Error('offline') });
  client.auth.getUser = async () => { throw new Error('still offline'); };
  await assert.rejects(save(profileFromUser(user), '', '', { type: 'image/png', size: 10 }), /Could not confirm/);
  assert.equal(calls.some(call => call[0] === 'remove'), false);
});

test('session changes during avatar upload cannot update a different account', async () => {
  const { client, storage, user, save, calls } = setup();
  storage.upload = async () => {
    client.auth.getSession = async () => ({ data: { session: { user: { id: 'other-user' } } }, error: null });
    return { error: null };
  };
  await assert.rejects(save(profileFromUser(user), '', '', { type: 'image/png', size: 10 }), /Could not confirm/);
  assert.equal(calls.some(call => call[0] === 'update'), false);
});

test('the separate review record overrides legacy fields for both PostgREST relationship shapes', () => {
  const order = { id: 'order', rating: null, review_comment: null };
  const review = { rating: 5, review_comment: 'Saved review', admin_reply: 'Thanks' };
  assert.equal(mergeOrderReview({ ...order, order_reviews: review }).rating, 5);
  assert.equal(mergeOrderReview({ ...order, order_reviews: [review] }).review_comment, 'Saved review');
  assert.equal(mergeOrderReview(order), order);
});

test('reorder preserves quantities but uses current catalog prices', () => {
  const products = [{ id: 'P1', type: 'readyuse', price: 20, stock: 10 }];
  assert.deepEqual(prepareReorder([{ id: 'P1', qty: 2, price: 1 }], products), [{ ...products[0], selectedSize: undefined, qty: 2 }]);
});

test('reorder refuses unavailable, custom, invalid quantity and insufficient stock before any cart mutation', () => {
  const products = [{ id: 'P1', type: 'readyuse', price: 20, stock: 2 }, { id: 'P2', type: 'custom', price: 10 }];
  for (const items of [[{ id: 'missing', qty: 1 }], [{ id: 'P2', qty: 1 }], [{ id: 'P1', qty: 0 }], [{ id: 'P1', qty: 1.5 }], [{ id: 'P1', qty: 3 }]]) {
    assert.throws(() => prepareReorder(items, products));
  }
  assert.throws(() => prepareReorder([{ id: 'P1', qty: 2 }], products, [{ id: 'P1', qty: 1 }]));
  assert.throws(() => prepareReorder([{ id: 'P1', qty: 1, selectedSize: 'S' }, { id: 'P1', qty: 2, selectedSize: 'M' }], products));
  assert.throws(() => prepareReorder([{ id: 'P1', qty: 1 }], [{ ...products[0], stock: 0 }]));
});

test('confirmed deletion signs out only afterward, with separate handling for session cleanup failure', async () => {
  const { client, calls } = setup();
  assert.deepEqual(await deleteCustomerAccount(client, 'customer'), { signedOut: true });
  assert.deepEqual(calls, [['invoke', 'delete-account', { body: { confirmation: 'DELETE', userId: 'customer' } }], ['signOut', { scope: 'local' }]]);
  client.auth.signOut = async () => ({ error: new Error('offline') });
  assert.deepEqual(await deleteCustomerAccount(client, 'customer'), { signedOut: false });
});

test('failed deletion does not sign out or announce success and preserves safe server guidance', async () => {
  const { client, calls } = setup();
  client.functions.invoke = async () => ({ data: null, error: { context: { json: async () => ({ error: 'Account deletion could not be confirmed.' }) } } });
  await assert.rejects(deleteCustomerAccount(client, 'customer'), /could not be confirmed/);
  assert.deepEqual(calls, []);
});

test('account switches cannot delete or sign out the newly selected account', async () => {
  const { client, calls } = setup();
  await assert.rejects(deleteCustomerAccount(client, 'different-user'), /account changed/);
  assert.deepEqual(calls, []);
  client.functions.invoke = async () => {
    client.auth.getSession = async () => ({ data: { session: { user: { id: 'new-customer' } } }, error: null });
    return { data: { success: true }, error: null };
  };
  assert.deepEqual(await deleteCustomerAccount(client, 'customer'), { signedOut: false, accountChanged: true });
  assert.deepEqual(calls, []);
});
