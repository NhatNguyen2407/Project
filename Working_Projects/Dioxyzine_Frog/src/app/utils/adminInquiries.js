export function filterAdminInquiries(inquiries, search) {
  const query = search.trim().toLowerCase();
  if (!query) return inquiries;
  return inquiries.filter(inquiry => [
    inquiry.id, inquiry.subject, inquiry.customer_name, inquiry.customer_email, inquiry.product_name,
  ].some(value => String(value ?? '').toLowerCase().includes(query)));
}

export function getInquiryReferenceUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
