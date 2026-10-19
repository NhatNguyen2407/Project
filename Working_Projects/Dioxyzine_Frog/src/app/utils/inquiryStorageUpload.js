// Signed-in, synthetic-only Preview upload. This is NOT a guest upload API.
// The Staging bucket is private, auth.uid()-folder scoped and has no anon
// INSERT/SELECT policy. Signed links expire and are unsuitable for durable
// customer design references. Production continues to use Cloudinary.
import { STAGING_BUCKET, validSignedStagingImageUrl } from './inquiryImageProvider.js';

const MIME_TO_EXT = Object.freeze({
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
});
const MAX_BYTES = 5 * 1024 * 1024;

// MIME and filename are untrusted user inputs. Verify minimal file signatures
// before any network request. This is only a client-side defense in depth:
// production-grade guest uploads must validate bytes again server-side.
export function hasExpectedImageSignature(bytes, mime) {
  if (!(bytes instanceof Uint8Array)) return false;
  const starts = (...prefix) => bytes.length >= prefix.length &&
    prefix.every((value, index) => bytes[index] === value);
  if (mime === 'image/png') return starts(0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a);
  if (mime === 'image/jpeg') return starts(0xff,0xd8,0xff);
  if (mime === 'image/webp') {
    return bytes.length >= 12
      && starts(0x52,0x49,0x46,0x46)
      && bytes[8] === 0x57 && bytes[9] === 0x45
      && bytes[10] === 0x42 && bytes[11] === 0x50;
  }
  return false;
}

export async function uploadSyntheticInquiryImage(file, {
  client, createId = () => crypto.randomUUID(),
} = {}) {
  if (!client?.auth?.getUser || !client?.storage?.from) {
    throw new Error('Staging storage client unavailable.');
  }
  if (!file || !Object.hasOwn(MIME_TO_EXT, file.type) ||
      !Number.isInteger(file.size) || file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error('Only JPG, PNG or WebP test images up to 5 MB are allowed.');
  }
  if (typeof file.slice !== 'function') {
    throw new Error('Image content could not be verified.');
  }
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!hasExpectedImageSignature(header, file.type)) {
    throw new Error('Image bytes do not match the selected image format.');
  }

  const { data: identity, error: authError } = await client.auth.getUser();
  const uid = identity?.user?.id;
  if (authError || typeof uid !== 'string' ||
      !/^[0-9a-f-]{36}$/.test(uid)) {
    throw new Error('Sign in to your Staging test account before uploading.');
  }
  const imageId = createId();
  if (typeof imageId !== 'string' || !/^[0-9a-f-]{36}$/.test(imageId)) {
    throw new Error('Invalid staging image identifier.');
  }
  const path = `${uid}/${imageId}.${MIME_TO_EXT[file.type]}`;
  const bucket = client.storage.from(STAGING_BUCKET);
  const { data: saved, error: uploadError } = await bucket.upload(path, file, {
    upsert: false, contentType: file.type, cacheControl: '3600',
  });
  if (uploadError || saved?.path !== path) {
    throw uploadError || new Error('Staging upload response was not confirmed.');
  }
  const { data: signed, error: signError } = await bucket.createSignedUrl(path, 3600);
  if (signError || !validSignedStagingImageUrl(signed?.signedUrl, path)) {
    throw signError || new Error('Staging signed image URL is invalid.');
  }
  return signed.signedUrl;
}
