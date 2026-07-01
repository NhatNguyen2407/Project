// src/app/pages/ProductsPage.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { motion } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, Paintbrush, ShoppingBag } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { ReadyUsePage } from './ReadyUsePage';
import { SEO } from '../components/common_components/SEO';

// --- ĐÃ THÊM: Dùng useParams và useNavigate để chạy URL Paths ---
import { useParams, useNavigate } from 'react-router';

const categories = ['All', 'Plushie', 'Doll', 'Customize'];

export function ProductsPage() {
  const location = useLocation();
  const { products, loading } = useProducts();
  
  // Công cụ điều hướng và đọc tham số URL dạng /products/:activeTab
  const navigate = useNavigate();
  const { activeTab: urlTab } = useParams();
  
  // Nếu khách vào /products không có đuôi, mặc định nhận diện là tab 'custom'
  const activeTab = urlTab || 'custom';
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Xử lý đồng bộ nếu từ trang khác nhảy qua có truyền kèm state
  useEffect(() => {
    if (location.state?.tab) {
      navigate(`/products/${location.state.tab}`, { replace: true });
    }
  }, [location.state, navigate]);

  // Hàm chuyển tab đổi URL sạch sẽ: /products/custom hoặc /products/readyuse
  const handleTabChange = (tabName) => {
    navigate(`/products/${tabName}`);
    setSelectedCategory('All');
    setSearchQuery('');
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category.includes(selectedCategory);
    const titleEn = (product.title || '').toLowerCase();
    const matchesSearch = titleEn.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <SEO 
        title="Our Products" 
        description="Explore our full range of high-quality customizable merchandise and ready-to-ship items." 
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl md:text-5xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">Our Products</h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">Explore our full range of high-quality customizable merchandise</p>
        </div>

        {/* CỤM NÚT ĐỔI TAB CHUYỂN PATHS SẠCH SẼ */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <button 
            onClick={() => handleTabChange('custom')}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all duration-300 cursor-pointer ${
              activeTab === 'custom' 
                ? 'bg-[var(--primary)] text-white shadow-[0_0_20px_rgba(139,114,190,0.5)] scale-105' 
                : 'bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[#2C1A29]'
            }`}
          >
            <Paintbrush className="w-5 h-5" />
            Custom Orders
          </button>

          <button 
            onClick={() => handleTabChange('readyuse')}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all duration-300 cursor-pointer ${
              activeTab === 'readyuse' 
                ? 'bg-[var(--primary)] text-white shadow-[0_0_20px_rgba(139,114,190,0.5)] scale-105' 
                : 'bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[#2C1A29]'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            Ready-made Products
          </button>
        </div>

        {/* RENDER NỘI DUNG THEO PATH HIỆN TẠI */}
        {activeTab === 'custom' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full font-medium transition-all cursor-pointer ${
                      selectedCategory === category
                        ? 'bg-[var(--primary)] text-white shadow-md'
                        : 'bg-[var(--card)] text-[var(--silver-gray)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-[var(--card)] border border-[var(--border)] text-white focus:outline-none focus:border-[var(--primary)] transition-colors shadow-sm"
                />
                <Search className="absolute left-4top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              </div>
            </div>
 
            {loading ? (
              <div className="text-center py-24 text-[var(--primary)] font-bold text-xl animate-pulse">
                Fetching data...
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id} id={product.id} title={product.title} image={product.image}
                    basePriceObj={product.priceBrackets?.[0]?.prices} moq={product.moq}
                    category={product.category[0]} pricingType={product.pricingType}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 text-[var(--muted-foreground)] bg-[var(--card)] rounded-3xl border border-[var(--border)]">
                <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-medium">No products found matching your criteria.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <ReadyUsePage />
        )}
      </div>
    </div>
  );
}