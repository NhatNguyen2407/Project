// Pure submission input and reCAPTCHA v3 checks shared by Deno and Node tests.
// Never trust request JSON for user_id, payment fields, workflow status or table names.
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,254}\.[^\s@]{2,63}$/;
const ONE_MINUTE = 60_000;

export class SubmissionValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SubmissionValidationError';
  }
}

function requiredText(value, field, maxLength) {
  if (typeof value !== 'string') {
    throw new SubmissionValidationError(`${field} is required.`);
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength || /[\u0000-\u001F\u007F]/.test(trimmed)) {
    throw new SubmissionValidationError(`${field} is invalid.`);
  }
  return trimmed;
}

function optionalText(value, field, maxLength) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value.length > maxLength || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) {
    throw new SubmissionValidationError(`${field} is invalid.`);
  }
  return value.trim() || null;
}

function boundedInteger(value, field, minimum, maximum) {
  if (!/^(0|[1-9]\d*)$/.test(String(value ?? ''))) {
    throw new SubmissionValidationError(`${field} must be an integer.`);
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < minimum || number > maximum) {
    throw new SubmissionValidationError(`${field} is outside allowed limits.`);
  }
  return number;
}

export function validateInquiryPayload(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new SubmissionValidationError('Invalid inquiry payload.');
  }
  const customerEmail = requiredText(input.customerEmail, 'Email', 254).toLowerCase();
  if (!EMAIL.test(customerEmail)) {
    throw new SubmissionValidationError('Email is invalid.');
  }
  const imageLink = requiredText(input.imageLink, 'Image link', 2048);
  let imageUrl;
  try {
    imageUrl = new URL(imageLink);
  } catch {
    throw new SubmissionValidationError('Image link must be a valid HTTPS URL.');
  }
  if (imageUrl.protocol !== 'https:' || imageUrl.username || imageUrl.password ||
      imageUrl.hostname === 'localhost' || imageUrl.hostname.endsWith('.local') ||
      imageUrl.port || !imageUrl.hostname.includes('.')) {
    throw new SubmissionValidationError('Image link must be a valid HTTPS URL.');
  }

  return {
    subject: requiredText(input.subject, 'Subject', 160),
    customer_name: requiredText(input.customerName, 'Customer name', 160),
    customer_email: customerEmail,
    contact_info: requiredText(input.contactInfo, 'Contact information', 250),
    product_name: requiredText(input.productName, 'Product name', 160),
    size: optionalText(input.size, 'Size', 120),
    quantity: boundedInteger(input.quantity, 'Quantity', 1, 100_000),
    accessory_qty: boundedInteger(input.accessoryQty ?? 0, 'Accessory quantity', 0, 100_000),
    image_link: imageUrl.href,
    note: optionalText(input.note, 'Notes', 2000),
  };
}

export function assessRecaptcha(result, { allowedHostnames, minScore = 0.5, now = Date.now(), action = 'inquiry_submit' } = {}) {
  if (!Array.isArray(allowedHostnames) || allowedHostnames.length === 0) {
    return false; // Fail closed if the deployment has no site allowlist.
  }
  if (!result || result.success !== true || result.action !== action) return false;
  if (typeof result.hostname !== 'string' ||
      !allowedHostnames.includes(result.hostname.toLowerCase())) return false;
  if (typeof result.score !== 'number' || !Number.isFinite(result.score) ||
      result.score < minScore || result.score > 1) return false;
  if (typeof result.challenge_ts !== 'string') return false;
  const issuedAt = Date.parse(result.challenge_ts);
  if (!Number.isFinite(issuedAt) || issuedAt - now > 10_000 ||
      now - issuedAt > 2 * ONE_MINUTE) return false;
  return true;
}

export function parseAllowedHostnames(value) {
  if (typeof value !== 'string') return [];
  return [...new Set(value.split(',').map(v => v.trim().toLowerCase()).filter(v =>
    /^[a-z0-9.-]+$/.test(v) && v.includes('.') && !v.startsWith('.') && !v.endsWith('.')
  ))];
}

export function isAllowedRequestOrigin(origin, configuredOrigins) {
  if (!origin || typeof configuredOrigins !== 'string') return false;
  const allowed = configuredOrigins.split(',').map(v => v.trim()).filter(Boolean);
  return allowed.some(candidate => {
    try {
      const parsed = new URL(candidate);
      return parsed.protocol === 'https:' && parsed.origin === candidate && origin === candidate;
    } catch {
      return false;
    }
  });
}

export function validateCaptchaToken(value) {
  return typeof value === 'string' && value.length >= 20 && value.length <= 8192 &&
    !/[\s\u0000-\u001F]/.test(value);
}
