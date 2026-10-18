// Live third-party effects must never be triggered by a Vercel Preview, local
// development or a build against the isolated Supabase Staging project.
// This is a client-side operational guard, not server-side authorization.
// A future sandbox E2E needs separately reviewed, test-only destinations.
export const PRODUCTION_SUPABASE_URL = 'https://xeljnocizvlmefqovvfw.supabase.co';

export function canUseLiveExternalServices({ deploymentEnvironment, supabaseUrl }) {
  return deploymentEnvironment === 'production'
    && supabaseUrl === PRODUCTION_SUPABASE_URL;
}
