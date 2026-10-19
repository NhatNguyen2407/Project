// Browser-side guest upload for isolated Preview ONLY. This is not an
// authorization boundary: the Edge issuer enforces CAPTCHA + database budgets.
// The response is a durable private reference, NOT a public or signed view URL.
import { STAGING_BUCKET } from './inquiryImageProvider.js';
import { hasExpectedImageSignature } from './inquiryStorageUpload.js';

const EXT = Object.freeze({'image/png':'png','image/jpeg':'jpg','image/webp':'webp'});
const MAX_SIZE = 5*1024*1024;
const PATH = /^guest\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:png|jpg|webp)$/i;

export async function uploadGuestInquiryImage(file,{client,getUploadCaptcha}={}) {
  if (!client?.functions?.invoke || !client?.storage?.from ||
      typeof getUploadCaptcha!=='function') {
    throw new Error('Guest test upload is unavailable.');
  }
  if (!file || !Object.hasOwn(EXT,file.type) || !Number.isInteger(file.size) ||
      file.size<1 || file.size>MAX_SIZE || typeof file.slice!=='function') {
    throw new Error('Only PNG, JPEG and WebP images up to 5 MB are accepted.');
  }
  const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());
  if(!hasExpectedImageSignature(bytes,file.type)) throw new Error('Image signature mismatch.');
  const captchaToken=await getUploadCaptcha();
  if (typeof captchaToken!=='string' || captchaToken.length<20) throw new Error('Upload CAPTCHA is unavailable.');

  const {data:issued,error:issueError}=await client.functions.invoke('issue-inquiry-upload',{
    body:{captchaToken,mimeType:file.type,sizeBytes:file.size},
  });
  if (issueError || issued?.success!==true || issued.bucket!==STAGING_BUCKET ||
      typeof issued.path!=='string' || !PATH.test(issued.path) ||
      !issued.path.endsWith('.'+EXT[file.type]) ||
      typeof issued.token!=='string' || !issued.token.trim()) {
    throw new Error('No verified Staging upload ticket was issued.');
  }
  const {data:uploaded,error:uploadError}=await client.storage.from(STAGING_BUCKET)
    .uploadToSignedUrl(issued.path,issued.token,file,{contentType:file.type,upsert:false});
  if (uploadError || !uploaded || uploaded.path!==issued.path) {
    throw uploadError || new Error('Staging Storage did not confirm upload.');
  }
  return `storage://${STAGING_BUCKET}/${issued.path}`;
}
