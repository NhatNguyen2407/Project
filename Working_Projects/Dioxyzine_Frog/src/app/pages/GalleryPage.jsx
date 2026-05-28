import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { X, ZoomIn } from 'lucide-react';
import { productsData } from '../data/productsData';
import { useLanguage } from '../context/LanguageContext';

export function GalleryPage() {
  const { lang } = useLanguage();
  const defaultCategory = lang === 'vi' ? 'Tất cả' : 'All';
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Khi đổi ngôn ngữ, reset bộ lọc về "Tất cả" để tránh lỗi kẹt thẻ cũ
  useEffect(() => {
    setSelectedCategory(lang === 'vi' ? 'Tất cả' : 'All');
  }, [lang]);

  // Tự động bóc tách dữ liệu từ productsData theo ngôn ngữ hiện tại
  const { galleryItems, categories } = useMemo(() => {
    const items = [];
    const cats = [lang === 'vi' ? 'Tất cả' : 'All'];
    let idCounter = 1;

    productsData.forEach((product) => {
      // Lấy tên sản phẩm theo ngôn ngữ để làm category
      const productTitle = product.title?.[lang] || product.title?.vi || 'Unknown';
      cats.push(productTitle);
      
      if (product.images && product.images.length > 0) {
        product.images.forEach((img) => {
          items.push({
            id: idCounter++,
            image: img,
            category: productTitle,
            title: productTitle,
          });
        });
      }
    });

    return { galleryItems: items, categories: cats };
  }, [lang]); // Chạy lại khi đổi ngôn ngữ

  const filteredItems =
    (selectedCategory === 'Tất cả' || selectedCategory === 'All')
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-heading text-5xl md:text-6xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">
            {lang === 'vi' ? 'Thư Viện Sản Phẩm' : 'Product Gallery'}
          </h1>
          <p className="text-lg text-[var(--silver-gray)] max-w-2xl mx-auto">
            {lang === 'vi' 
              ? 'Khám phá chi tiết các dự án và sản phẩm thực tế đã được gia công bởi Dioxyzine Frog'
              : 'Explore the details of real projects and products crafted by Dioxyzine Frog'}
          </p>
        </motion.div>

        {/* Thanh Lọc Danh Mục */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-[var(--primary)] text-white shadow-[0_0_15px_rgba(139,114,190,0.5)] scale-105'
                  : 'bg-[var(--cyber-black)] text-[var(--silver-gray)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-white hover:scale-105'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Lưới hiển thị ảnh (Masonry Layout) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
              <Masonry gutter="1.5rem">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (index % 10) * 0.05 }}
                    className="group relative cursor-pointer"
                    onClick={() => setLightboxImage(item.id)}
                  >
                    <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-[#08080C]/90 via-[#08080C]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <span className="inline-block px-3 py-1 rounded-full bg-[var(--primary)]/20 backdrop-blur-md text-white text-xs font-medium mb-2 border border-[var(--primary)]/50">
                            {item.category}
                          </span>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <div className="w-16 h-16 rounded-full bg-[var(--primary)]/20 backdrop-blur-md flex items-center justify-center border border-[var(--primary)]/50 scale-0 group-hover:scale-100 transition-transform duration-300 delay-100">
                            <ZoomIn className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </Masonry>
            </ResponsiveMasonry>
          </motion.div>
        </AnimatePresence>

        {/* Chế độ xem toàn màn hình (Lightbox) */}
        <AnimatePresence>
          {lightboxImage !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-[#08080C]/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
              onClick={() => setLightboxImage(null)}
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[var(--primary)] transition-colors z-[110]"
              >
                <X className="w-6 h-6" />
              </button>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center"
              >
                {galleryItems.find((item) => item.id === lightboxImage) && (
                  <>
                    <img
                      src={galleryItems.find((item) => item.id === lightboxImage)?.image}
                      alt={galleryItems.find((item) => item.id === lightboxImage)?.title}
                      className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-2xl shadow-[0_0_30px_rgba(139,114,190,0.3)] border border-[var(--border)]"
                    />
                    <div className="text-center mt-6">
                      <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium shadow-[0_0_15px_rgba(139,114,190,0.5)]">
                        {galleryItems.find((item) => item.id === lightboxImage)?.category}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}