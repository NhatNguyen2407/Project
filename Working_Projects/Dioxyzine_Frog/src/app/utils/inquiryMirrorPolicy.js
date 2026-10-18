// Guard an optional *secondary* Google Sheets inquiry copy.
// The Supabase database remains the source of truth. In particular, a Vercel
// Preview must never send customer/synthetic test inquiries to live Sheets.
// Opt-in is allowed only on the reviewed Production deployment and backend.
const PRODUCTION_SUPABASE_URL = 'https://xeljnocizvlmefqovvfw.supabase.co';

export function isVerifiedProductionSheetsDestination({ deploymentEnvironment, supabaseUrl }) {
  return deploymentEnvironment === 'production' && supabaseUrl === PRODUCTION_SUPABASE_URL;
}

// Legacy feedback currently has no alternative durable backend. Until one is
// implemented, allow it only on the real Production frontend + backend.
// Unlike the optional Inquiry mirror, feedback intentionally has no new opt-in
// to avoid unexpectedly disabling the already-live Production feedback form.
export function maySubmitFeedbackToSheets({ deploymentEnvironment, supabaseUrl }) {
  return isVerifiedProductionSheetsDestination({ deploymentEnvironment, supabaseUrl });
}

export function mayMirrorInquiryToSheets({
  optIn,
  deploymentEnvironment,
  supabaseUrl,
}) {
  return optIn === 'true'
    && isVerifiedProductionSheetsDestination({ deploymentEnvironment, supabaseUrl });
}
