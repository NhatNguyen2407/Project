import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getInquiryQuantities } from '../src/app/utils/inquiryQuantities.js';
import { createSubmitInquiryHandler } from '../supabase/functions/submit-inquiry/handler.js';
import { validateInquiry } from '../supabase/functions/submit-inquiry/validation.js';

const fixture = {
  submissionId: '00000000-0000-4000-8000-000000000001', token: 'fixture-token', termsAccepted: true,
  subject: 'Fixture quote', customerName: 'Fixture customer', customerEmail: 'fixture@example.invalid',
  contactInfo: 'Fixture contact', productName: 'Fixture plushie', productType: 'custom', size: '10',
  quantity: '1', accessoryQty: '0', imageLink: 'https://res.cloudinary.com/fixture/image/upload/design.png', note: '',
};

async function loadApi(supabase, fetcher) {
  const source = (await readFile(new URL('../src/app/service/api.js', import.meta.url), 'utf8'))
    .replace(/^import .*;\n/gm, '').replace('export const api', 'const api');
  return new Function('supabase', 'getInquiryQuantities', 'fetch', 'console', `${source}\nreturn api;`)(supabase, getInquiryQuantities, fetcher, { error() {} });
}

test('Inquiry submission reaches the trusted endpoint and never inserts directly from the browser', async () => {
  const calls = [];
  const api = await loadApi({
    auth: { getUser: async () => ({ data: { user: null } }) },
    from() { throw new Error('Direct Inquiry inserts bypass the trusted endpoint'); },
    functions: { invoke: async (name, args) => { calls.push({ name, body: args.body }); return { data: { success: true, id: fixture.submissionId }, error: null }; } },
  }, async (url, options) => { calls.push({ backup: JSON.parse(options.body) }); return { ok: true }; });
  assert.equal(await api.submitInquiry(fixture), true);
  assert.equal(calls[0].name, 'submit-inquiry');
  assert.equal(calls[0].body.quantity, 1);
  assert.equal(calls[0].body.accessoryQty, 0);
  assert.equal(calls[0].body.token, fixture.token);
  assert.equal(calls[1].backup.token, undefined);
  assert.equal(calls[1].backup.submissionId, undefined);
});

const proof = { success: true, action: 'inquiry_submit', score: 0.9, hostname: 'dioxyzinefrog.vercel.app' };
const userId = '00000000-0000-4000-8000-000000000099';
function server(overrides = {}) {
  const calls = [];
  const env = { SUPABASE_URL: 'https://fixture.supabase.co', SUPABASE_ANON_KEY: 'guest-key',
    SUPABASE_SERVICE_ROLE_KEY: 'service-key', RECAPTCHA_SECRET_KEY: 'fixture-secret', ...overrides.env };
  const createClient = (url, key, options) => {
    assert.equal(typeof options.global.fetch, 'function');
    return key === 'service-key' ? { rpc: async (name, args) => {
      calls.push({ name, args }); return overrides.saved || { data: fixture.submissionId, error: null };
    } } : { auth: { getUser: async token => {
      calls.push({ authToken: token }); return overrides.auth || { data: { user: { id: userId } }, error: null };
    } } };
  };
  const handler = createSubmitInquiryHandler(createClient, name => env[name], async (url, options) => {
    calls.push({ google: url, parameters: new URLSearchParams(options.body), signal: options.signal });
    if (overrides.networkError) throw new Error('Fixture network failure');
    return new Response(JSON.stringify(overrides.proof || proof), { status: overrides.googleStatus || 200 });
  });
  return { calls, handler };
}
const request = (body = fixture, authorization = 'Bearer guest-key') => new Request('https://fixture.invalid/submit-inquiry', {
  method: 'POST', headers: { 'content-type': 'application/json', ...(authorization && { authorization }) }, body: JSON.stringify(body),
});

