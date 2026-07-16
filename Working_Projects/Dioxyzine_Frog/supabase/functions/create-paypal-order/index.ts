import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Cấu hình CORS để cho phép Frontend (Vercel/Localhost) gọi được hàm này
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Bắt buộc phải có đoạn này để xử lý preflight request của trình duyệt
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Nhận dữ liệu (tổng tiền) từ Frontend gửi lên
    const { amount } = await req.json()

    // 2. Lấy chìa khóa bí mật đã giấu trong Supabase
    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')
    const PAYPAL_SECRET_KEY = Deno.env.get('PAYPAL_SECRET_KEY')

    // 3. Xin quyền (Access Token) từ PayPal
    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`)
    const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    })
    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    // 4. Ra lệnh cho PayPal tạo form thu tiền
    const orderRes = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: amount.toString()
          }
        }]
      })
    })
    const orderData = await orderRes.json()

    // 5. Trả kết quả (Form Order) về lại cho Frontend
    return new Response(JSON.stringify(orderData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})