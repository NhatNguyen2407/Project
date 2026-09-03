import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Sentry from '@sentry/react';
import { pricingMatrix } from '../data/pricingMatrix';
import { supabase } from '../service/supabase'; // Kéo trực tiếp từ Supabase

const ProductContext = createContext();

const optimizeCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return url;
  if (url.includes('q_auto')) return url; 
  return url.replace('/image/upload/', '/image/upload/q_auto,f_auto,w_600,c_limit/');
};

// Nếu request treo quá lâu (mạng chập chờn, server không phản hồi), tự hủy
// sau 15s thay vì để "loading" mãi mãi không bao giờ kết thúc.
const FETCH_TIMEOUT_MS = 15000;

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // error: null khi ổn, hoặc 1 chuỗi mô tả lỗi khi tải thất bại — tách biệt
  // rõ ràng với "danh mục trống thật sự" (products.length === 0 && !error).
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal);

      if (fetchError) throw fetchError;

      const formattedProducts = data.map(item => {
        const pricing = pricingMatrix[item.pricing_type] || pricingMatrix['contact'];
        
        return {
          id: item.id,
          title: item.title || '',
          category: item.category ? String(item.category).split('|').map(c => c.trim()) : [],
          type: item.type || 'custom',
          moq: Number(item.moq) || 11,
          pricingType: item.pricing_type,
          price: Number(item.price) || 0,
          stock: Number(item.stock) || 0,
          rating: Number(item.rating) || 5.0,
          sold: item.sold || '0',
          description: item.description || '',
          note: item.note || '',
          image: optimizeCloudinaryUrl(item.image_cover || ''),
          images: item.images_gallery ? String(item.images_gallery).split('|').map(i => optimizeCloudinaryUrl(i.trim())).filter(i => i) : [],
          sizes: pricing.sizes,
          priceBrackets: pricing.priceBrackets,
          addons: pricing.addons
        };
      });
      setProducts(formattedProducts);
    } catch (err) {
      const isTimeout = err.name === 'AbortError';
      const message = isTimeout
        ? 'Tải danh sách sản phẩm mất quá lâu, có thể do kết nối mạng chậm.'
        : 'Không thể tải danh sách sản phẩm. Vui lòng thử lại.';
      console.error('Lỗi kéo dữ liệu Sản phẩm từ Supabase:', err);
      Sentry.captureException(err, { tags: { context: 'ProductContext.fetchProducts' } });
      setError(message);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <ProductContext.Provider value={{ products, loading, error, refetch: fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);