import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const PAYPAL_API_BASE =
  Deno.env.get('PAYPAL_MODE') === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

const normalizeItems = (items: any[]) =>
  [...items.reduce((map, item) => {
    if (
      !item ||
      typeof item.id !== 'string' ||
      !Number.isInteger(item.qty) ||
      item.qty <= 0
    ) throw new Error('Invalid cart item');

    map.set(item.id.trim(), (map.get(item.id.trim()) || 0) + item.qty);
    return map;
  }, new Map())]
    .map(([id, qty]) => ({ id, qty }))
    .sort(([a], [b]) => a.localeCompare(b));

async function fingerprint(items: any[], voucherCode: string | null) {
  const data = new TextEncoder().encode(
    JSON.stringify({ items, voucherCode: voucherCode || null }),
  );
  const hash = await crypto.subtle.digest('SHA-256', data);

  return [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function paypalToken() {
  const id = Deno.env.get('PAYPAL_CLIENT_ID');
  const secret = Deno.env.get('PAYPAL_SECRET_KEY');

  if (!id || !secret) throw new Error('PayPal credentials missing');

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error('PayPal authentication failed');

  const data = await res.json();
  if (!data.access_token) throw new Error('PayPal access token missing');

  return data.access_token;
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !serviceKey || !anonKey) {
      throw new Error('Supabase configuration missing');
    }

    // Guest checkout is supported. If a signed-in user is present, keep
    // their user id; otherwise the order is stored with user_id = null.
    let userId: string | null = null;
    const auth = req.headers.get('Authorization');

    if (auth) {
      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: auth } },
      });

      const { data: { user } } = await authClient.auth.getUser();
      if (user) userId = user.id;
    }

    const {
      orderID,
      shipping,
      cart,
      voucherCode,
    } = await req.json();

    if (!orderID) throw new Error('PayPal order ID is required');

    const items = normalizeItems(cart);
    const code =
      typeof voucherCode === 'string' && voucherCode.trim()
        ? voucherCode.trim()
        : null;

    const token = await paypalToken();

    const orderRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderID)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const paypalOrder = await orderRes.json();

    if (!orderRes.ok) {
      throw new Error('Unable to verify PayPal order');
    }

    const expectedFingerprint = await fingerprint(items, code);
    const paypalFingerprint =
      paypalOrder?.purchase_units?.[0]?.custom_id;

    if (paypalFingerprint !== expectedFingerprint) {
      throw new Error('PayPal order does not match the cart');
    }

    const captureRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const capture = await captureRes.json();

    if (!captureRes.ok || capture.status !== 'COMPLETED') {
      throw new Error('PayPal payment was not completed');
    }

    const captureUnit =
      capture?.purchase_units?.[0]?.payments?.captures?.[0];

    if (captureUnit?.status !== 'COMPLETED' || !captureUnit.id) {
      throw new Error('PayPal payment capture is incomplete');
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const customerName =
      `${shipping?.firstName || ''} ${shipping?.lastName || ''}`.trim();

    const shippingAddress = [
      shipping?.address,
      shipping?.city,
      shipping?.postalCode,
      shipping?.countryCode,
    ]
      .filter(Boolean)
      .join(', ');

    const phone = [
      shipping?.phoneCode,
      shipping?.phoneNumber,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    const customerEmail =
      shipping?.email?.trim() || null;

    const { data: orderId, error } = await supabase.rpc(
      'process_paid_order',
      {
        p_user_id: userId,
        p_customer_name: customerName,
        p_customer_email: customerEmail,
        p_phone_number: phone || null,
        p_shipping_address: shippingAddress || null,
        p_total_amount: Number(captureUnit.amount?.value),
        p_transaction_id: captureUnit.id,
        p_cart_items: items,
        p_voucher_code: code,
      },
    );

    if (error) {
      console.error('Order processing failed:', error);

      return new Response(
        JSON.stringify({
          success: false,
          paymentCaptured: true,
          transactionId: captureUnit.id,
          error:
            'Payment was captured but the order could not be recorded.',
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        transactionId: captureUnit.id,
        capturedAmount: Number(captureUnit.amount?.value),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('capture-paypal-order:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error
          ? error.message
          : 'Payment capture failed',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});