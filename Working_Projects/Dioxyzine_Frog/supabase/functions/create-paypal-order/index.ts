import { createClient } from "npm:@supabase/supabase-js@2.110.0"
import { normalizePayPalItems, payPalServerEnvironment, storedPayPalId, assertStagingPaymentCaller } from '../_shared/paypalIntegrity.mjs'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SHIPPING_FEE = 15
const RESERVATION_MINUTES = 30

async function createFingerprint(
  items: Array<{ id: string; qty: number }>,
  voucherCode: string | null
) {
  const canonical = JSON.stringify({ items, voucherCode: voucherCode || null })
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical))
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const config = payPalServerEnvironment(Deno.env.get('SUPABASE_URL'),Deno.env.get('PAYPAL_MODE'),Deno.env.get('PAYPAL_STAGING_ENABLED'))
    assertStagingPaymentCaller(req,config,Deno.env.get('PAYPAL_PUBLIC_API_KEY'),Deno.env.get('PAYPAL_ALLOWED_ORIGIN'))
    const PAYPAL_API_BASE = config.base
    const { items: rawItems, voucherCode } = await req.json()
    const normalizedItems = normalizePayPalItems(rawItems, { coerceQuantities: true })
    const normalizedVoucherCode =
      typeof voucherCode === 'string' && voucherCode.trim() ? voucherCode.trim() : null

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceKey) throw new Error('Supabase configuration missing')
    const supabase = createClient(supabaseUrl, serviceKey)

    const productIds = normalizedItems.map((item) => item.id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, stock, title')
      .in('id', productIds)

    if (productsError) throw productsError
    if (!products || products.length !== productIds.length) {
      throw new Error('Một hoặc nhiều sản phẩm trong giỏ hàng không còn tồn tại.')
    }

    const productById = Object.fromEntries(products.map((product) => [product.id, product]))
    let subtotal = 0

    for (const item of normalizedItems) {
      const product = productById[item.id]
      if (item.qty > product.stock) {
        throw new Error(`"${product.title}" chỉ còn ${product.stock} sản phẩm trong kho.`)
      }
      subtotal += Number(product.price) * item.qty
    }

    let discount = 0
    if (normalizedVoucherCode) {
      const { data: voucher, error: voucherError } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', normalizedVoucherCode)
        .eq('is_active', true)
        .maybeSingle()
      if (voucherError) throw voucherError
      if (!voucher) throw new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn.')
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
    const fingerprint = await createFingerprint(normalizedItems, normalizedVoucherCode)

    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')
    const PAYPAL_SECRET_KEY = Deno.env.get('PAYPAL_SECRET_KEY')
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) throw new Error('PayPal credentials chưa được cấu hình.')

    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`)
    const tokenRes = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('PayPal token error:', tokenData)
      throw new Error('Không thể kết nối tới PayPal.')
    }

    const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          custom_id: fingerprint,
          amount: { currency_code: 'USD', value: amount },
        }],
      }),
    })

    const orderData = await orderRes.json()
    if (!orderRes.ok || !orderData.id) {
      console.error('PayPal create order error:', orderData)
      throw new Error(orderData?.message || 'Không thể tạo PayPal order.')
    }

    const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000).toISOString()
    const { error: reservationError } = await supabase.rpc(config.reserveRpc, {
      p_paypal_order_id: storedPayPalId(orderData.id,config.staging),
      p_items: normalizedItems,
      p_expires_at: expiresAt,
    })

    if (reservationError) {
      console.error('Stock reservation failed:', reservationError)
      throw new Error(reservationError.message || 'Sản phẩm vừa hết hàng. Vui lòng thử lại.')
    }

    return new Response(JSON.stringify({
      ...orderData,
      computed: { subtotal, shipping: SHIPPING_FEE, discount, total },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('create-paypal-order error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Không thể tạo PayPal order.',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
