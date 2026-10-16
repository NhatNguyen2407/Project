// Pure HTTP request handler for the submit-inquiry Edge Function.
// Dependencies are provided by the Deno entrypoint in production and by mocks
// in Node tests. No database or Google network call occurs on module import.
import { INQUIRY_BUDGETS, consumeInquiryBudget } from './rateBudget.mjs';
import { persistInquiryOnce, isInquiryIdempotencyKey } from './idempotency.mjs';
import { classifyInquiryCaller, isAllowedInquiryPreflight } from './requestAuth.mjs';
import {
  validateInquiryPayload,
  assessRecaptcha,
  parseAllowedHostnames,
  isAllowedRequestOrigin,
  validateCaptchaToken,
  SubmissionValidationError,
} from './validation.mjs';

const MAX_BYTES = 16_384;

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Vary': 'Origin',
      ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
    },
  });
}

class RequestTooLarge extends Error {}

// Enforce request size as bytes are read, not after allocating an unbounded
// string. The content-length check alone is client-controlled.
async function readJsonBounded(request) {
  if (!request.body) throw new SyntaxError('Missing JSON body.');
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel().catch(() => {});
        throw new RequestTooLarge();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let position = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, position);
    position += chunk.byteLength;
  }
  let decoded;
  try {
    decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new SyntaxError('Invalid UTF-8.');
  }
  return JSON.parse(decoded);
}

/**
 * @param {object} dependencies
 * @param {(key:string) => string|undefined} dependencies.envGet
 * @param {Function} dependencies.createClient Supabase service role client factory
 * @param {typeof fetch} dependencies.fetchCaptcha HTTP siteverify caller
 * @param {() => number} dependencies.clock current Unix milliseconds
 * @param {object} dependencies.logger sanitized error logger
 */
export function createInquiryHandler({
  envGet,
  createClient,
  fetchCaptcha,
  clock = () => Date.now(),
  logger = console,
  allowedCorsHeaders = 'authorization, apikey, x-client-info, content-type',
}) {
  if (typeof envGet !== 'function' || typeof createClient !== 'function' || typeof fetchCaptcha !== 'function') {
    throw new TypeError('Inquiry handler dependencies must be provided.');
  }

  return async function submitInquiry(request) {
    const origin = request.headers.get('origin');
    const origins = envGet('INQUIRY_ALLOWED_ORIGINS') || '';
    if (!isAllowedRequestOrigin(origin, origins)) {
      return json({ success: false, message: 'Origin not permitted.' }, 403, null);
    }

    if (request.method === 'OPTIONS') {
      if (!isAllowedInquiryPreflight(request, allowedCorsHeaders)) {
        return json({ success: false, message: 'Preflight not permitted.' }, 403, null);
      }
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': allowedCorsHeaders,
          'Access-Control-Max-Age': '600',
          'Vary': 'Origin',
        },
      });
    }
    if (request.method !== 'POST') {
      return json({ success: false, message: 'Method not allowed.' }, 405, origin);
    }
    const headerBytes = Number(request.headers.get('content-length') || '0');
    if (headerBytes > MAX_BYTES) {
      return json({ success: false, message: 'Request too large.' }, 413, origin);
    }
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) {
      return json({ success: false, message: 'JSON body required.' }, 415, origin);
    }

    const secret = envGet('RECAPTCHA_SECRET_KEY');
    const adminKey = envGet('SUPABASE_SERVICE_ROLE_KEY');
    const url = envGet('SUPABASE_URL');
    const allowedHosts = parseAllowedHostnames(envGet('INQUIRY_ALLOWED_HOSTNAMES'));
    const minScore = Number(envGet('INQUIRY_RECAPTCHA_MIN_SCORE') || '0.5');
    if (!secret || !adminKey || !url || !allowedHosts.length ||
        !Number.isFinite(minScore) || minScore < 0 || minScore > 1) {
      logger.error('Inquiry endpoint security configuration incomplete');
      return json({ success: false, message: 'Service temporarily unavailable.' }, 503, origin);
    }

    try {
      const body = await readJsonBounded(request);
      if (!validateCaptchaToken(body?.token)) {
        return json({ success: false, message: 'Verification required.' }, 400, origin);
      }
      const row = validateInquiryPayload(body?.inquiry);
      if (!isInquiryIdempotencyKey(body?.idempotencyKey)) {
        return json({success:false,message:'Invalid submission identifier.'},400,origin);
      }
      const caller = classifyInquiryCaller(
        request.headers,
        envGet('INQUIRY_PUBLIC_API_KEY'),
        adminKey,
      );
      if (caller.status !== 200) {
        return json({ success: false, message: caller.status === 503
          ? 'Service temporarily unavailable.' : 'Invalid authorization.' },
          caller.status, origin);
      }
      const admin = createClient(url, adminKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      let preverifyAllowed;
      try {
        preverifyAllowed = await consumeInquiryBudget(admin, INQUIRY_BUDGETS.preverify);
      } catch {
        return json({ success: false, message: 'Service temporarily unavailable.' }, 503, origin);
      }
      if (!preverifyAllowed) {
        return json({ success: false, message: 'Too many requests. Please try later.' }, 429, origin);
      }

      const verifyResponse = await fetchCaptcha('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: body.token }).toString(),
        signal: AbortSignal.timeout(8_000),
      });
      if (!verifyResponse.ok) {
        return json({ success: false, message: 'Verification unavailable.' }, 503, origin);
      }
      const captcha = await verifyResponse.json();
      if (!assessRecaptcha(captcha, { allowedHostnames: allowedHosts, minScore, now: clock() })) {
        return json({ success: false, message: 'Security verification failed.' }, 403, origin);
      }

      let acceptedAllowed;
      try {
        acceptedAllowed = await consumeInquiryBudget(admin, INQUIRY_BUDGETS.accepted);
      } catch {
        return json({ success: false, message: 'Service temporarily unavailable.' }, 503, origin);
      }
      if (!acceptedAllowed) {
        return json({ success: false, message: 'Too many requests. Please try later.' }, 429, origin);
      }

      // Public apikey identifies the application, not a user. A separate
      // non-key Bearer token must be verified via Supabase Auth.
      let userId = null;
      if (caller.userToken) {
        const { data, error } = await admin.auth.getUser(caller.userToken);
        if (error || !data?.user?.id) {
          return json({ success: false, message: 'Invalid authorization.' }, 401, origin);
        }
        userId = data.user.id;
      }

      const result = await persistInquiryOnce(admin, {
        key: body.idempotencyKey, row, userId,
      });
      if (result.conflict) {
        return json({ success:false, message:'Submission identifier reused with different details.' },409,origin);
      }
      return json({ success:true, inquiryId:result.inquiryId, replayed:result.replayed },
        result.replayed ? 200 : 201,origin);
    } catch (error) {
      if (error instanceof RequestTooLarge) {
        return json({ success: false, message: 'Request too large.' }, 413, origin);
      }
      if (error instanceof SubmissionValidationError || error instanceof SyntaxError) {
        return json({ success: false, message: 'Invalid inquiry details.' }, 400, origin);
      }
      logger.error('Inquiry endpoint failed:', error instanceof Error ? error.name : 'unknown');
      return json({ success: false, message: 'Unable to submit right now.' }, 503, origin);
    }
  };
}
