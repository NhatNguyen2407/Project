// Environment-gated reference image provider. All Preview uploads stay OFF
// unless a separate Supabase Staging bucket and auth policies are verified.
export const PRODUCTION_URL = 'https://xeljnocizvlmefqovvfw.supabase.co';
export const STAGING_URL = 'https://bvnnmvlfcduwmneipmsi.supabase.co';
export const STAGING_BUCKET = 'inquiry-test-references';
const presetIdentifier = /^[a-zA-Z0-9_-]{1,100}$/;

export function selectInquiryImageProvider({
  deploymentEnvironment, supabaseUrl,
  productionCloudName, productionPreset, stagingStorageOptIn,
}) {
  if (deploymentEnvironment === 'production' && supabaseUrl === PRODUCTION_URL
      && presetIdentifier.test(productionCloudName || '')
      && presetIdentifier.test(productionPreset || '')) {
    return { kind: 'cloudinary', cloudName: productionCloudName, preset: productionPreset };
  }
  if (deploymentEnvironment === 'preview' && supabaseUrl === STAGING_URL
      && stagingStorageOptIn === 'true') {
    return { kind: 'supabase-storage', bucket: STAGING_BUCKET };
  }
  return null;
}

export function validSignedStagingImageUrl(value, path) {
  if (typeof value !== 'string' || typeof path !== 'string') return false;
  if (!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:png|jpg|webp)$/.test(path)) return false;
  try {
    const u = new URL(value);
    return u.origin === STAGING_URL
      && u.username === '' && u.password === '' && u.port === ''
      && u.pathname === `/storage/v1/object/sign/${STAGING_BUCKET}/${path}`
      && !!u.searchParams.get('token');
  } catch { return false; }
}
