export function getProductUrl(product, category) {
  if (product.type === 'readyuse') return `/products/readyuse/${product.id}`;
  if (category) return `/products/custom/${category}/${product.id}`;
  return `/product/${product.id}`;
}

export function filterCustomProducts(products, { category = 'All', search = '', cutStyle = 'All' } = {}) {
  return products.filter(product =>
    product.type === 'custom' &&
    (category === 'All' || product.category.includes(category)) &&
    (product.title || '').toLowerCase().includes(search.toLowerCase()) &&
    (category !== 'Plushie' || cutStyle === 'All' || product.cut_style === cutStyle)
  );
}
