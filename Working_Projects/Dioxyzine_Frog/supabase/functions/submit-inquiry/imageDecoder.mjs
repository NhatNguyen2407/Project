// Only loaded when a NEW Staging image needs verification. Production and
// already-committed retries never initialize WASM or download an object.
import { SubmissionValidationError } from './validation.mjs';
import { IMAGE_MAX_SIDE, imageMimeFromBytes, assertStillImageContainer } from './imageVerification.mjs';
let runtime;
async function loadRuntime() {
  const magick = await import('npm:@imagemagick/magick-wasm@0.0.44');
  const bytes = await Deno.readFile(new URL(import.meta.resolve('npm:@imagemagick/magick-wasm@0.0.44/magick.wasm')));
  await magick.initializeImageMagick(bytes);
  const limits = magick.ResourceLimits;
  limits.width=BigInt(IMAGE_MAX_SIDE); limits.height=BigInt(IMAGE_MAX_SIDE);
  limits.area=BigInt(IMAGE_MAX_SIDE * IMAGE_MAX_SIDE);
  limits.memory=64n*1024n*1024n; limits.disk=0n;
  limits.maxMemoryRequest=64n*1024n*1024n; limits.maxProfileSize=256n*1024n;
  // ImageMagick's cache counts the destination image as well as the input.
  limits.listLength=2n;
  return magick;
}

export async function decodeReferenceImage(bytes, mimeType) {
  if (imageMimeFromBytes(bytes)!==mimeType) throw new SubmissionValidationError('Invalid image type');
  assertStillImageContainer(bytes,mimeType);
  // Initialization failures are service failures (503), not invalid user input.
  runtime ??= loadRuntime().catch(error=>{runtime=undefined;throw error;});
  const {MagickImage,MagickFormat,MagickReadSettings} = await runtime;
  const format = {'image/png':MagickFormat.Png,'image/jpeg':MagickFormat.Jpeg,'image/webp':MagickFormat.WebP}[mimeType];
  const image = MagickImage.create();
  let warned=false;
  image.onWarning=()=>{warned=true;return 0;};
  try {
    image.read(bytes,new MagickReadSettings({format}));
    if (warned || image.width<1 || image.height<1 || image.width>IMAGE_MAX_SIDE || image.height>IMAGE_MAX_SIDE) {
      throw new Error('Invalid decoded image');
    }
    return {mimeType,width:image.width,height:image.height};
  } catch {
    throw new SubmissionValidationError('Image cannot be decoded within Staging limits');
  } finally { image.dispose(); }
}
