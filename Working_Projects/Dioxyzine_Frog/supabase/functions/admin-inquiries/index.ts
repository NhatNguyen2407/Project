import { createClient } from 'npm:@supabase/supabase-js@2.110.0';
import { corsHeaders } from 'npm:@supabase/supabase-js@2.110.0/cors';
import { createAdminInquiryReadHandler } from './handler.mjs';
// Draft, disabled by default. Auth and admin role are verified in the handler.
Deno.serve(createAdminInquiryReadHandler({
  envGet:name=>Deno.env.get(name),createClient,
  allowedCorsHeaders:corsHeaders['Access-Control-Allow-Headers'],
}));
