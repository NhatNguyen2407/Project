import { createClient } from 'npm:@supabase/supabase-js@2.110.0';
import { createInquiryHandler } from './handler.mjs';

// Deno entrypoint; all request handling is testable in Node via injected mocks.
// Draft only: DO NOT deploy without coordinated direct-INSERT/RLS cutover.
Deno.serve(createInquiryHandler({
  envGet: (name) => Deno.env.get(name),
  createClient,
  fetchCaptcha: fetch,
}));
