// Pure validation helpers shared by Supabase Edge Functions and Node regression tests.
// Never use browser-provided user IDs, pricing, payment states or administrative fields.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CAPTCHA_ACTION = 'inquiry_submit';
const MAX_CAPTCHA_AGE_MS = 120_000;

function requiredText(value, max, name) {
  if (typeof value !== 'string') throw new Error(`Invalid ${name}`);
  const cleaned = value.trim();
  if (!cleaned || cleaned.length > max) throw new Error(`Invalid ${name}`);
  return cleaned;
}

function optionalText(value, max, name) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') throw new Error(`Invalid ${name}`);
  const cleaned = value.trim();
  if (cleaned.length > max) throw new Error(`Invalid ${name}`);
  return cleaned || null;
}

function boundedInteger(value, min, max, name) {
  if (typeof value !== 'number' && typeof value !== 'string') {
    throw new Error(`Invalid ${name}`);
  }
  if (typeof value === 'string' && !/^\d+$/.test(value.trim())) {
    throw new Error(`Invalid ${name}`);
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < min || number > max) {
    throw new Error(`Invalid ${name}`);
  }
  return number;
}

export function validateInquiry(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Invalid inquiry');
  }
  const customerEmail = requiredText(raw.customerEmail, 254, 'email').toLowerCase();
  if (!EMAIL.test(customerEmail)) throw new Error('Invalid email');

  const image = requiredText(raw.imageLink, 2048, 'image link');
  let imageUrl;
  try { imageUrl = new URL(image); } catch { throw new Error('Invalid image link'); }
  if (
    imageUrl.protocol !== 'https:' ||
    imageUrl.hostname !== 'res.cloudinary.com' ||
    imageUrl.username || imageUrl.password
  ) throw new Error('Invalid image host');

  return {
    subject: requiredText(raw.subject, 180, 'subject'),
    customer_name: requiredText(raw.customerName, 120, 'name'),
    customer_email: customerEmail,
    contact_info: requiredText(raw.contactInfo, 400, 'contact'),
    product_name: requiredText(raw.productName, 160, 'product'),
    size: optionalText(raw.size, 80, 'size'),
    quantity: boundedInteger(raw.quantity, 1, 100000, 'quantity'),
    accessory_qty: boundedInteger(raw.accessoryQty ?? 0, 0, 200, 'accessories'),
    image_link: imageUrl.href,
    note: optionalText(raw.note, 2500, 'note'),
  };
}

export function validCaptcha(result, allowedHostnames, now = Date.now()) {
  if (!result || result.success !== true || result.action !== CAPTCHA_ACTION) return false;
  if (typeof result.score !== 'number' || !Number.isFinite(result.score) || result.score < 0.5) return false;
  if (typeof result.hostname !== 'string' || !allowedHostnames.includes(result.hostname.toLowerCase())) return false;
  const challengeTime = Date.parse(result.challenge_ts);
  if (!Number.isFinite(challengeTime)) return false;
  const age = now - challengeTime;
  return age >= -30_000 && age <= MAX_CAPTCHA_AGE_MS;
}

export function allowedOrigin(origin, allowedOrigins) {
  return typeof origin === 'string' && allowedOrigins.includes(origin);
}
