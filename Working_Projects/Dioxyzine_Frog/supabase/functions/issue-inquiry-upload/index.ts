import { createClient } from 'npm:@supabase/supabase-js@2.110.0';
import { corsHeaders } from 'npm:@supabase/supabase-js@2.110.0/cors';
import { createGuestUploadHandler } from './handler.mjs';

// Draft, STAGING ONLY: deploy only after separate quota/RLS review.
// This is NOT a complete guest image attachment flow.
Deno.serve(createGuestUploadHandler({
  envGet: (name:string)=>Deno.env.get(name),
  createClient,
  fetchCaptcha:fetch,
  allowedCorsHeaders:corsHeaders['Access-Control-Allow-Headers'],
}));