test('backend validates required fields, exact counts, terms and uploaded image URLs before any external call', async () => {
  const { handler, calls } = server();
  for (const change of [{ quantity: 0 }, { quantity: 1.5 }, { accessoryQty: -1 }, { termsAccepted: false },
    { token: '' }, { customerEmail: 'invalid' }, { subject: '' }, { customerName: 'x'.repeat(121) },
    { note: 'invalid\0note' }, { imageLink: 'javascript:alert(1)' }, { imageLink: 'https://evil.invalid/design.png' },
    { user_id: userId }, { status: 'Completed' }, { submissionId: 'invalid' }]) {
    assert.equal((await handler(request({ ...fixture, ...change }))).status, 400, JSON.stringify(change));
  }
  assert.equal(calls.length, 0);
  const result = validateInquiry({ ...fixture, customerEmail: ' FIXTURE@EXAMPLE.INVALID ', note: '  ' });
  assert.equal(result.row.customer_email, 'fixture@example.invalid');
  assert.equal(result.row.note, null);
  assert.equal(result.row.accessory_qty, 0);
  assert.equal(validateInquiry({ ...fixture, submissionId: 'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA' }).submissionId, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
});

test('only a valid inquiry CAPTCHA from the allowed host with an acceptable numeric score can save', async () => {
  for (const change of [{ success: false }, { action: 'register' }, { score: 0.49 }, { score: null },
    { score: '0.9' }, { score: 2 }, { hostname: 'evil.invalid' }, { hostname: undefined }]) {
    const { handler, calls } = server({ proof: { ...proof, ...change } });
    assert.equal((await handler(request())).status, 400);
    assert.equal(calls.some(call => call.name), false);
  }
  const { handler, calls } = server({ proof: { ...proof, score: 0.5 } });
  const response = await handler(request());
  assert.deepEqual(await response.json(), { success: true, id: fixture.submissionId });
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(calls[0].parameters.get('response'), fixture.token);
  assert.equal(calls[0].signal instanceof AbortSignal, true);
  assert.equal(calls[1].name, 'save_verified_inquiry');
  assert.equal(calls[1].args.p_user_id, null);
  assert.equal(calls[1].args.p_payload.user_id, undefined);
  assert.equal(calls[1].args.p_payload.token, undefined);
});

test('signed-in ownership comes from getUser, while invalid or expired credentials cannot become guest submissions', async () => {
  const { handler, calls } = server();
  assert.equal((await handler(request(fixture, 'Bearer signed-user'))).status, 200);
  assert.equal(calls[0].authToken, 'signed-user');
  assert.equal(calls.at(-1).args.p_user_id, userId);
  for (const authorization of [null, 'Basic guest-key']) {
    const rejected = server();
    assert.equal((await rejected.handler(request(fixture, authorization))).status, 401);
    assert.equal(rejected.calls.length, 0);
  }
  const denied = server({ auth: { data: { user: null }, error: { message: 'Expired' } } });
  assert.equal((await denied.handler(request(fixture, 'Bearer expired'))).status, 401);
  assert.equal(denied.calls.some(call => call.google || call.name), false);
});

test('gateway-verified legacy anon JWTs do not depend on byte equality with the runtime anon key', async () => {
  const encoded = Buffer.from(JSON.stringify({ role: 'anon', iss: 'supabase' })).toString('base64url');
  const { handler, calls } = server();
  assert.equal((await handler(request(fixture, `Bearer header.${encoded}.gateway-verified-fixture`))).status, 200);
  assert.equal(calls.some(call => call.authToken), false);
  assert.equal(calls.at(-1).args.p_user_id, null);
  const config = await readFile(new URL('../supabase/config.toml', import.meta.url), 'utf8');
  assert.match(config, /\[functions\.submit-inquiry\]\s+enabled = true\s+verify_jwt = true/);
});

test('provider/configuration failures never save, and database uncertainty never reports success', async t => {
  t.mock.method(console, 'error', () => {});
  for (const overrides of [{ networkError: true }, { googleStatus: 503 }, { env: { RECAPTCHA_SECRET_KEY: '' } }]) {
    const { handler, calls } = server(overrides);
    assert.equal((await handler(request())).status, 503);
    assert.equal(calls.some(call => call.name), false);
  }
  for (const saved of [{ data: null, error: null }, { data: 'wrong-id', error: null },
    { data: userId, error: null }, { data: null, error: { code: '42501' } }]) {
    const response = await server({ saved }).handler(request());
    assert.equal(response.status, 503);
    assert.equal((await response.json()).success, false);
  }
});

test('rate limits and conflicting retry IDs have explicit responses', async () => {
  const limited = await server({ saved: { data: null, error: { code: 'P0001', message: 'inquiry_rate_limited' } } }).handler(request());
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get('retry-after'), '900');
  assert.equal((await server({ saved: { data: null, error: { code: '23505' } } }).handler(request())).status, 409);
});

