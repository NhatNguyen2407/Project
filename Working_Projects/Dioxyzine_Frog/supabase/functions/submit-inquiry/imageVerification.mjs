import { createHash } from 'node:crypto';
import { SubmissionValidationError } from './validation.mjs';

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_MAX_SIDE = 2048;
const STAGING_URL = 'https://bvnnmvlfcduwmneipmsi.supabase.co';
const PREFIX = 'storage://inquiry-test-references/';
const PATH = /^guest\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(png|jpg|webp)$/;
const TYPES = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
const invalid = () => new SubmissionValidationError('Invalid reference image');

export function normalizeImageEtag(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/^"([a-f0-9]{32})"$/i, '$1').toLowerCase();
  return /^[a-f0-9]{32}$/.test(normalized) ? normalized : null;
}

export function imageMimeFromBytes(bytes) {
  if (bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)) return 'image/png';
  if (bytes.length >= 3 && bytes[0]===255 && bytes[1]===216 && bytes[2]===255) return 'image/jpeg';
  if (bytes.length >= 12 && String.fromCharCode(...bytes.subarray(0,4))==='RIFF' &&
      String.fromCharCode(...bytes.subarray(8,12))==='WEBP') return 'image/webp';
  throw invalid();
}

// Animation is outside the bounded Staging contract. Check chunk boundaries
// before handing a forced PNG/WebP format to the decoder; validating only the
// first decoded frame would leave subsequent browser frames unverified.
export function assertStillImageContainer(bytes, mimeType) {
  const view = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const tag = offset=>String.fromCharCode(...bytes.subarray(offset,offset+4));
  if (mimeType==='image/png') {
    let offset=8;
    while (offset+12<=bytes.length) {
      const length=view.getUint32(offset),type=tag(offset+4);
      if (length>bytes.length-offset-12 || ['acTL','fcTL','fdAT'].includes(type)) throw invalid();
      offset+=length+12;
      if (type==='IEND') {
        if (length!==0 || offset!==bytes.length) throw invalid();
        return;
      }
    }
    throw invalid();
  }
  if (mimeType==='image/webp') {
    if (bytes.length<12 || view.getUint32(4,true)!==bytes.length-8) throw invalid();
    let offset=12;
    while (offset+8<=bytes.length) {
      const type=tag(offset),length=view.getUint32(offset+4,true);
      if (length>bytes.length-offset-8 || ['ANIM','ANMF'].includes(type) ||
          (type==='VP8X' && (length!==10 || (bytes[offset+8]&2)!==0))) throw invalid();
      const padding=length%2;
      if (padding && bytes[offset+8+length]!==0) throw invalid();
      offset+=8+length+padding;
    }
    if (offset!==bytes.length) throw invalid();
  }
}

async function readImageBounded(response, expectedSize) {
  const length = response.headers.get('content-length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length)!==expectedSize)) {
    await response.body?.cancel();
    throw invalid();
  }
  if (!response.body) throw invalid();
  const reader = response.body.getReader();
  const bytes = new Uint8Array(expectedSize);
  let size = 0;
  try {
    while (true) {
      const {value,done} = await reader.read();
      if (done) break;
      if (size + value.byteLength > expectedSize) throw invalid();
      bytes.set(value,size);
      size += value.byteLength;
    }
    if (size!==expectedSize) throw invalid();
    return bytes;
  } finally {
    await reader.cancel().catch(()=>{});
    reader.releaseLock();
  }
}

// The only URL comes from a fixed project/bucket and a validated UUID path.
// The injected decoder is the pinned WASM adapter in the Deno entrypoint.
export function createStagingImageVerifier({supabaseUrl,serviceRoleKey,decodeImage,fetchObject=fetch}) {
  return async function verifyImage(row, challenge) {
    if (supabaseUrl!==STAGING_URL || !serviceRoleKey || typeof decodeImage!=='function') {
      throw new Error('Image verifier unavailable');
    }
    const path = row.image_link?.startsWith(PREFIX) ? row.image_link.slice(PREFIX.length) : '';
    const mimeType = TYPES[path.split('.').pop()];
    if (!PATH.test(path) || challenge?.path!==path || challenge.mimeType!==mimeType ||
        !Number.isSafeInteger(challenge.sizeBytes) || challenge.sizeBytes<1 || challenge.sizeBytes>IMAGE_MAX_BYTES ||
        typeof challenge.etag!=='string' || normalizeImageEtag(challenge.etag)!==challenge.etag) throw invalid();
    const response = await fetchObject(`${STAGING_URL}/storage/v1/object/authenticated/inquiry-test-references/${path}`, {
      headers:{apikey:serviceRoleKey,Authorization:`Bearer ${serviceRoleKey}`,'If-Match':`"${challenge.etag}"`},
      redirect:'error', signal:AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      await response.body?.cancel();
      if ([404,412].includes(response.status)) throw invalid();
      throw new Error('Image download unavailable');
    }
    if (response.status!==200 || normalizeImageEtag(response.headers.get('etag'))!==challenge.etag ||
        response.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!==mimeType) {
      await response.body?.cancel();
      throw invalid();
    }
    const bytes = await readImageBounded(response,challenge.sizeBytes);
    if (imageMimeFromBytes(bytes)!==mimeType || createHash('md5').update(bytes).digest('hex')!==challenge.etag) throw invalid();
    const decoded = await decodeImage(bytes,mimeType);
    if (decoded?.mimeType!==mimeType || !Number.isInteger(decoded.width) || !Number.isInteger(decoded.height) ||
        decoded.width<1 || decoded.height<1 || decoded.width>IMAGE_MAX_SIDE || decoded.height>IMAGE_MAX_SIDE) throw invalid();
    return {etag:challenge.etag,mimeType,sizeBytes:bytes.length,width:decoded.width,height:decoded.height,
      sha256:createHash('sha256').update(bytes).digest('hex')};
  };
}
