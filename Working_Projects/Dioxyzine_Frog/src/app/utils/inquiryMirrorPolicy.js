// Guard an optional *secondary* Google Sheets inquiry copy.
// The Supabase database remains the source of truth. In particular, a Vercel
// Preview must never send customer/synthetic test inquiries to live Sheets.
// Opt-in is allowed only on the reviewed Production deployment and backend.
const PRODUCTION_SUPABASE_URL = 'https://xeljnocizvlmefqovvfw.supabase.co';

export function mayMirrorInquiryToSheets({
  optIn,
  deploymentEnvironment,
  supabaseUrl,
}) {
  return optIn === 'true'
    && deploymentEnvironment === 'production'
    && supabaseUrl === PRODUCTION_SUPABASE_URL;
}
