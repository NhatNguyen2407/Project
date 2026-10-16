// Deno runtime smoke test for the real HTTP transport and pinned supabase-js client.
// All responses are synthetic. The test has no Production URL or credentials.
// Requires only localhost network access; see .github/workflows/dioxyzine-inquiry-deno.yml.
import { createClient } from 'npm:@supabase/supabase-js@2.110.0';
import { corsHeaders } from 'npm:@supabase/supabase-js@2.110.0/cors';
import { createInquiryHandler } from '../supabase/functions/submit-inquiry/handler.mjs';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
function same(actual, expected, label) {
  assert(actual === expected, `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

const publicKey = 'sb_publishable_synthetic_test_only';
const browserOrigin = 'https://shop.test.example';
const challengeToken = 'synthetic-captcha-token-' + 'a'.repeat(50);
const payload = {
  idempotencyKey: 'a1c4ea20-04df-4d31-9552-6c1aeb83a07b',
  token: challengeToken,
  inquiry: {
    subject: 'Synthetic inquiry',
    customerName: 'Synthetic Person',
    customerEmail: 'sample@example.invalid',
    contactInfo: 'test-contact',
    productName: 'Toy sample',
    quantity: '2',
    accessoryQty: '0',
    imageLink: 'https://example.invalid/reference.png',
    size: '10 cm',
    note: 'Only synthetic testing',
  },
};

function makeFixture(opts = {}) {
  const calls = [];
  const logger = { error: (message) => calls.push(['error', String(message)]) };
  const backend = {
    rpc: async (name, args) => {
      calls.push(['rpc', name]);
      if (name === 'consume_inquiry_rate_budget') {
        return { data: true, error: null };
      }
      if (name === 'create_inquiry_idempotent') {
        calls.push(['write', args.p_row.customer_email, args.p_user_id]);
        return { data: { inquiryId: 'synthetic-id-001', replayed: Boolean(opts.replayed) }, error: null };
      }
      return { data: null, error: { code: 'UNKNOWN_RPC' } };
    },
    auth: {
      getUser: async (token) => {
        calls.push(['getUser', token]);
        if (token === 'synthetic-verified-jwt') {
          return { data: { user: { id: 'synthetic-user-id' } }, error: null };
        }
        return { data: { user: null }, error: new Error('Invalid user token') };
      },
    },
  };
  const env = {
    INQUIRY_ALLOWED_ORIGINS: browserOrigin,
    INQUIRY_ALLOWED_HOSTNAMES: 'shop.test.example',
    INQUIRY_RECAPTCHA_MIN_SCORE: '0.5',
    INQUIRY_PUBLIC_API_KEY: publicKey,
    RECAPTCHA_SECRET_KEY: 'synthetic-secret',
    SUPABASE_SERVICE_ROLE_KEY: 'synthetic-server-only',
    SUPABASE_URL: 'https://synthetic-db.invalid',
  };
  const handler = createInquiryHandler({
    envGet: (name) => env[name],
    createClient: () => backend,
    fetchCaptcha: async (url, options) => {
      calls.push(['captcha', url]);
      assert(url === 'https://www.google.com/recaptcha/api/siteverify',
        'unexpected CAPTCHA endpoint');
      assert(new URLSearchParams(options.body).get('response') === challengeToken,
        'unexpected CAPTCHA request body');
      return {
        ok: true,
        json: async () => ({
          success: !opts.invalidCaptcha,
          score: 0.95,
          hostname: 'shop.test.example',
          action: 'inquiry_submit',
          challenge_ts: new Date().toISOString(),
        }),
      };
    },
    allowedCorsHeaders: corsHeaders['Access-Control-Allow-Headers'],
    logger,
  });
  return { handler, calls };
}

async function withServer(fixture, action) {
  const server = Deno.serve({
    hostname: '127.0.0.1',
    port: 0,
    onListen: () => {},
  }, fixture.handler);
  try {
    const url = `http://127.0.0.1:${server.addr.port}`;
    await action(url);
  } finally {
    await server.shutdown();
  }
}

