// Pure, dependency-free helpers for the read-only Admin inquiry inbox.
// Search/filter is local to the Admin screen. No backend write is performed here.
const SEARCHABLE_FIELDS = [
  'id',
  'subject',
  'customer_name',
  'customer_email',
  'contact_info',
  'product_name',
];

export function filterInquiries(inquiries, searchTerm = '') {
  const rows = Array.isArray(inquiries)
    ? inquiries.filter((item) => item && typeof item === 'object')
    : [];

  const needle = typeof searchTerm === 'string'
    ? searchTerm.trim().toLocaleLowerCase()
    : '';

  const matching = needle
    ? rows.filter((item) =>
      SEARCHABLE_FIELDS.some((field) =>
        String(item[field] ?? '').toLocaleLowerCase().includes(needle)
      )
    )
    : rows;

  // Clone first: the Admin state must never be reordered in place.
  return [...matching].sort((first, second) => {
    const firstTime = Date.parse(first.created_at || '') || 0;
    const secondTime = Date.parse(second.created_at || '') || 0;
    return secondTime - firstTime;
  });
}

// External reference links are user-provided; never render executable schemes.
export function safeInquiryReferenceUrl(raw) {
  if (typeof raw !== 'string' || !raw.trim() || raw.length > 2048) {
    return null;
  }

  try {
    const parsed = new URL(raw.trim());
    if (
      parsed.protocol !== 'https:' ||
      !parsed.hostname ||
      parsed.username ||
      parsed.password ||
      parsed.hostname === 'localhost' ||
      parsed.hostname.endsWith('.local')
    ) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

export function formatInquiryTimestamp(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
