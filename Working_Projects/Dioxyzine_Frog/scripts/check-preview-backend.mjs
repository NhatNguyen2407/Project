// Build-time guard: prevent an unreviewed Vercel Preview build from targeting
// Dioxyzine Frog's production Supabase project. No credentials are read/logged.
const PROJECT_REF = /^[a-z0-9]{20}$/;

export function assertPreviewBackendIsolation({
  deploymentEnvironment,
  supabaseUrl,
  stagingProjectRef,
  productionProjectRef,
}) {
  // This is intentionally scoped to Preview builds. A local build and
  // Production build are not changed by this guard.
  if (deploymentEnvironment !== 'preview') return;

  if (!PROJECT_REF.test(productionProjectRef || '')) {
    throw new Error('Preview safety check is missing a valid production project reference.');
  }
  if (!PROJECT_REF.test(stagingProjectRef || '')) {
    throw new Error('Preview blocked: configure STAGING_SUPABASE_REF for an isolated Supabase project.');
  }
  if (stagingProjectRef === productionProjectRef) {
    throw new Error('Preview blocked: staging project reference equals the production project.');
  }

  let parsed;
  try {
    parsed = new URL(supabaseUrl);
  } catch {
    throw new Error('Preview blocked: VITE_SUPABASE_URL is missing or invalid.');
  }
  if (
    parsed.protocol !== 'https:' ||
    parsed.hostname !== `${stagingProjectRef}.supabase.co` ||
    parsed.username ||
    parsed.password ||
    parsed.port ||
    parsed.pathname !== '/' ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error('Preview blocked: Supabase URL does not match the approved staging project.');
  }
}
