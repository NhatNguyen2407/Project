import { createClient } from '@supabase/supabase-js';
import { createPasswordRecoveryTracker, hasAuthRedirectError } from '../utils/passwordRecovery';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const redirectError = typeof window !== 'undefined' && hasAuthRedirectError(window.location.href);
let recoveryStorage;
try { recoveryStorage = window.sessionStorage; } catch { /* Some browsers disable storage. */ }

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const passwordRecovery = createPasswordRecoveryTracker(supabase, { redirectError, storage: recoveryStorage });
if (import.meta.hot) import.meta.hot.dispose(() => passwordRecovery.dispose());
