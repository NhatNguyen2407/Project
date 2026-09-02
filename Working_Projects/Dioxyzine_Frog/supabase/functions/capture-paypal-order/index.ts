import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cùng công tắc với create-paypal-order — mặc định sandbox, chỉ live khi
// PAYPAL_MODE=live được đặt rõ ràng trong Supabase Function Secrets.
const PAYPAL_API_BASE = Deno.env.get('PAYPAL_MODE') === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderID, shipping, cart, voucherId } = await req.json()
    if (!orderID) throw new Error('Thiếu mã đơn hàng PayPal (orderID).')
    if (!shipping || !cart) throw new Error('Thiếu thông tin giao hàng hoặc giỏ hàng.')

    // 1. Xác định người dùng thật sự đang gọi (nếu đã đăng nhập) TỪ JWT mà
    // Supabase tự đính kèm khi client gọi functions.invoke() — không tin
    // bất kỳ user_id nào client có thể tự gửi trong body.
    const authHeader = req.headers.get('Authorization') ?? ''
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_ANON_KEY'),
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user } } = await anonClient.auth.getUser()

    // 2. Lấy Access Token từ PayPal (giống create-paypal-order)
    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')
    const PAYPAL_SECRET_KEY = Deno.env.get('PAYPAL_SECRET_KEY')
    const authStr = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`)
    const tokenRes = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authStr}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    })
    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    // 3. CAPTURE Ở SERVER — đây là điểm mấu chốt của toàn bộ fix. Trước
    // đây, client tự gọi actions.order.capture() qua PayPal JS SDK và tự
    // quyết định "coi như đã thanh toán". Giờ server tự gọi PayPal capture
    // API và tự đọc kết quả — không phụ thuộc vào client báo cáo lại gì cả.
    const captureRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    const captureData = await captureRes.json()

    const captureUnit = captureData?.purchase_units?.[0]?.payments?.captures?.[0]
    const transactionId = captureUnit?.id
    const capturedAmount = captureUnit?.amount?.value

    // 4. XÁC MINH bắt buộc: chỉ coi là đã thanh toán khi PayPal xác nhận
    // rõ ràng trạng thái COMPLETED và có transaction id thật.
    if (captureData?.status !== 'COMPLETED' || captureUnit?.status !== 'COMPLETED' || !transactionId) {
      throw new Error('Thanh toán chưa được PayPal xác nhận hoàn tất. Vui lòng thử lại.')
    }

    // 5. Chỉ TỚI ĐÂY — sau khi đã xác minh tiền thật sự được thu — mới ghi
    // đơn hàng vào database, dùng service role (bỏ qua RLS, ngữ cảnh
    // server đáng tin cậy) để đảm bảo việc ghi không phụ thuộc quyền hạn
    // phía client.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    const orderSummary = cart.map((item) => `${item.qty}x ${item.name}`).join(' | ')
    const totalQty = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)
    const fullAddress = `${shipping.firstName} ${shipping.lastName} - ${shipping.address}, ${shipping.city}, ${shipping.postalCode} (${shipping.countryCode})`
    const fullPhone = `${shipping.phoneCode} ${shipping.phoneNumber}`

    const { error: insertError } = await supabase.from('inquiries').insert([{
      user_id: user ? user.id : null,
      customer_email: shipping.email,
      customer_name: `${shipping.firstName} ${shipping.lastName}`,
      subject: '[READY-MADE] Store Order',
      contact_info: fullPhone,
      image_link: cart[0]?.image || 'N/A',
      product_name: `[READY-MADE] ${orderSummary}`,
      quantity: totalQty,
      status: 'pending',
      shipping_address: fullAddress,
      phone_number: fullPhone,
      // Số tiền ghi vào đơn hàng là số PayPal XÁC NHẬN đã thu, không phải
      // số client tự tính hay tự gửi lên.
      total_amount: Number(capturedAmount),
      payment_method: 'paypal',
      payment_status: 'paid',
      transaction_id: transactionId,
      total_paid: Number(capturedAmount),
    }])

    if (insertError) {
      // Tiền ĐÃ được thu thành công tại thời điểm này. Nếu bước ghi DB lỗi,
      // không được giấu đi như trước — trả rõ ràng transactionId để hỗ trợ
      // đối soát thủ công, thay vì để khách bị trừ tiền mà không ai biết.
      console.error('Payment captured but order insert failed:', insertError, 'transactionId:', transactionId)
      return new Response(JSON.stringify({
        success: false,
        paymentCaptured: true,
        transactionId,
        error: 'Thanh toán đã thành công nhưng lưu đơn hàng thất bại. Vui lòng liên hệ hỗ trợ kèm mã giao dịch này.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 6. Tăng lượt dùng voucher (nếu có) bằng service role.
    if (voucherId) {
      const { error: voucherError } = await supabase.rpc('increment_voucher_usage', { voucher_id: voucherId })
      if (voucherError) console.error('Lỗi khi cập nhật số lượt dùng Voucher:', voucherError)
    }

    return new Response(JSON.stringify({ success: true, transactionId, capturedAmount }), {
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