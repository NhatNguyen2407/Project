import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { allowedOrigin, validCaptcha, validateInquiry } from '../_shared/inquiryValidation.mjs';

const LIMIT_BYTES = 12_000;
const jsonHeaders = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const corsBase = {
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
};

function response(status: number, body: Record<string, unknown>, origin: string | null) {
  const headers = new Headers({ ...corsBase, ...jsonHeaders });
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  return new Response(JSON.stringify(body), { status, headers });
}

async function readSmallJson(request: Request): Promise<any> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Empty body');
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > LIMIT_BYTES) throw new Error('Request too large');
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let cursor = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, cursor);
    cursor += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');
  const origins = (Deno.env.get('INQUIRY_ALLOWED_ORIGINS') || '')
    .split(',').map(s => s.trim()).filter(Boolean);
  const captchaHosts = (Deno.env.get('INQUIRY_CAPTCHA_HOSTNAMES') || '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const captchaSecret = Deno.env.get('RECAPTCHA_SECRET_KEY');
  const rateSalt = Deno.env.get('INQUIRY_RATE_SALT');
  const trustedIpHeader = Deno.env.get('INQUIRY_TRUSTED_IP_HEADER');
  const dbUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

  // Fail closed if the deployment is incomplete, regardless of HTTP method.
  if (!origins.length || !captchaHosts.length || !captchaSecret || !rateSalt ||
      !trustedIpHeader || !dbUrl || !serviceKey || !anonKey) {
    return response(503, { success: false, message: 'Inquiry service is not configured.' }, null);
  }
  if (!origin || !allowedOrigin(origin, origins)) {
    return response(403, { success: false, message: 'Origin not allowed.' }, null);
  }
  if (request.method === 'OPTIONS') return new Response('ok', {
    status: 200, headers: { ...corsBase, 'Access-Control-Allow-Origin': origin }
  });
  if (request.method !== 'POST') return response(405, { success: false }, origin);

  try {
    const body = await readSmallJson(request);
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    if (token.length < 20 || token.length > 4096) {
      return response(400, { success: false, message: 'Security token required.' }, origin);
    }
    let inquiry;
    try { inquiry = validateInquiry(body?.inquiry); } catch {
      return response(400, { success: false, message: 'Invalid inquiry details.' }, origin);
    }

    // The configured header MUST be injected/overwritten by a trusted gateway.
    // Do not enable the endpoint until this is verified in staging.
    const clientIp = request.headers.get(trustedIpHeader)?.trim();
    if (!clientIp || clientIp.length > 128 || clientIp.includes(',')) {
      return response(503, { success: false, message: 'Request verification unavailable.' }, origin);
    }

    const admin = createClient(dbUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const rateKey = await sha256(`${rateSalt}:${clientIp}`);
    const { data: permitted, error: quotaError } = await admin.rpc('consume_inquiry_quota', {
      p_key_hash: rateKey
    });
    if (quotaError || typeof permitted !== 'boolean') {
      // Database migration is intentionally required before activation.
      return response(503, { success: false, message: 'Submission temporarily unavailable.' }, origin);
    }
    if (!permitted) return response(429, { success: false, message: 'Please wait before submitting again.' }, origin);

    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: captchaSecret, response: token }).toString(),
      signal: AbortSignal.timeout(6000),
    });
    if (!verifyRes.ok) return response(503, { success: false, message: 'Security verification unavailable.' }, origin);
    const verified = await verifyRes.json();
    if (!validCaptcha(verified, captchaHosts)) {
      return response(403, { success: false, message: 'Security verification failed.' }, origin);
    }

    // Link a user only when Supabase Auth verifies their actual access token.
    // The browser-supplied user_id is never trusted.
    let userId = null;
    const auth = request.headers.get('authorization');
    if (auth?.startsWith('Bearer ')) {
      const userClient = createClient(dbUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      const { data: { user }, error: authError } = await userClient.auth.getUser(auth.substring(7));
      if (!authError && user) userId = user.id;
    }
    const { error: insertError } = await admin.from('inquiries').insert({
      ...inquiry,
      user_id: userId,
    });
    if (insertError) {
      // Avoid writing customer data, tokens or payment details to logs.
      console.error('Trusted inquiry write failed:', insertError.code || 'unknown');
      return response(503, { success: false, message: 'Could not save inquiry.' }, origin);
    }

    return response(200, { success: true }, origin);
  } catch (err) {
    console.error('Trusted inquiry failed:', err instanceof Error ? err.name : 'unknown');
    return response(503, { success: false, message: 'Please try again later.' }, origin);
  }
});