test('method, malformed JSON, unsupported media type and oversized bodies stop before any external call', async () => {
  const { handler, calls } = server();
  assert.equal((await handler(new Request('https://fixture.invalid', { method: 'OPTIONS' }))).status, 200);
  assert.equal((await handler(new Request('https://fixture.invalid'))).status, 405);
  assert.equal((await handler(new Request('https://fixture.invalid', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' }))).status, 400);
  assert.equal((await handler(new Request('https://fixture.invalid', { method: 'POST', body: '{}' }))).status, 415);
  assert.equal((await handler(request({ ...fixture, note: 'x'.repeat(33000) }))).status, 413);
  assert.equal(calls.length, 0);
});

test('frontend never mirrors a rejected/unconfirmed inquiry and surfaces the endpoint error without sending CAPTCHA to Sheets', async () => {
  for (const result of [
    { data: { success: false }, error: null }, { data: { success: true, id: userId }, error: null },
    { data: null, error: { context: new Response(JSON.stringify({ message: 'Too many inquiries.' }), { status: 429 }) } },
  ]) {
    let mirrored = false;
    const api = await loadApi({ functions: { invoke: async () => result } }, async () => { mirrored = true; });
    await assert.rejects(api.submitInquiry(fixture), result.error ? /Too many inquiries/ : /Save could not be confirmed/);
    assert.equal(mirrored, false);
  }
  let called = false;
  const api = await loadApi({ functions: { invoke: async () => { called = true; } } }, async () => {});
  await assert.rejects(api.submitInquiry({ ...fixture, quantity: 0 }), /Quantity/);
  await assert.rejects(api.submitInquiry({ ...fixture, token: '' }), /security verification/);
  assert.equal(called, false);
});

test('the actual form handler retains its submission ID after failure and uses a fresh CAPTCHA on retry', async () => {
  const source = await readFile(new URL('../src/app/pages/InquiryPage.jsx', import.meta.url), 'utf8');
  const start = source.indexOf('  const handleSubmit =');
  const body = source.slice(start, source.indexOf('\n  return (', start));
  const submissions = [], resets = [];
  const submissionRef = { current: null };
  let tokenCounter = 0;
  const scope = {
    status: 'idle', isUploading: false, quantityError: null, formData: fixture, acceptedTerms: true,
    executeRecaptcha: async () => `token-${++tokenCounter}`, currentProduct: { name: fixture.productName },
    quantities: { quantity: 1, accessoryQty: 0 }, submissionRef, crypto, user: null,
    setStatus() {}, showToast() {}, setAcceptedTerms() {}, setFormData(value) { resets.push(value); },
    api: { submitInquiry: async payload => { submissions.push(payload); if (submissions.length === 1) throw new Error('Fixture timeout'); } },
    console: { error() {} },
  };
  const submit = new Function(...Object.keys(scope), `${body}\nreturn handleSubmit;`)(...Object.values(scope));
  await submit({ preventDefault() {} });
  assert.equal(resets.length, 0);
  assert.ok(submissionRef.current.id);
  await submit({ preventDefault() {} });
  assert.equal(submissions[0].submissionId, submissions[1].submissionId);
  assert.notEqual(submissions[0].token, submissions[1].token);
  assert.equal(submissionRef.current, null);
  assert.equal(resets.length, 1);
});
