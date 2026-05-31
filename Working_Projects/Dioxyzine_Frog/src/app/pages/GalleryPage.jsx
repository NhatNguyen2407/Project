import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useProducts } from '../context/ProductContext';

export function GalleryPage() {
  const { lang } = useLanguage();
  const { products, loading } = useProducts();
  
  // Quản lý vị trí ảnh đang mở bằng Index trong màng lọc hiện tại
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  // Tự động gom tất cả ảnh từ Database của Google Sheets
  const galleryItems = useMemo(() => {
    if (!products || products.length === 0) return [];
    let items = [];
    products.forEach(product => {
      // Lấy ảnh bìa
      if (product.image) {
        items.push({ src: product.image, alt: product.title[lang] || product.title.vi, category: product.category[0] || 'Customize' });
      }
      // Lấy ảnh bộ sưu tập
      if (product.images && product.images.length > 0) {
        product.images.forEach((img, idx) => {
          if (img !== product.image) {
            items.push({ src: img, alt: `${product.title[lang] || product.title.vi} - ${idx + 1}`, category: product.category[0] || 'Customize' });
          }
        });
      }
    });
    return items;
  }, [products, lang]);

  const filters = ['All', ...new Set(galleryItems.map(item => item.category))];
  
  // Danh sách ảnh sau khi đã lọc theo Tab
  const filteredItems = activeFilter === 'All' ? galleryItems : galleryItems.filter(item => item.category === activeFilter);

  // Định nghĩa vật phẩm đang được chọn để phóng to
  const selectedItem = selectedIndex !== null ? filteredItems[selectedIndex] : null;

  // Hàm chuyển đổi ảnh Tiến / Lùi thông minh
  const handlePrev = (e) => {
    e.stopPropagation(); // Ngăn chặn đóng modal ngầm
    setSelectedIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation(); // Ngăn chặn đóng modal ngầm
    setSelectedIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">
            {lang === 'vi' ? 'Thư Viện Ảnh' : 'Gallery'}
          </h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            {lang === 'vi' ? 'Khám phá các sản phẩm thực tế đã được sản xuất tại xưởng' : 'Explore actual products manufactured at our workshop'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-24 text-[var(--primary)] font-bold text-xl animate-pulse">
            Đang đồng bộ thư viện ảnh... (Loading gallery...)
          </div>
        ) : (
          <>
            {/* Bộ Lọc */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setSelectedIndex(null); // Reset ảnh đang phóng to nếu đổi bộ lọc
                  }}
                  className={`px-6 py-2 rounded-full font-medium transition-all cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-[var(--primary)] text-white shadow-md'
                      : 'bg-[var(--card)] text-[var(--silver-gray)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-white'
                  }`}
                >
                  {filter === 'All' ? (lang === 'vi' ? 'Tất Cả' : 'All') : filter}
                </button>
              ))}
            </div>

            {/* Lưới Ảnh Thu Nhỏ */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={index}
                  layoutId={`gallery-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-[var(--cyber-black)] cursor-pointer shadow-lg"
                  onClick={() => setSelectedIndex(index)}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* MODAL PHÓNG TO ẢNH NÂNG CẤP SLIDER & FIX NÚT X ĐÈ NAVBAR */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)} // Click vào vùng trống nền đen để tắt modal
            // Nâng z-index lên [150] để đè bẹp hoàn toàn Navbar, tăng padding dọc để đẩy ảnh xuống cân đối
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 p-6 md:p-24 backdrop-blur-sm cursor-pointer select-none"
          >
            {/* NÚT X ĐÃ ĐƯỢC ĐẨY THẤP XUỐNG DƯỚI NAVBAR (An toàn tuyệt đối) */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Chặn sự kiện tắt modal lan truyền vào div nền
                setSelectedIndex(null);
              }}
              // Đổi thành top-28 md:top-32 để đẩy nút xuống dưới Navbar, thêm cursor-pointer hiển thị ngón tay
              className="absolute top-28 right-6 md:right-12 p-3 rounded-full bg-white/10 hover:bg-[var(--primary)] text-white transition-colors z-[170] cursor-pointer shadow-xl border border-white/5"
            >
              <X className="w-7 h-7 md:w-8 md:h-8" />
            </button>

            {/* HỆ THỐNG NÚT QUAY ẢNH NEXT / PREV Ở HAI BÊN RÌA MÀN HÌNH */}
            <button
              onClick={handlePrev}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-[var(--primary)] hover:scale-110 text-white transition-all z-[170] cursor-pointer shadow-lg border border-white/5"
            >
              <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-[var(--primary)] hover:scale-110 text-white transition-all z-[170] cursor-pointer shadow-lg border border-white/5"
            >
              <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
            </button>

            {/* Khung chứa ảnh phóng to */}
            <motion.div
              layoutId={`gallery-${selectedIndex}`}
              className="relative w-full max-w-5xl flex items-center justify-center cursor-default"
              onClick={(e) => e.stopPropagation()} // Click vào ảnh không bị tắt modal
            >
              <img
                src={selectedItem.src}
                alt={selectedItem.alt}
                className="max-w-full max-h-[55vh] md:max-h-[60vh] object-contain rounded-xl drop-shadow-[0_0_30px_rgba(139,114,190,0.3)]"
              />
              
              {/* Dòng chữ mô tả ảnh */}
              <div className="absolute -bottom-12 left-0 right-0 text-center pointer-events-none">
                <span className="bg-black/60 backdrop-blur-sm text-white px-5 py-2 rounded-full text-sm font-medium border border-white/10 tracking-wide inline-block">
                  {selectedItem.alt}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}