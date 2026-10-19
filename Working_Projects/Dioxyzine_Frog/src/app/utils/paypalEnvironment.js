import { canUseLiveExternalServices } from './externalServicePolicy.js';
export function canUsePayPalCheckout({deploymentEnvironment,supabaseUrl,mode,stagingOptIn,clientId}={}) {
  if (!clientId) return false;
  if (canUseLiveExternalServices({deploymentEnvironment,supabaseUrl})) return true;
  return deploymentEnvironment==='preview' &&
    supabaseUrl==='https://bvnnmvlfcduwmneipmsi.supabase.co' &&
    mode==='sandbox' && stagingOptIn==='true';
}
