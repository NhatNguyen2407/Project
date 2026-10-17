import { decodeReferenceImage } from '../supabase/functions/submit-inquiry/imageDecoder.mjs';
import { SubmissionValidationError } from '../supabase/functions/submit-inquiry/validation.mjs';

import { encodedImages, imageBytes } from './fixtures/inquiryImages.mjs';
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
async function rejects(bytes,mime) {
 try { await decodeReferenceImage(bytes,mime); }
 catch(error) {assert(error instanceof SubmissionValidationError,'Unexpected decoder service error: '+error.name);return;}
 throw new Error('Decoder accepted invalid image');
}
Deno.test('real WASM decoder accepts PNG/JPEG/WebP and rejects corrupt/truncated/spoofed images',async()=>{
 // Generate real boundary images before the decoder installs its resource
 // limits. Initialization is shared/idempotent in the pinned WASM package.
 const magick=await import('npm:@imagemagick/magick-wasm@0.0.44');
 await magick.initializeImageMagick(await Deno.readFile(new URL(import.meta.resolve('npm:@imagemagick/magick-wasm@0.0.44/magick.wasm'))));
 const boundaries=[];
 for(const side of [2048,2049]) {
  for(const [mime,format] of [['image/png',magick.MagickFormat.Png],['image/jpeg',magick.MagickFormat.Jpeg],['image/webp',magick.MagickFormat.WebP]]) {
   const image=magick.MagickImage.create(new magick.MagickColor('#7a55aa'),side,side);
   try { image.write(format,bytes=>boundaries.push({mime,side,bytes:bytes.slice()})); }
   finally { image.dispose(); }
  }
 }
 for(const mime of Object.keys(encodedImages)) {
  const bytes=imageBytes(mime);
  const result=await decodeReferenceImage(bytes,mime);
  assert(result.width===2&&result.height===2&&result.mimeType===mime,'Decoded dimensions/type differ');
  await rejects(bytes.slice(0,Math.floor(bytes.length/2)),mime);
  await rejects(bytes.slice(0,12),mime);
 }
 await rejects(imageBytes('image/png'),'image/jpeg');
 await rejects(new TextEncoder().encode('<svg onload="alert(1)"></svg>'),'image/png');
 // Preserve JPEG structure but advertise a resource-exhausting frame size.
 const bomb=imageBytes('image/jpeg');
 let frame=-1;
 for(let i=0;i<bomb.length-8;i++) if(bomb[i]===255&&bomb[i+1]===192){frame=i;break;}
 assert(frame>=0,'Synthetic JPEG SOF marker missing');
 bomb[frame+5]=255;bomb[frame+6]=255;bomb[frame+7]=255;bomb[frame+8]=255;
 await rejects(bomb,'image/jpeg');
 for(const {mime,side,bytes} of boundaries) {
  if(side===2049) await rejects(bytes,mime);
  else {
   const result=await decodeReferenceImage(bytes,mime);
   assert(result.width===2048&&result.height===2048&&result.mimeType===mime,'Inclusive image boundary rejected: '+mime);
  }
 }
 // Failed decoding must not poison the shared WASM runtime.
 assert((await decodeReferenceImage(imageBytes('image/png'),'image/png')).width===2,'Decoder did not recover');
});
