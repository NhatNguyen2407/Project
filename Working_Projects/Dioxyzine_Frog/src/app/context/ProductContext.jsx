import { createContext, useContext, useState, useEffect } from 'react';
import { pricingMatrix } from '../data/pricingMatrix';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API Link từ Google Sheets của bro
    const API_URL = 'https://script.google.com/macros/s/AKfycbyH0YC_0k5BqYHW1gvftYAjvxmu3CNoBLzHmDur9-s92EIUcePQpSU43tfXgpLs-CiA/exec';

    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const formattedProducts = data.map(item => {
          const pricing = pricingMatrix[item.pricingType] || pricingMatrix['contact'];
          
          return {
            id: item.id,
            title: { vi: item.title_vi, en: item.title_en },
            category: item.category ? item.category.split(',').map(c => c.trim()) : [],
            moq: Number(item.moq) || 11,
            pricingType: item.pricingType,
            description: { vi: item.desc_vi, en: item.desc_en },
            note: { vi: item.note_vi, en: item.note_en },
            image: item.image_cover,
            images: item.images_gallery ? item.images_gallery.split(',').map(i => i.trim()).filter(i => i) : [],
            sizes: pricing.sizes,
            priceBrackets: pricing.priceBrackets,
            addons: pricing.addons
          };
        });
        setProducts(formattedProducts);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi tải dữ liệu từ Google Sheets:", err);
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