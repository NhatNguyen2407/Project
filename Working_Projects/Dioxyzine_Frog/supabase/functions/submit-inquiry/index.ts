import { createClient } from 'npm:@supabase/supabase-js@2.110.0';
import {
  validateInquiryPayload,
  assessRecaptcha,
  parseAllowedHostnames,
  isAllowedRequestOrigin,
  validateCaptchaToken,
  SubmissionValidationError,
} from './validation.mjs';

// Draft only. DO NOT deploy before the database direct INSERT grants/policy have
// been removed in a coordinated cutover and the whole flow passed staging tests.
const json = (body, status, origin) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
    ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
  },
});

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');
  const origins = Deno.env.get('INQUIRY_ALLOWED_ORIGINS') || '';
  // Origin restrictions reduce accidental browser access; they do not replace
  // CAPTCHA or an independent distributed rate limit for API clients.
  const allowed = isAllowedRequestOrigin(origin, origins);
  if (!allowed) return json({ success: false, message: 'Origin not permitted.' }, 403, null);
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
        'Access-Control-Max-Age': '600',
        'Vary': 'Origin',
      },
    });
  }
  if (request.method !== 'POST') {
    return json({ success: false, message: 'Method not allowed.' }, 405, origin);
  }
  const length = Number(request.headers.get('content-length') || '0');
  if (length > 16_384) return json({ success: false, message: 'Request too large.' }, 413, origin);

  const secret = Deno.env.get('RECAPTCHA_SECRET_KEY');
  const adminKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const url = Deno.env.get('SUPABASE_URL');
  const allowedHosts = parseAllowedHostnames(Deno.env.get('INQUIRY_ALLOWED_HOSTNAMES'));
  const minScore = Number(Deno.env.get('INQUIRY_RECAPTCHA_MIN_SCORE') || '0.5');
  if (!secret || !adminKey || !url || !allowedHosts.length ||
      !Number.isFinite(minScore) || minScore < 0 || minScore > 1) {
    console.error('Inquiry endpoint security configuration incomplete');
    return json({ success: false, message: 'Service temporarily unavailable.' }, 503, origin);
  }

  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 16_384) {
      return json({ success: false, message: 'Request too large.' }, 413, origin);
    }
    const body = JSON.parse(raw);
    if (!validateCaptchaToken(body?.token)) {
      return json({ success: false, message: 'Verification required.' }, 400, origin);
    }
    const row = validateInquiryPayload(body?.inquiry);
    const verifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: body.token }).toString(),
      signal: AbortSignal.timeout(8_000),
    });
    if (!verifyResponse.ok) {
      return json({ success: false, message: 'Verification unavailable.' }, 503, origin);
    }
    const captcha = await verifyResponse.json();
    if (!assessRecaptcha(captcha, { allowedHostnames: allowedHosts, minScore })) {
      return json({ success: false, message: 'Security verification failed.' }, 403, origin);
    }

    const admin = createClient(url, adminKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Caller-provided user_id is never accepted. Signed-in users are verified
    // against Auth; anonymous submissions intentionally remain guest inquiries.
    let userId = null;
    const auth = request.headers.get('authorization');
    if (auth && /^Bearer /i.test(auth)) {
      const bearer = auth.slice(7).trim();
      const { data: { user }, error } = await admin.auth.getUser(bearer);
      if (!error && user) userId = user.id;
    }

    const { data, error } = await admin.from('inquiries')
      .insert({ ...row, user_id: userId })
      .select('id')
      .single();
    if (error || !data?.id) {
      console.error('Inquiry storage failed:', error?.code || 'no record returned');
      return json({ success: false, message: 'Unable to submit right now.' }, 503, origin);
    }
    // Never return or log customer data, token or service-role credentials.
    return json({ success: true, inquiryId: data.id }, 201, origin);
  } catch (error) {
    if (error instanceof SubmissionValidationError || error instanceof SyntaxError) {
      return json({ success: false, message: 'Invalid inquiry details.' }, 400, origin);
    }
    console.error('Inquiry endpoint failed:', error instanceof Error ? error.name : 'unknown');
    return json({ success: false, message: 'Unable to submit right now.' }, 503, origin);
  }
});
