// Các hàm bắn sự kiện chuyển đổi (conversion events) cho GA4 và Facebook
// Pixel — dùng chung 1 chỗ để không phải lặp lại logic ở nhiều trang.
// Không gửi bất kỳ thông tin cá nhân nào của khách (không tên, không email,
// không số điện thoại) — chỉ gửi dữ liệu về đơn hàng/sản phẩm.

export function trackAddToCart(product, qty) {
  const value = Number(product.price) * qty;

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'add_to_cart', {
      currency: 'USD',
      value,
      items: [{ item_id: product.id, item_name: product.title, quantity: qty, price: product.price }],
    });
  }

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'AddToCart', {
      content_ids: [product.id],
      content_name: product.title,
      content_type: 'product',
      currency: 'USD',
      value,
    });
  }
}

export function trackInitiateCheckout(cart, total) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: total,
      items: cart.map((item) => ({ item_id: item.id, item_name: item.title, quantity: item.qty, price: item.price })),
    });
  }

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: cart.map((item) => item.id),
      content_type: 'product',
      currency: 'USD',
      value: total,
      num_items: cart.reduce((sum, item) => sum + item.qty, 0),
    });
  }
}

export function trackPurchase(transactionId, value, cart) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      currency: 'USD',
      value,
      items: (cart || []).map((item) => ({ item_id: item.id, item_name: item.name, quantity: item.qty })),
    });
  }

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', {
      content_ids: (cart || []).map((item) => item.id),
      content_type: 'product',
      currency: 'USD',
      value,
    });
  }
}