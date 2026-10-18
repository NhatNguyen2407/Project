import test from 'node:test';
import assert from 'node:assert/strict';
import { createInquiryHandler } from '../supabase/functions/submit-inquiry/handler.mjs';

const origin = 'https://shop.test.example';
const now = Date.parse('2026-10-16T03:00:00Z');
const key = 'e682fa00-61aa-4c7b-a8cf-01465f0fd8f7';
const inquiry = Object.freeze({
  subject: 'Synthetic order request',
  customerName: 'Test Customer',
  customerEmail: 'synthetic@example.invalid',
  contactInfo: 'Test channel',
  productName: 'Sample Plush',
  quantity: '50',
  accessoryQty: '0',
  imageLink: 'https://example.com/synthetic.png',
});
const env = Object.freeze({
  INQUIRY_ALLOWED_ORIGINS: origin,
  INQUIRY_ALLOWED_HOSTNAMES: 'shop.test.example',
  RECAPTCHA_SECRET_KEY: 'test-only-secret',
  SUPABASE_SERVICE_ROLE_KEY: 'test-only-server-key',
  INQUIRY_PUBLIC_API_KEY: 'test-only-public-key',
  SUPABASE_URL: 'https://synthetic.invalid',
});

function makeRequest(token, draft = inquiry, bearer = null) {
  return new Request('https://synthetic.invalid/functions/v1/submit-inquiry', {
    method: 'POST',
    headers: {
      origin,
      'content-type': 'application/json',
      apikey: env.INQUIRY_PUBLIC_API_KEY,
      ...(bearer ? { authorization: 'Bearer ' + bearer } : {}),
    },
    body: JSON.stringify({ token, inquiry: draft, idempotencyKey: key }),
  });
}

function createFixture() {
  const saved = new Map();
  const captchaTokens = new Set();
  const events = [];
  let failNextPersist = false;
  const client = {
    rpc: async (name, args) => {
      if (name === 'consume_inquiry_rate_budget') {
        events.push(args.p_scope);
        return { data: true, error: null };
      }
      assert.equal(name, 'create_inquiry_idempotent');
      events.push('persist');
      if (failNextPersist) {
        failNextPersist = false;
        return { data: null, error: { code: 'TEST_DB_UNAVAILABLE' } };
      }
      const previous = saved.get(args.p_key);
      if (previous) {
        if (previous.hash !== args.p_hash) {
          return { data: null, error: { code: '23505' } };
        }
        return { data: { inquiryId: previous.id, replayed: true }, error: null };
      }
      const id = '00000000-0000-4000-8000-000000000001';
      saved.set(args.p_key, { id, hash: args.p_hash, userId: args.p_user_id, row: args.p_row });
      return { data: { inquiryId: id, replayed: false }, error: null };
    },
    auth: {
      getUser: async (candidate) => {
        const identity = { 'verified-user-a': '00000000-0000-4000-8000-00000000000a',
          'verified-user-b': '00000000-0000-4000-8000-00000000000b' }[candidate];
        return identity
          ? { data: { user: { id: identity } }, error: null }
          : { data: { user: null }, error: new Error('Invalid user') };
      },
    },
  };
  const handler = createInquiryHandler({
    envGet: name => env[name],
    createClient: () => client,
    fetchCaptcha: async (_url, options) => {
      events.push('verify');
      const token = new URLSearchParams(options.body).get('response');
      if (captchaTokens.has(token)) {
        return { ok: true, json: async () => ({ success: false }) };
      }
      captchaTokens.add(token);
      return {
        ok: true,
        json: async () => ({
          success: true,
          action: 'inquiry_submit',
          hostname: 'shop.test.example',
          score: 0.9,
          challenge_ts: new Date(now - 30_000).toISOString(),
        }),
      };
    },
    clock: () => now,
    logger: { error: () => {} },
  });
  return {
    saved, events, handler,
    failOnce: () => { failNextPersist = true; },
  };
}

async function post(handler, token, draft = inquiry, bearer = null) {
  const response = await handler(makeRequest(token, draft, bearer));
  return { status: response.status, payload: await response.json() };
}

test('lost success response: retry with same key and fresh CAPTCHA returns same ID once', async () => {
  const f = createFixture();
  const first = await post(f.handler, 'captcha-first-' + 'x'.repeat(50));
  assert.equal(first.status, 201);
  // Simulate a client that never receives the first HTTP response.
  const second = await post(f.handler, 'captcha-second-' + 'x'.repeat(50));
  assert.equal(second.status, 200);
  assert.equal(second.payload.replayed, true);
  assert.equal(second.payload.inquiryId, first.payload.inquiryId);
  assert.equal(f.saved.size, 1);
  assert.equal(f.events.filter(x => x === 'persist').length, 2);
});

test('reusing an already verified CAPTCHA token fails closed and does not write twice', async () => {
  const f = createFixture();
  const token = 'one-use-captcha-' + 'x'.repeat(50);
  assert.equal((await post(f.handler, token)).status, 201);
  const retry = await post(f.handler, token);
  assert.equal(retry.status, 403);
  assert.equal(retry.payload.success, false);
  assert.equal(f.saved.size, 1);
  assert.equal(f.events.filter(x => x === 'persist').length, 1);
});

test('temporary persistence failure can be retried with a new CAPTCHA without duplicates', async () => {
  const f = createFixture();
  f.failOnce();
  const failed = await post(f.handler, 'failure-captcha-' + 'x'.repeat(50));
  assert.equal(failed.status, 503);
  assert.equal(f.saved.size, 0);
  const retry = await post(f.handler, 'retry-captcha-' + 'x'.repeat(50));
  assert.equal(retry.status, 201);
  assert.equal(retry.payload.replayed, false);
  assert.equal(f.saved.size, 1);
});

test('same idempotency key with changed validated payload cannot overwrite first inquiry', async () => {
  const f = createFixture();
  assert.equal((await post(f.handler, 'first-captcha-' + 'x'.repeat(50))).status, 201);
  const changed = await post(f.handler, 'changed-captcha-' + 'x'.repeat(50),
    { ...inquiry, quantity: '51' });
  assert.equal(changed.status, 409);
  assert.equal(changed.payload.success, false);
  assert.equal(f.saved.size, 1);
  assert.equal([...f.saved.values()][0].row.quantity, 50);
});

test('verified different users may not replay another user identity under same key', async () => {
  const f = createFixture();
  const first = await post(f.handler, 'first-user-captcha-' + 'x'.repeat(50),
    inquiry, 'verified-user-a');
  assert.equal(first.status, 201);
  const second = await post(f.handler, 'second-user-captcha-' + 'x'.repeat(50),
    inquiry, 'verified-user-b');
  assert.equal(second.status, 409);
  assert.equal(f.saved.size, 1);
  assert.equal([...f.saved.values()][0].userId, '00000000-0000-4000-8000-00000000000a');
});
