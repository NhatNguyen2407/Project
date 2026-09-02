import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Cấu hình CORS để cho phép Frontend (Vercel/Localhost) gọi được hàm này
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SHIPPING_FEE = 15

// An toàn theo mặc định: nếu không khai báo PAYPAL_MODE, luôn dùng sandbox
// (tiền giả để test). Chỉ khi đặt PAYPAL_MODE=live trong Supabase Function
// Secrets thì mới gọi tới PayPal thật (tiền thật).
const PAYPAL_API_BASE = Deno.env.get('PAYPAL_MODE') === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

serve(async (req) => {
  // Bắt buộc phải có đoạn này để xử lý preflight request của trình duyệt
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Nhận GIỎ HÀNG (id + số lượng) và mã voucher từ Frontend — KHÔNG
    // nhận số tiền trực tiếp nữa. Số tiền client hiển thị chỉ là ước tính
    // cho khách xem; số tiền thật luôn được tính lại ở đây.
    const { items, voucherCode } = await req.json()

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Giỏ hàng trống hoặc không hợp lệ.')
    }

    // 2. Kết nối Supabase bằng service role key (được Supabase tự cấp sẵn
    // cho mọi Edge Function, không cần tự khai báo secret) — bỏ qua RLS vì
    // đây là ngữ cảnh server đáng tin cậy, KHÔNG phải request trực tiếp
    // từ trình duyệt.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    // 3. Lấy giá THẬT của từng sản phẩm trong giỏ từ database — bỏ qua
    // hoàn toàn giá mà client có thể đã gửi kèm trong "items".
    const productIds = items.map((it) => it.id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, stock, title')
      .in('id', productIds)

    if (productsError) throw productsError
    if (!products || products.length !== productIds.length) {
      throw new Error('Một hoặc nhiều sản phẩm trong giỏ hàng không còn tồn tại.')
    }

    const productById = Object.fromEntries(products.map((p) => [p.id, p]))

    let subtotal = 0
    for (const item of items) {
      const product = productById[item.id]
      const qty = Number(item.qty) || 0
      if (qty <= 0) throw new Error(`Số lượng không hợp lệ cho sản phẩm "${product.title}".`)
      if (product.stock != null && qty > product.stock) {
        throw new Error(`"${product.title}" chỉ còn ${product.stock} sản phẩm trong kho.`)
      }
      subtotal += Number(product.price) * qty
    }

    // 4. Nếu có voucher, validate và tính discount TỪ DATABASE — không tin
    // discount_type/discount_value nào client tự gửi lên.
    let discount = 0
    if (voucherCode) {
      const { data: voucher, error: voucherError } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', voucherCode)
        .eq('is_active', true)
        .maybeSingle()

      if (voucherError) throw voucherError
      if (!voucher) {
        throw new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn.')
      }
      if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
        throw new Error('Mã giảm giá đã hết hạn.')
      }
      if (voucher.usage_limit != null && voucher.used_count >= voucher.usage_limit) {
        throw new Error('Mã giảm giá đã hết lượt sử dụng.')
      }

      discount = voucher.discount_type === 'percent'
        ? subtotal * (Number(voucher.discount_value) / 100)
        : Number(voucher.discount_value)
    }

    const total = Math.max(0, subtotal + SHIPPING_FEE - discount)
    const amount = total.toFixed(2)

    // 5. Lấy Access Token từ PayPal (giữ nguyên logic cũ)
    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')
    const PAYPAL_SECRET_KEY = Deno.env.get('PAYPAL_SECRET_KEY')
    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`)
    const tokenRes = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    })
    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    // 6. Ra lệnh cho PayPal tạo form thu tiền — dùng "amount" vừa TÍNH LẠI
    // ở server, không phải giá trị client gửi lên.
    const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
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
            value: amount
          }
        }]
      })
    })
    const orderData = await orderRes.json()

    // 7. Trả về form Order của PayPal CỘNG THÊM chi tiết giá đã tính, để
    // client hiển thị con số khớp với con số thật server vừa chốt.
    return new Response(JSON.stringify({
      ...orderData,
      computed: { subtotal, shipping: SHIPPING_FEE, discount, total }
    }), {
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