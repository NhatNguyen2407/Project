import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { motion } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, PackageOpen, Paintbrush, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useProducts } from '../context/ProductContext';

const translations = {
  vi: {
    pageTitle: 'Danh Mục Sản Phẩm',
    pageSub: 'Khám phá tất cả các dòng sản phẩm chất lượng cao của chúng tôi',
    allProducts: 'Tất Cả',
    searchPlaceholder: 'Tìm kiếm sản phẩm...',
    noProducts: 'Không tìm thấy sản phẩm nào phù hợp.'
  },
  en: {
    pageTitle: 'Our Products',
    pageSub: 'Explore our full range of high-quality customizable merchandise',
    allProducts: 'All Products',
    searchPlaceholder: 'Search products...',
    noProducts: 'No products found matching your criteria.'
  }
};

const categories = ['All', 'Plushie', 'Doll', 'Customize'];

export function ProductsPage() {
  const { lang } = useLanguage();
  const location = useLocation();
  const { products, loading } = useProducts();
  const t = translations[lang];
  
  // Tự động chọn tab dựa trên tín hiệu từ Navbar (Mặc định là custom)
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'custom');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Lắng nghe thay đổi khi khách bấm Navbar trong lúc đang ở sẵn trang Products
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category.includes(selectedCategory);
    const titleVi = product.title?.vi?.toLowerCase() || '';
    const titleEn = product.title?.en?.toLowerCase() || '';
    const matchesSearch = titleVi.includes(searchQuery.toLowerCase()) || titleEn.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl md:text-5xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">{t.pageTitle}</h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">{t.pageSub}</p>
        </div>

        {/* BỘ NÚT CHUYỂN ĐỔI TAB */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <button 
            onClick={() => setActiveTab('custom')}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'custom' 
                ? 'bg-[var(--primary)] text-white shadow-[0_0_20px_rgba(139,114,190,0.5)] scale-105' 
                : 'bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[#2C1A29]'
            }`}
          >
            <Paintbrush className="w-5 h-5" />
            {lang === 'vi' ? 'Sản Xuất Theo Yêu Cầu' : 'Custom Orders'}
          </button>

          <button 
            onClick={() => setActiveTab('ready')}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'ready' 
                ? 'bg-[var(--primary)] text-white shadow-[0_0_20px_rgba(139,114,190,0.5)] scale-105' 
                : 'bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[#2C1A29]'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            {lang === 'vi' ? 'Sản Phẩm Thiết Kế Sẵn' : 'Ready-made Products'}
          </button>
        </div>

        {/* NỘI DUNG TƯƠNG ỨNG VỚI TAB */}
        {activeTab === 'custom' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Thanh tìm kiếm và bộ lọc của Custom */}
            <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => {
                  const displayCategory = category === 'All' ? t.allProducts : category;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-6 py-2 rounded-full font-medium transition-all ${
                        selectedCategory === category
                          ? 'bg-[var(--primary)] text-white shadow-md'
                          : 'bg-[var(--card)] text-[var(--silver-gray)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-white'
                      }`}
                    >
                      {displayCategory}
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-[var(--card)] border border-[var(--border)] text-white focus:outline-none focus:border-[var(--primary)] transition-colors shadow-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              </div>
            </div>

            {/* Lưới sản phẩm */}
            {loading ? (
              <div className="text-center py-24 text-[var(--primary)] font-bold text-xl animate-pulse">
                Đang đồng bộ dữ liệu (Fetching data from cloud)...
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id} id={product.id} title={product.title} image={product.image}
                    basePriceObj={product.priceBrackets?.[0]?.prices} moq={product.moq}
                    category={product.category[0]} pricingType={product.pricingType}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-24 text-[var(--muted-foreground)] bg-[var(--card)] rounded-3xl border border-[var(--border)]">
                <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-medium">{t.noProducts}</p>
              </div>
            )}
          </motion.div>
        ) : (
          /* Giao diện Coming Soon cho hàng Sẵn */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-24 text-center bg-[#1A1528] border border-[var(--border)] rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.3)]"
          >
            <div className="w-24 h-24 mb-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
              <PackageOpen className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">
              {lang === 'vi' ? 'Gian hàng đang được setup!' : 'Storefront is being set up!'}
            </h3>
            <p className="text-[var(--silver-gray)] text-lg max-w-md px-4 leading-relaxed">
              {lang === 'vi' 
                ? 'Hiện chưa có sản phẩm thiết kế sẵn nào được trưng bày. Vui lòng đợi thêm một thời gian ngắn nữa nhé!' 
                : 'Ready-made products are currently unavailable. Please check back again later!'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}