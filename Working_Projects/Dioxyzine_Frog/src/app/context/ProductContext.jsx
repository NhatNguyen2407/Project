import { createContext, useContext, useState, useEffect } from 'react';
import { pricingMatrix } from '../data/pricingMatrix';

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
    // API
    const API_URL = 'https://script.google.com/macros/s/AKfycbwuex1g0XqvFfM1lf79CqmZ_oBzRGTGBTt27pjduIw7ZeIROJmU6AA2oRfVXGW3JD-P/exec';

    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const formattedProducts = data.map(item => {
          const pricing = pricingMatrix[item.pricingType] || pricingMatrix['contact'];
          
          return {
            id: item.id,
            title: item.title_en || item.title_vi || item.title || '',
            category: item.category ? String(item.category).split(',').map(c => c.trim()) : [],
            moq: Number(item.moq) || 11,
            pricingType: item.pricingType,
            description: item.desc_en || item.desc_vi || item.desc || '',
            note: item.note_en || item.note_vi || item.note || '',
            
            //cover photo for poducts
            image: optimizeCloudinaryUrl(item.image_cover || item.image || ''),
            
            // sub images in product
            images: item.images_gallery ? String(item.images_gallery).split(',').map(i => optimizeCloudinaryUrl(i.trim())).filter(i => i) : [],
            
            sizes: pricing.sizes,
            priceBrackets: pricing.priceBrackets,
            addons: pricing.addons
          };
        });
        setProducts(formattedProducts);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data from Google Sheets:", err);
        setLoading(false);
      });
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);