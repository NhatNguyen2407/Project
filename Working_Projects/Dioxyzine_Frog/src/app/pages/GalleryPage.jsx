import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { SEO } from '../components/common_components/SEO';
import { SmartImage } from '../components/common_components/SmartImage';

const categories = ['All', 'Plushie', 'Doll', 'Customize'];
const ITEMS_PER_PAGE = 16; 

export function GalleryPage() {
  const { products, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);

  const galleryItems = useMemo(() => {
    let items = [];
    products.forEach(product => {
      const displayCategory = product.category[0] || 'Customize';

      if (product.images && product.images.length > 0) {
        product.images.forEach((img, idx) => {
          items.push({ 
            id: `${product.id}-${idx}`, 
            image: img, 
            title: product.title, 
            category: displayCategory 
          });
        });
      }
    });
    return items;
  }, [products]);

  const filteredItems = galleryItems.filter(item => selectedCategory === 'All' || item.category === selectedCategory);
  
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); 
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background relative z-10">
      <SEO title="Product Gallery" description="Explore the real-life premium plushies and custom merchandise." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER Đã sửa màu chữ tương phản */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl mb-4 text-foreground drop-shadow-sm">Gallery</h1>
          <p className="text-lg text-muted-foreground font-medium">Realized concepts and final products from our workshop</p>
        </div>

        {/* BỘ LỌC CATEGORY */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category} onClick={() => handleCategoryChange(category)}
              className={`px-6 py-2 rounded-full font-bold transition-all cursor-pointer shadow-sm ${
                selectedCategory === category
                  ? 'bg-[var(--primary)] text-white scale-105'
                  : 'bg-card text-muted-foreground border border-border hover:border-[var(--primary)] hover:text-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          /* 🚀 SKELETON LOADING GRID */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in duration-500">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i} 
                className="relative aspect-square rounded-2xl md:rounded-3xl bg-muted animate-pulse border border-border shadow-sm"
              ></div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <>
            {/* LƯỚI HÌNH ẢNH */}
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {currentItems.map((item) => (
                  <motion.div
                    layout key={item.id} 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}
                    className="relative aspect-square group rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer bg-muted border border-border shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => setSelectedImage(item)}
                  >
                    <SmartImage src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 opacity-90 group-hover:opacity-100 transition-all duration-500" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* PHÂN TRANG (PAGINATION) */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16">
                <button
                  onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                  className="p-3 rounded-xl bg-card border border-border text-foreground disabled:opacity-30 hover:bg-secondary transition cursor-pointer shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    if (totalPages > 6) {
                      if (page !== 1 && page !== totalPages && Math.abs(currentPage - page) > 1) {
                        if (page === 2 || page === totalPages - 1) return <span key={page} className="text-muted-foreground font-bold self-end">...</span>;
                        return null;
                      }
                    }
                    return (
                      <button
                        key={page} onClick={() => goToPage(page)}
                        className={`w-11 h-11 rounded-xl font-bold transition-all flex items-center justify-center cursor-pointer shadow-sm ${
                          currentPage === page 
                            ? 'bg-[var(--primary)] text-white scale-110' 
                            : 'bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
                  className="p-3 rounded-xl bg-card border border-border text-foreground disabled:opacity-30 hover:bg-secondary transition cursor-pointer shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* TRẠNG THÁI TRỐNG (EMPTY STATE) */
          <div className="text-center py-24 text-muted-foreground bg-card rounded-3xl border border-border shadow-sm">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-bold">No images found for this category.</p>
          </div>
        )}
      </div>

      {/* MODAL XEM ẢNH (LIGHTBOX) - Đã tương thích 2 theme */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md p-4">
            <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 p-3 bg-card border border-border hover:bg-secondary rounded-full text-foreground transition-colors cursor-pointer shadow-md">
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              src={selectedImage.image} alt={selectedImage.title}
              className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl border border-border bg-muted/50"
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}