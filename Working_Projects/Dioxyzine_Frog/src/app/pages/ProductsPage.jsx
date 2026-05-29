import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { Search } from 'lucide-react';
import { productsData } from '../data/productsData';
import { useLanguage } from '../context/LanguageContext';

const filterCategories = {
  vi: ['Tất Cả', 'Plushie', 'Doll', 'Customize'],
  en: ['All Products', 'Plushie', 'Doll', 'Customize']
};

const translations = {
  vi: { title: 'Danh Mục Sản Phẩm', subTitle: 'Khám phá toàn bộ các dòng sản phẩm gấu bông và merchandise tùy chỉnh', placeholder: 'Tìm kiếm sản phẩm...', showing: 'Đang hiển thị', products: 'sản phẩm', noFound: 'Không tìm thấy sản phẩm phù hợp', clear: 'Xóa Bộ Lọc' },
  en: { title: 'Our Products', subTitle: 'Explore our full range of customizable merchandise and handmade plushies', placeholder: 'Search products...', showing: 'Showing', products: 'products', noFound: 'No products found', clear: 'Clear Filters' }
};

export function ProductsPage() {
  const { lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(lang === 'vi' ? 'Tất Cả' : 'All Products');
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[lang];

  useEffect(() => {
    setSelectedCategory(lang === 'vi' ? 'Tất Cả' : 'All Products');
  }, [lang]);

  const filteredProducts = productsData.filter((product) => {
    const isAll = selectedCategory === 'Tất Cả' || selectedCategory === 'All Products';
    const matchesCategory = isAll || product.category.includes(selectedCategory);
    
    const displayTitle = product.title?.[lang] || product.title?.vi || '';
    const matchesSearch = searchQuery === '' || displayTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white drop-shadow-[0_0_10px_rgba(139,114,190,0.4)]">{t.title}</h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">{t.subTitle}</p>
        </div>

        <div className="mb-12 space-y-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
            <input
              type="text" placeholder={t.placeholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-[#09090B] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] shadow-md transition-all"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {filterCategories[lang].map((category) => (
              <button
                key={category} onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-[var(--primary)] text-white shadow-[0_0_15px_rgba(139,114,190,0.5)] scale-105'
                    : 'bg-[#130D1E] text-[var(--muted-foreground)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-[var(--muted-foreground)]">
            {t.showing} <span className="font-semibold text-white">{filteredProducts.length}</span> {t.products}
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} id={product.id} title={product.title} image={product.image}
                basePriceObj={product.priceBrackets?.[0]?.prices} moq={product.moq}
                category={product.category[0]} pricingType={product.pricingType}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-[#130D1E] rounded-3xl border border-[var(--border)]">
            <h3 className="text-2xl font-semibold mb-3 text-white">{t.noFound}</h3>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory(lang === 'vi' ? 'Tất Cả' : 'All Products'); }} className="px-6 py-3 rounded-full bg-[var(--primary)] text-white font-semibold cursor-pointer">
              {t.clear}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}