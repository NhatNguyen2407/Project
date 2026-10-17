// Stable, unprivileged client request keys. Retry same unchanged form with
// the same key; changing payload starts a fresh logical submission.
import { SubmissionValidationError } from './validation.mjs';
export function getInquirySubmissionKey(previous, payload, userId) {
  const fingerprint = JSON.stringify([payload, userId || null]);
  if (previous?.fingerprint === fingerprint && previous?.key) return previous;
  return { fingerprint, key: crypto.randomUUID() };
}
export function isInquiryIdempotencyKey(value) {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
export async function hashInquiryRecord(row, userId) {
  const bytes = new TextEncoder().encode(JSON.stringify([row, userId || null]));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2,'0')).join('');
}
export async function persistInquiryOnce(admin, { key, row, userId }) {
  if (!isInquiryIdempotencyKey(key)) throw new Error('Invalid idempotency key');
  const hash = await hashInquiryRecord(row, userId);
  const { data, error } = await admin.rpc('create_inquiry_idempotent', {
    p_key:key, p_hash:hash, p_row:row, p_user_id:userId,
  });
  if (error?.code === '23505') return { conflict:true };
  // Ticket expiry, an unconfirmed object or invalid metadata requires a new
  // valid reference, not repeated retries against an unavailable service.
  if (error?.code === '22023') throw new SubmissionValidationError('Invalid inquiry reference');
  if (error || !data?.inquiryId || typeof data.replayed !== 'boolean') {
    throw new Error('Inquiry persistence unavailable');
  }
  return { inquiryId:data.inquiryId, replayed:data.replayed, conflict:false };
}
