export const profileFromUser = user => ({
  fullName: user?.user_metadata?.full_name || '',
  avatarUrl: user?.user_metadata?.avatar_url || '',
  email: user?.new_email || user?.email || '',
});

export function mergeOrderReview(order) {
  const review = Array.isArray(order.order_reviews) ? order.order_reviews[0] : order.order_reviews;
  return review ? { ...order, rating: review.rating, review_comment: review.review_comment, admin_reply: review.admin_reply } : order;
}

export function prepareReorder(previousItems, products, cart = []) {
  if (!Array.isArray(previousItems) || !previousItems.length || !Array.isArray(products)) throw new Error('This order cannot be added to your cart.');
  const items = new Map();
  for (const item of previousItems) {
    const product = products.find(candidate => candidate.id === item.id);
    const qty = Number(item.qty ?? 1);
    if (!product || product.type !== 'readyuse' || !Number.isInteger(qty) || qty <= 0 || !Number.isFinite(Number(product.price)) || Number(product.price) <= 0) {
      throw new Error('Some items are unavailable. Please add available products individually.');
    }
    const key = `${item.id}_${item.selectedSize || 'default'}`;
    items.set(key, { ...product, selectedSize: item.selectedSize, qty: (items.get(key)?.qty || 0) + qty });
  }
  for (const id of new Set([...items.values()].map(item => item.id))) {
    const product = products.find(item => item.id === id);
    if (cart.some(item => item.id === id && Number(item.price) !== Number(product.price))) {
      throw new Error('Product prices changed. Remove matching cart items and try again.');
    }
    const requested = [...items.values()].filter(item => item.id === id).reduce((sum, item) => sum + item.qty, 0);
    const existing = cart.filter(item => item.id === id)
      .reduce((sum, product) => sum + Number(product.qty || 1), 0);
    if (product.stock !== null && product.stock !== undefined && (!Number.isFinite(Number(product.stock)) || Number(product.stock) < requested + existing)) {
      throw new Error('There is not enough stock to reorder these quantities.');
    }
  }
  return [...items.values()];
}

export async function saveCustomerProfile(client, user, form, password, confirmation, avatar, origin) {
  const name = form.fullName.trim();
  const email = form.email.trim();
  if (!name || name.length > 80) throw new Error('Use a display name between 1 and 80 characters.');
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) throw new Error('Enter a valid email address.');
  if (password && password.length < 8) throw new Error('Use at least 8 characters for your new password.');
  if (password && password !== confirmation) throw new Error('The password confirmation does not match.');
  const extensions = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
  if (avatar && (!extensions[avatar.type] || avatar.size <= 0 || avatar.size > 5 * 1024 * 1024)) {
    throw new Error('Choose a PNG, JPEG or WebP avatar up to 5 MB.');
  }
  const assertAccount = async () => {
    const { data, error } = await client.auth.getSession();
    if (error || !user?.id || data?.session?.user?.id !== user.id) throw new Error('Your account changed. Sign in again before saving.');
  };
  await assertAccount();
  let uploadedPath, avatarUrl = form.avatarUrl;
  try {
    if (avatar) {
      uploadedPath = `${user.id}-${crypto.randomUUID()}.${extensions[avatar.type]}`;
      const { error } = await client.storage.from('avatars').upload(uploadedPath, avatar, { contentType: avatar.type });
      if (error) { uploadedPath = null; throw error; }
      avatarUrl = client.storage.from('avatars').getPublicUrl(uploadedPath).data?.publicUrl;
      if (!avatarUrl) throw new Error('Avatar URL unavailable');
      await assertAccount();
    }
    const attributes = { data: { full_name: name, avatar_url: avatarUrl } };
    if (password) attributes.password = password;
    const requestedEmail = profileFromUser(user).email.toLowerCase();
    if (email.toLowerCase() !== requestedEmail) attributes.email = email;
    // A single Auth update avoids saving metadata before a later password/email request fails.
    const { data, error } = await client.auth.updateUser(attributes, { emailRedirectTo: new URL('/profile', origin).href });
    if (error) throw error;
    if (data?.user?.id !== user.id) throw new Error('Update was not confirmed');
    return { user: data.user, emailPending: Boolean(data.user.new_email) };
  } catch (cause) {
    // A lost response may still have saved the avatar. Verify before removing the upload.
    let currentUser;
    try {
      const { data, error } = await client.auth.getUser();
      if (!error && data?.user?.id === user.id) currentUser = data.user;
      if (uploadedPath && currentUser && currentUser.user_metadata?.avatar_url !== avatarUrl) {
        await client.storage.from('avatars').remove([uploadedPath]);
      }
    } catch { /* Keep an upload when its saved state cannot be verified. */ }
    const message = cause?.code === 'weak_password' ? 'Choose a stronger password and try again.'
      : 'Could not confirm all changes. Check your saved details before retrying.';
    throw Object.assign(new Error(message), { currentUser });
  }
}

export async function deleteCustomerAccount(client, userId) {
  const before = await client.auth.getSession();
  if (before.error || !userId || before.data?.session?.user?.id !== userId) throw new Error('Your account changed. Reload before deleting.');
  const { data, error } = await client.functions.invoke('delete-account', { body: { confirmation: 'DELETE', userId } });
  if (error || !data?.success) {
    let details = data;
    try { if (error?.context) details = await error.context.json(); } catch { /* Use a safe fallback. */ }
    throw new Error(details?.error || 'Account deletion could not be confirmed. Please try again or contact support.');
  }
  try {
    const current = await client.auth.getSession();
    if (current.error) return { signedOut: false };
    const currentId = current.data?.session?.user?.id;
    if (currentId !== userId) return { signedOut: !currentId, accountChanged: Boolean(currentId) };
    const result = await client.auth.signOut({ scope: 'local' });
    return { signedOut: !result.error };
  } catch {
    return { signedOut: false };
  }
}
