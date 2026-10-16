// STAGING ONLY. Issues a signed upload *capability*, not an Inquiry record.
// Signed upload tokens from Supabase Storage can be valid for up to two hours.
// This route is deliberately disabled unless all isolated staging gates exist.
// A separate trusted ticket-to-inquiry binding is required before real use.
import { consumeInquiryBudget, INQUIRY_BUDGETS } from '../submit-inquiry/rateBudget.mjs';
import {
  assessRecaptcha, parseAllowedHostnames, isAllowedRequestOrigin, validateCaptchaToken,
} from '../submit-inquiry/validation.mjs';
import { classifyInquiryCaller, isAllowedInquiryPreflight } from '../submit-inquiry/requestAuth.mjs';

export const STAGING_PROJECT_URL = 'https://bvnnmvlfcduwmneipmsi.supabase.co';
export const STAGING_IMAGE_BUCKET = 'inquiry-test-references';
const MAX_BODY_BYTES = 1024;
const FILE_LIMIT = 5 * 1024 * 1024;
const TYPES = Object.freeze({'image/png':'png','image/jpeg':'jpg','image/webp':'webp'});

function reply(status, message, origin, extra={}) {
  return new Response(JSON.stringify({success:status===201,...extra,...(message?{message}:{})}), {
    status,
    headers:{'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',
      ...(origin?{'Access-Control-Allow-Origin':origin}:{})},
  });
}

async function readBoundedJson(req) {
  if (!req.body) throw new Error('missing body');
  const reader=req.body.getReader();
  let size=0;
  const parts=[];
  try {
    while (true) {
      const {value,done}=await reader.read();
      if (done) break;
      size+=value.byteLength;
      if (size>MAX_BODY_BYTES) {
        await reader.cancel().catch(()=>{});
        throw new Error('oversized');
      }
      parts.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes=new Uint8Array(size);
  let offset=0;
  for (const part of parts) { bytes.set(part,offset);offset+=part.byteLength; }
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
}

export function validateGuestUploadRequest(input) {
  if (!input || typeof input!=='object' || Array.isArray(input)) return null;
  if (Object.keys(input).some(key=>!['captchaToken','mimeType','sizeBytes'].includes(key))) return null;
  const extension=TYPES[input.mimeType];
  if (!extension || !Number.isSafeInteger(input.sizeBytes) ||
      input.sizeBytes<1 || input.sizeBytes>FILE_LIMIT ||
      !validateCaptchaToken(input.captchaToken)) return null;
  return {mimeType:input.mimeType,sizeBytes:input.sizeBytes,extension,token:input.captchaToken};
}

export function createGuestUploadHandler({
  envGet, createClient, fetchCaptcha, newId=()=>crypto.randomUUID(),
  clock=()=>Date.now(), logger=console,
  allowedCorsHeaders='authorization, apikey, x-client-info, content-type',
}) {
  if (typeof envGet!=='function' || typeof createClient!=='function' ||
      typeof fetchCaptcha!=='function') throw new TypeError('Dependencies required');

  return async function issueUpload(req) {
    const origin=req.headers.get('origin');
    if (!isAllowedRequestOrigin(origin,envGet('INQUIRY_ALLOWED_ORIGINS')||'')) {
      return reply(403,'Origin not permitted.',null);
    }
    if (req.method==='OPTIONS') {
      if (!isAllowedInquiryPreflight(req,allowedCorsHeaders))
        return reply(403,'Preflight not permitted.',null);
      return new Response(null,{status:204,headers:{
        'Access-Control-Allow-Origin':origin,
        'Access-Control-Allow-Methods':'POST, OPTIONS',
        'Access-Control-Allow-Headers':allowedCorsHeaders,
        'Vary':'Origin',
      }});
    }
    if (req.method!=='POST') return reply(405,'Method not allowed.',origin);
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers.get('content-type')||'')) {
      return reply(415,'JSON required.',origin);
    }
    const length=Number(req.headers.get('content-length')||'0');
    if (!Number.isFinite(length) || length>MAX_BODY_BYTES)
      return reply(413,'Request too large.',origin);

    const url=envGet('SUPABASE_URL');
    const secret=envGet('RECAPTCHA_SECRET_KEY');
    const serverKey=envGet('SUPABASE_SERVICE_ROLE_KEY');
    const publicKey=envGet('INQUIRY_PUBLIC_API_KEY');
    const hosts=parseAllowedHostnames(envGet('INQUIRY_ALLOWED_HOSTNAMES'));
    const score=Number(envGet('INQUIRY_RECAPTCHA_MIN_SCORE')||'0.5');
    if (envGet('INQUIRY_UPLOAD_STAGING_ENABLED')!=='true' ||
        url!==STAGING_PROJECT_URL || !secret || !serverKey || !publicKey ||
        !hosts.length || !Number.isFinite(score) || score<0 || score>1) {
      return reply(503,'Upload service disabled.',origin);
    }
    const caller=classifyInquiryCaller(req.headers,publicKey,serverKey);
    if (caller.status!==200 || caller.userToken) return reply(401,'Invalid authorization.',origin);

    try {
      const body=validateGuestUploadRequest(await readBoundedJson(req));
      if (!body) return reply(400,'Invalid image metadata.',origin);
      const admin=createClient(url,serverKey,{auth:{persistSession:false,autoRefreshToken:false}});
      if (!await consumeInquiryBudget(admin,INQUIRY_BUDGETS.uploadPreverify))
        return reply(429,'Too many requests.',origin);

      const verified=await fetchCaptcha('https://www.google.com/recaptcha/api/siteverify',{
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams({secret,response:body.token}).toString(),
        signal:AbortSignal.timeout(8000),
      });
      if (!verified.ok) return reply(503,'Verification unavailable.',origin);
      if (!assessRecaptcha(await verified.json(),{
        allowedHostnames:hosts,minScore:score,now:clock(),action:'inquiry_upload',
      })) return reply(403,'Security verification failed.',origin);
      if (!await consumeInquiryBudget(admin,INQUIRY_BUDGETS.uploadIssued))
        return reply(429,'Too many requests.',origin);

      const id=newId();
      if (typeof id!=='string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))
        return reply(503,'Upload unavailable.',origin);
      const path=`guest/${id}.${body.extension}`;
      // Persist issuance first. Failed signing leaves only a cleanup-eligible
      // unclaimed ticket; a token without a registered ticket is never returned.
      const {data:ticketSaved,error:ticketError}=await admin.rpc('register_inquiry_upload_ticket',{
        p_path:path,p_mime_type:body.mimeType,p_declared_bytes:body.sizeBytes,
      });
      if (ticketError || ticketSaved!==true) return reply(503,'Upload unavailable.',origin);
      const {data,error}=await admin.storage.from(STAGING_IMAGE_BUCKET).createSignedUploadUrl(path);
      if (error || !data || data.path!==path ||
          typeof data.token!=='string' || !data.token.trim()) {
        return reply(503,'Upload unavailable.',origin);
      }
      // Do not echo server keys or input CAPTCHA tokens. Token is a bearer
      // capability to this single path, not proof of a completed upload.
      return reply(201,null,origin,{bucket:STAGING_IMAGE_BUCKET,path,token:data.token});
    } catch (error) {
      logger.error('Guest upload issuance failed:',error instanceof Error?error.name:'unknown');
      return reply(503,'Upload unavailable.',origin);
    }
  };
}
