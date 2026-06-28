import { createContext, useContext, useState, useEffect } from 'react';
import { pricingMatrix } from '../data/pricingMatrix';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API Link
    const API_URL = 'https://script.google.com/macros/s/AKfycbxx1R4bXW-lA-POuINT2ZMsSBwyB4MLvJX-LOMnnKO0SXjROEODheVkxO2W7mdkGBQR/exec';

    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const formattedProducts = data.map(item => {
          const pricing = pricingMatrix[item.pricingType] || pricingMatrix['contact'];
          
          return {
            id: item.id,
            // Ưu tiên lấy text tiếng Anh, nếu rỗng thì dự phòng lấy các trường cũ
            title: item.title_en || item.title_vi || item.title || '',
            category: item.category ? String(item.category).split(',').map(c => c.trim()) : [],
            moq: Number(item.moq) || 11,
            pricingType: item.pricingType,
            description: item.desc_en || item.desc_vi || item.desc || '',
            note: item.note_en || item.note_vi || item.note || '',
            
            // ĐÃ SỬA: Lấy đúng cột "image" từ Sheets, bọc dự phòng an toàn
            image: item.image || '', 
            
            // ĐÃ SỬA: Ép kiểu về String trước khi split để chống lỗi sập web
            images: item.images_gallery ? String(item.images_gallery).split(',').map(i => i.trim()).filter(i => i) : [],
            
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