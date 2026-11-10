import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.110.0';
import { createSubmitInquiryHandler } from './handler.js';

Deno.serve(createSubmitInquiryHandler(createClient, name => Deno.env.get(name)));
