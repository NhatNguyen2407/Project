import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0"
import { createDeleteAccountHandler } from "./handler.js"

serve(createDeleteAccountHandler(createClient, (name) => Deno.env.get(name)))
