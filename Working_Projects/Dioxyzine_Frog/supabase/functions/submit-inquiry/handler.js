import { isSubmissionId, validateInquiry } from './validation.js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json', 'Cache-Control': 'no-store',
};
const reply = (status, body, extra = {}) => new Response(JSON.stringify(body), { status, headers: { ...headers, ...extra } });

function isGuestToken(token, anonKey) {
  if (token === anonKey.trim()) return true;
  try {
    const claims = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    // verify_jwt=true validates the signature at the gateway. Anon claims never grant account ownership.
    return claims.role === 'anon' && !claims.sub;
  } catch { return false; }
}

async function readBody(req) {
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw Object.assign(new Error('Use a JSON inquiry request.'), { status: 415 });
  }
  const reader = req.body?.getReader();
  const chunks = [];
  let size = 0;
  if (reader) for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 32768) {
      await reader.cancel();
      throw Object.assign(new Error('Inquiry is too large.'), { status: 413 });
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new Error('Invalid inquiry JSON.'); }
}

export function createSubmitInquiryHandler(createClient, getEnv, fetcher = fetch) {
  const timedFetch = (url, options = {}) => fetcher(url, { ...options,
    signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000),
  });
  return async req => {
    if (req.method === 'OPTIONS') return reply(200, { success: true });
    if (req.method !== 'POST') return reply(405, { success: false, message: 'Use POST to submit an inquiry.' });
    let submission;
    try { submission = validateInquiry(await readBody(req)); }
    catch (error) { return reply(error.status || 400, { success: false, message: error.message }); }
    const { submissionId, token, row } = submission;
    try {
      const url = getEnv('SUPABASE_URL');
      const anonKey = getEnv('SUPABASE_ANON_KEY');
      const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
      const secret = getEnv('RECAPTCHA_SECRET_KEY')?.trim();
      if (!url || !anonKey || !serviceKey || !secret) {
        console.error('submit-inquiry missing_config');
        return reply(503, { success: false, message: 'Inquiry service is not configured. Please contact us.' });
      }
      const bearer = req.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
      if (!bearer) return reply(401, { success: false, message: 'Please reload or sign in again.' });
      const options = { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: timedFetch } };
      let userId = null;
      if (!isGuestToken(bearer, anonKey)) {
        const caller = createClient(url, anonKey, options);
        const { data, error } = await caller.auth.getUser(bearer);
        if (error || !data?.user?.id) return reply(401, { success: false, message: 'Please sign in again.' });
        userId = data.user.id;
      }
      const verification = await timedFetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: token }).toString(),
      });
      if (!verification.ok) return reply(503, { success: false, message: 'Security verification is unavailable. Please try again.' });
      const proof = await verification.json();
      const hosts = (getEnv('RECAPTCHA_ALLOWED_HOSTNAMES') || 'dioxyzinefrog.vercel.app').split(',').map(host => host.trim().toLowerCase());
      if (proof.success !== true || proof.action !== 'inquiry_submit' || !Number.isFinite(proof.score) || proof.score < 0.5 || proof.score > 1 || !hosts.includes(proof.hostname?.toLowerCase())) {
        return reply(400, { success: false, message: 'Security verification failed. Please try again.' });
      }
      // Only this verified endpoint supplies ownership and the whitelisted customer fields.
      const admin = createClient(url, serviceKey, options);
      const { data: id, error } = await admin.rpc('save_verified_inquiry', {
        p_submission_id: submissionId, p_user_id: userId, p_payload: row,
      });
      if (error?.code === 'P0001' && error.message === 'inquiry_rate_limited') {
        return reply(429, { success: false, message: 'Too many inquiries. Please try again in 15 minutes.' }, { 'Retry-After': '900' });
      }
      if (error?.code === '23505') return reply(409, { success: false, message: 'This submission changed. Reload before sending again.' });
      if (error || !isSubmissionId(id) || id !== submissionId) {
        console.error('submit-inquiry save_unconfirmed', { submissionId, code: error?.code || 'invalid-result' });
        return reply(503, { success: false, message: 'Save could not be confirmed. Please retry.' });
      }
      return reply(200, { success: true, id });
    } catch (error) {
      console.error('submit-inquiry request_failed', { submissionId, name: error?.name });
      return reply(503, { success: false, message: 'Save could not be confirmed. Please retry.' });
    }
  };
}
