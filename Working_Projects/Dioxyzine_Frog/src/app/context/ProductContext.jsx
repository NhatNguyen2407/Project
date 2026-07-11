import { createContext, useContext, useState, useEffect } from 'react';
import { pricingMatrix } from '../data/pricingMatrix';
import { supabase } from '../service/supabase'; // Kéo trực tiếp từ Supabase

const ProductContext = createContext();

const optimizeCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return url;
  if (url.includes('q_auto')) return url; 
  return url.replace('/image/upload/', '/image/upload/q_auto,f_auto,w_600,c_limit/');
};

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

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
        console.error("Lỗi kéo dữ liệu Sản phẩm từ Supabase:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);