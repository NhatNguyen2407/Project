import { createClient } from 'npm:@supabase/supabase-js@2.110.0';
import { corsHeaders } from 'npm:@supabase/supabase-js@2.110.0/cors';
import { createInquiryHandler } from './handler.mjs';
import { createStagingImageVerifier } from './imageVerification.mjs';
import { decodeReferenceImage } from './imageDecoder.mjs';

// Deno entrypoint; all request handling is testable in Node via injected mocks.
// Draft only: DO NOT deploy without coordinated direct-INSERT/RLS cutover.
Deno.serve(createInquiryHandler({
  envGet: (name) => Deno.env.get(name),
  createClient,
  fetchCaptcha: fetch,
  verifyImage: createStagingImageVerifier({
    supabaseUrl:Deno.env.get('SUPABASE_URL'),
    serviceRoleKey:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    decodeImage:decodeReferenceImage,
  }),
  allowedCorsHeaders: corsHeaders['Access-Control-Allow-Headers'],
}));
