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
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <SEO title="Product Gallery" description="Explore the real-life premium plushies and custom merchandise." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">Gallery</h1>
          <p className="text-lg text-[var(--muted-foreground)]">Realized concepts and final products from our workshop</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category} onClick={() => handleCategoryChange(category)}
              className={`px-6 py-2 rounded-full font-bold transition-all cursor-pointer ${
                selectedCategory === category
                  ? 'bg-[var(--primary)] text-white shadow-[0_0_15px_rgba(139,114,190,0.4)] scale-105'
                  : 'bg-[var(--card)] text-[var(--silver-gray)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-24 text-[var(--primary)] font-bold text-xl animate-pulse">
            Loading gallery...
          </div>
        ) : filteredItems.length > 0 ? (
          <>
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {currentItems.map((item) => (
                  <motion.div
                    layout key={item.id} 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}
                    className="relative aspect-square group rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer bg-black shadow-lg"
                    onClick={() => setSelectedImage(item)}
                  >
                    <SmartImage src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 opacity-80 group-hover:opacity-100 transition-all duration-500" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16">
                <button
                  onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                  className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-white disabled:opacity-30 hover:bg-white/10 transition cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    if (totalPages > 6) {
                      if (page !== 1 && page !== totalPages && Math.abs(currentPage - page) > 1) {
                        if (page === 2 || page === totalPages - 1) return <span key={page} className="text-gray-500 self-end">...</span>;
                        return null;
                      }
                    }
                    return (
                      <button
                        key={page} onClick={() => goToPage(page)}
                        className={`w-11 h-11 rounded-xl font-bold transition-all flex items-center justify-center cursor-pointer ${
                          currentPage === page 
                            ? 'bg-[var(--primary)] text-white shadow-[0_0_15px_rgba(139,114,190,0.5)] scale-110' 
                            : 'bg-[var(--card)] border border-[var(--border)] text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
                  className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-white disabled:opacity-30 hover:bg-white/10 transition cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 text-[var(--muted-foreground)] bg-[var(--card)] rounded-3xl border border-[var(--border)]">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-medium">No images found for this category.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
            <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer">
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              src={selectedImage.image} alt={selectedImage.title}
              className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}