import { getInquiryQuantities } from '../_shared/inquiryQuantities.js';

const fields = new Set(['submissionId', 'token', 'termsAccepted', 'subject', 'customerName', 'customerEmail',
  'contactInfo', 'productName', 'productType', 'size', 'quantity', 'accessoryQty', 'imageLink', 'note']);
export const isSubmissionId = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export function validateInquiry(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid inquiry.');
  if (Object.keys(body).some(key => !fields.has(key))) throw new Error('Unsupported inquiry fields.');
  if (!isSubmissionId(body.submissionId)) throw new Error('Please reload the inquiry form.');
  if (body.termsAccepted !== true) throw new Error('Please accept the Terms of Service.');
  const text = (key, label, max, optional = false) => {
    if (optional && body[key] == null) return null;
    if (typeof body[key] !== 'string' || body[key].includes('\0') || body[key].trim().length > max || (!optional && !body[key].trim())) {
      throw new Error(`${label} is missing or too long.`);
    }
    return body[key].trim() || null;
  };
  const token = text('token', 'Security token', 8192);
  const customerEmail = text('customerEmail', 'Email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) throw new Error('Please enter a valid email address.');
  const { quantity, accessoryQty } = getInquiryQuantities(body);
  const imageLink = text('imageLink', 'Design image', 2048);
  let image;
  try { image = new URL(imageLink); } catch { throw new Error('Please upload a valid design image.'); }
  if (image.protocol !== 'https:' || image.hostname !== 'res.cloudinary.com' || image.username || image.password || !/^\/[^/]+\/image\/upload\//.test(image.pathname)) {
    throw new Error('Please upload a valid design image.');
  }
  return { submissionId: body.submissionId.toLowerCase(), token, row: {
    subject: text('subject', 'Subject', 200), customer_name: text('customerName', 'Name', 120),
    customer_email: customerEmail, contact_info: text('contactInfo', 'Contact', 300),
    product_name: text('productName', 'Product', 200), size: text('size', 'Size', 80, true),
    quantity, accessory_qty: accessoryQty, image_link: image.href, note: text('note', 'Notes', 5000, true),
  } };
}