Deno.test('Deno HTTP + pinned Supabase JS: guest functions.invoke writes one synthetic record', async () => {
  const fixture = makeFixture();
  await withServer(fixture, async (base) => {
    const sdk = createClient(base, publicKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await sdk.functions.invoke('submit-inquiry', {
      body: payload,
      headers: { Origin: browserOrigin },
    });
    assert(!error, `Unexpected functions.invoke error: ${error?.message}`);
    same(data?.success, true, 'result.success');
    same(data?.inquiryId, 'synthetic-id-001', 'inquiryId');
    same(data?.replayed, false, 'result.replayed');
    same(fixture.calls.filter(x => x[0] === 'write').length, 1, 'database write count');
    same(fixture.calls.filter(x => x[0] === 'captcha').length, 1, 'CAPTCHA count');
  });
});

Deno.test('Deno HTTP CORS: correct preflight; unexpected headers and other origins denied', async () => {
  const fixture = makeFixture();
  await withServer(fixture, async (base) => {
    const correct = await fetch(base + '/functions/v1/submit-inquiry', {
      method: 'OPTIONS',
      headers: {
        Origin: browserOrigin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization, apikey, x-client-info, content-type',
      },
    });
    same(correct.status, 204, 'valid preflight status');
    same(correct.headers.get('access-control-allow-origin'), browserOrigin, 'allowed origin');
    assert(correct.headers.get('access-control-allow-headers')?.includes('apikey'), 'apikey header not allowed');

    const unexpected = await fetch(base + '/functions/v1/submit-inquiry', {
      method: 'OPTIONS',
      headers: {
        Origin: browserOrigin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'x-private-admin',
      },
    });
    same(unexpected.status, 403, 'unexpected header status');
    same(unexpected.headers.get('access-control-allow-origin'), null, 'denied CORS origin');

    const wrongOrigin = await fetch(base + '/functions/v1/submit-inquiry', {
      method: 'OPTIONS',
      headers: { Origin: 'https://evil.example', 'Access-Control-Request-Method': 'POST' },
    });
    same(wrongOrigin.status, 403, 'unapproved origin status');
    same(wrongOrigin.headers.get('access-control-allow-origin'), null, 'no CORS header on denied origin');
  });
  same(fixture.calls.length, 0, 'no database or CAPTCHA calls for CORS preflight');
});

Deno.test('Deno HTTP: reject bad apikey, enforce verified signed-in JWT, reject invalid JWT', async () => {
  const fixture = makeFixture();
  await withServer(fixture, async (base) => {
    const url = base + '/functions/v1/submit-inquiry';
    const baseHeaders = {
      Origin: browserOrigin,
      'Content-Type': 'application/json',
    };
    const invalidKey = await fetch(url, {
      method: 'POST',
      headers: { ...baseHeaders, apikey: 'wrong-public-key', Authorization: 'Bearer synthetic-verified-jwt' },
      body: JSON.stringify(payload),
    });
    same(invalidKey.status, 401, 'invalid apikey status');
    same(fixture.calls.length, 0, 'invalid apikey external calls');

    const validAuth = await fetch(url, {
      method: 'POST',
      headers: { ...baseHeaders, apikey: publicKey, Authorization: 'Bearer synthetic-verified-jwt' },
      body: JSON.stringify(payload),
    });
    same(validAuth.status, 201, 'verified Auth HTTP status');
    assert(fixture.calls.some(c => c[0] === 'getUser' && c[1] === 'synthetic-verified-jwt'),
      'Auth.getUser not invoked');
    assert(fixture.calls.some(c => c[0] === 'write' && c[2] === 'synthetic-user-id'),
      'Verified user ID not used');

    const countBefore = fixture.calls.filter(c => c[0] === 'write').length;
    const invalidAuth = await fetch(url, {
      method: 'POST',
      headers: { ...baseHeaders, apikey: publicKey, Authorization: 'Bearer synthetic-expired-jwt' },
      body: JSON.stringify(payload),
    });
    same(invalidAuth.status, 401, 'invalid bearer status');
    same(fixture.calls.filter(c => c[0] === 'write').length, countBefore,
      'invalid JWT must not write');
  });
});

Deno.test('Deno HTTP: bad CAPTCHA and replay return the expected non-success/success statuses', async () => {
  const denied = makeFixture({ invalidCaptcha: true });
  await withServer(denied, async (base) => {
    const r = await fetch(base + '/functions/v1/submit-inquiry', {
      method: 'POST',
      headers: { Origin: browserOrigin, apikey: publicKey, 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    same(r.status, 403, 'bad CAPTCHA HTTP status');
    same(denied.calls.filter(c => c[0] === 'write').length, 0,
      'bad CAPTCHA must not persist');
  });

  const replay = makeFixture({ replayed: true });
  await withServer(replay, async (base) => {
    const sdk = createClient(base, publicKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await sdk.functions.invoke('submit-inquiry', {
      body: payload,
      headers: { Origin: browserOrigin },
    });
    assert(!error, `Unexpected SDK replay error: ${error?.message}`);
    same(data?.replayed, true, 'replayed state');
    same(data?.inquiryId, 'synthetic-id-001', 'replayed ID');
  });
});
