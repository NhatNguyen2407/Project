// Validate the Supabase client API key without mistaking it for a user JWT.
// Publishable/legacy anon keys are PUBLIC; this check only rejects malformed
// clients and secret-key misuse. CAPTCHA and budgets remain abuse defenses.
export function classifyInquiryCaller(headers, publicKey, serverKey) {
  if (typeof publicKey !== 'string' || !publicKey.trim() ||
      publicKey === serverKey || publicKey.startsWith('sb_secret_')) {
    return { status: 503, userToken: null };
  }

  if (headers.get('apikey') !== publicKey) {
    return { status: 401, userToken: null };
  }

  const header = headers.get('authorization');
  if (header == null) return { status: 200, userToken: null };
  const match = /^Bearer ([^\s]+)$/i.exec(header.trim());
  if (!match) return { status: 401, userToken: null };

  const token = match[1];
  if (token === publicKey) return { status: 200, userToken: null };
  if (token === serverKey || token.startsWith('sb_secret_') ||
      token.startsWith('sb_publishable_')) {
    return { status: 401, userToken: null };
  }

  // A non-key bearer is only a *candidate* user token. The Edge Function
  // must call auth.getUser and reject failed validation before any write.
  return { status: 200, userToken: token };
}

// A browser preflight may request precisely the headers sent by supabase-js.
// The allowed list is injected from the pinned SDK in the Deno entrypoint.
export function isAllowedInquiryPreflight(request, allowedHeaders) {
  const method = request.headers.get('access-control-request-method');
  if (method && method.toUpperCase() !== 'POST') return false;
  const allowed = new Set(allowedHeaders.split(',').map(h => h.trim().toLowerCase()).filter(Boolean));
  const requested = (request.headers.get('access-control-request-headers') || '')
    .split(',').map(h => h.trim().toLowerCase()).filter(Boolean);
  return requested.every(h => allowed.has(h));
}
