// Preview uploads must use a separately provisioned, audited unsigned preset.
// Merely creating a Cloudinary folder is NOT an access-control boundary.
export const STAGING_CLOUDINARY_FOLDER = 'DioxyzineFrog_Staging/Inquiry_References';
export const STAGING_SUPABASE_URL = 'https://bvnnmvlfcduwmneipmsi.supabase.co';
const format = /^[a-zA-Z0-9_-]{1,100}$/;

export function selectCloudinaryUploadConfig({
  deploymentEnvironment, supabaseUrl, productionCloudName, productionPreset,
  stagingCloudName, stagingPreset, previewOptIn,
}) {
  if (deploymentEnvironment === 'production'
      && supabaseUrl === 'https://xeljnocizvlmefqovvfw.supabase.co'
      && format.test(productionCloudName || '') && format.test(productionPreset || '')) {
    return { cloudName: productionCloudName, preset: productionPreset, staging: false };
  }
  if (deploymentEnvironment === 'preview'
      && supabaseUrl === STAGING_SUPABASE_URL
      && previewOptIn === 'true'
      && format.test(stagingCloudName || '')
      && format.test(stagingPreset || '')
      && stagingCloudName !== productionCloudName
      && stagingPreset !== productionPreset) {
    return { cloudName: stagingCloudName, preset: stagingPreset, staging: true };
  }
  return null;
}

export function isStagingUploadResponseValid(data, cloudName) {
  if (typeof data?.public_id !== 'string' || !data.public_id.startsWith(STAGING_CLOUDINARY_FOLDER + '/')) return false;
  if (typeof data?.secure_url !== 'string') return false;
  try {
    const url = new URL(data.secure_url);
    return url.protocol === 'https:' && url.hostname === 'res.cloudinary.com'
      && url.pathname.startsWith('/' + cloudName + '/image/upload/');
  } catch { return false; }
}
