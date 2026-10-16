// Canonical order reviews are mirrored by DB triggers into legacy Inquiry rows.
// Do not show both versions or write to both tables.
const isReview = value => value && typeof value.id === 'string' && value.id.length > 0
  && Number.isInteger(Number(value.rating)) && Number(value.rating) >= 1 && Number(value.rating) <= 5;
const productName = names => Array.isArray(names)
  ? (names.filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim()).join(', ') || 'Product Review')
  : 'Product Review';

export function buildAdminReviewRows(inquiries, orderReviews) {
  const canonical = Array.isArray(orderReviews) ? orderReviews.filter(isReview) : [];
  const canonicalIds = new Set(canonical.map(x=>x.id));
  const primary = canonical.map(x=>({...x,sourceTable:'order_reviews',display_product_name:productName(x.product_names)}));
  const legacy = (Array.isArray(inquiries)?inquiries:[])
    .filter(x=>isReview(x)&&!(x.order_review_id&&canonicalIds.has(x.order_review_id)))
    .map(x=>({...x,sourceTable:'inquiries',display_product_name:x.product_name||'Legacy Inquiry Review'}));
  const timestamp = x=>{const v=Date.parse(x.created_at||'');return Number.isFinite(v)?v:0};
  return [...primary,...legacy].sort((a,b)=>timestamp(b)-timestamp(a));
}

export function requireAdminReviewTable(review) {
  if (!review || typeof review.id!=='string' || !review.id.trim()) throw new Error('Review ID is required.');
  if (review.sourceTable==='order_reviews' || review.sourceTable==='inquiries') return review.sourceTable;
  throw new Error('Unknown review source.');
}
