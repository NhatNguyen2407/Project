import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_ANON_KEY'),
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: userError } = await anonClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Không xác định được người dùng. Vui lòng đăng nhập lại rồi thử lại.')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    // Keep paid order history, but detach and anonymize the customer's PII.
    const { error: ordersError } = await supabase
      .from('orders')
      .update({
        user_id: null,
        customer_name: 'Deleted User',
        customer_email: 'deleted@deleted.local',
        phone_number: null,
        shipping_address: null,
      })
      .eq('user_id', user.id)

    if (ordersError) throw ordersError

    // Legacy inquiry records are anonymized too.
    const { error: inquiryError } = await supabase
      .from('inquiries')
      .update({
        user_id: null,
        customer_name: 'Deleted User',
        customer_email: 'deleted@deleted.local',
        phone_number: null,
        shipping_address: null,
        contact_info: null,
      })
      .eq('user_id', user.id)

    if (inquiryError) throw inquiryError

    await supabase.from('wishlists').delete().eq('user_id', user.id)
    await supabase.from('user_roles').delete().eq('user_id', user.id)

    const { data: avatarFiles } = await supabase.storage.from('avatars').list('', {
      search: user.id,
    })
    if (avatarFiles && avatarFiles.length > 0) {
      await supabase.storage.from('avatars').remove(avatarFiles.map((f) => f.name))
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
    if (deleteError) throw deleteError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})