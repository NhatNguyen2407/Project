import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SHIPPING_FEE = 15

const PAYPAL_API_BASE = Deno.env.get('PAYPAL_MODE') === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

function normalizeItems(items: unknown) {
  if (!Array.isArray(items)) {
    throw new Error('Giỏ hàng trống hoặc không hợp lệ.')
  }

  const quantities = new Map<string, number>()

  for (const item of items) {
    if (!item || typeof item !== 'object') {
      throw new Error('Giỏ hàng không hợp lệ.')
    }

    const id = String(item.id || '').trim()
    const qty = Number(item.qty)

    if (!id) {
      throw new Error('Sản phẩm không có ID hợp lệ.')
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      throw new Error(`Số lượng không hợp lệ cho sản phẩm "${id}".`)
    }

    quantities.set(id, (quantities.get(id) || 0) + qty)
  }

  return [...quantities.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, qty]) => ({ id, qty }))
}

async function createFingerprint(
  items: Array<{ id: string; qty: number }>,
  voucherCode: string | null
) {
  const canonical = JSON.stringify({
    items,
    voucherCode: voucherCode || null,
  })

  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(canonical)
  )

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { items: rawItems, voucherCode } = await req.json()

    const normalizedItems = normalizeItems(rawItems)

    const normalizedVoucherCode =
      typeof voucherCode === 'string' && voucherCode.trim()
        ? voucherCode.trim()
        : null

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    const productIds = normalizedItems.map((item) => item.id)

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, stock, title')
      .in('id', productIds)

    if (productsError) throw productsError

    if (!products || products.length !== productIds.length) {
      throw new Error('Một hoặc nhiều sản phẩm trong giỏ hàng không còn tồn tại.')
    }

    const productById = Object.fromEntries(
      products.map((product) => [product.id, product])
    )

    let subtotal = 0

    for (const item of normalizedItems) {
      const product = productById[item.id]

      if (item.qty > product.stock) {
        throw new Error(
          `"${product.title}" chỉ còn ${product.stock} sản phẩm trong kho.`
        )
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

      if (!voucher) {
        throw new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn.')
      }

      if (
        voucher.expires_at &&
        new Date(voucher.expires_at) < new Date()
      ) {
        throw new Error('Mã giảm giá đã hết hạn.')
      }

      if (
        voucher.usage_limit != null &&
        voucher.used_count >= voucher.usage_limit
      ) {
        throw new Error('Mã giảm giá đã hết lượt sử dụng.')
      }

      discount =
        voucher.discount_type === 'percent'
          ? subtotal * (Number(voucher.discount_value) / 100)
          : Number(voucher.discount_value)
    }

    const total = Math.max(
      0,
      subtotal + SHIPPING_FEE - discount
    )

    const amount = total.toFixed(2)

    const fingerprint = await createFingerprint(
      normalizedItems,
      normalizedVoucherCode
    )

    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')
    const PAYPAL_SECRET_KEY = Deno.env.get('PAYPAL_SECRET_KEY')

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) {
      throw new Error('PayPal credentials chưa được cấu hình.')
    }

    const auth = btoa(
      `${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`
    )

    const tokenRes = await fetch(
      `${PAYPAL_API_BASE}/v1/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      }
    )

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('PayPal token error:', tokenData)
      throw new Error('Không thể kết nối tới PayPal.')
    }

    const accessToken = tokenData.access_token

    const orderRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            custom_id: fingerprint,
            amount: {
              currency_code: 'USD',
              value: amount,
            },
          }],
        }),
      }
    )

    const orderData = await orderRes.json()

    if (!orderRes.ok || !orderData.id) {
      console.error('PayPal create order error:', orderData)
      throw new Error(
        orderData?.message || 'Không thể tạo PayPal order.'
      )
    }

    return new Response(
      JSON.stringify({
        ...orderData,
        computed: {
          subtotal,
          shipping: SHIPPING_FEE,
          discount,
          total,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('create-paypal-order error:', error)

    return new Response(
      JSON.stringify({
        error: error instanceof Error
          ? error.message
          : 'Không thể tạo PayPal order.',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    )
  }
})