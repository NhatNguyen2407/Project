import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

const SmartImage = ({ src, alt, className }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setCurrentSrc(src);
    setRetryCount(0);
  }, [src]);

  const handleError = () => {
    if (retryCount < 3) {
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        setCurrentSrc(`${src}&retry=${retryCount + 1}`);
      }, 1000);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};

export function GalleryPage() {
  const { products, loading } = useProducts();
  
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const galleryItems = useMemo(() => {
    if (!products || products.length === 0) return [];
    let items = [];
    products.forEach(product => {
      const displayTitle = product.title || 'Product';
      
      if (product.image) {
        items.push({ src: product.image, alt: displayTitle, category: product.category[0] || 'Customize' });
      }
      if (product.images && product.images.length > 0) {
        product.images.forEach((img, idx) => {
          if (img !== product.image) {
            items.push({ src: img, alt: `${displayTitle} - ${idx + 1}`, category: product.category[0] || 'Customize' });
          }
        });
      }
    });
    return items;
  }, [products]);

  const filters = ['All', ...new Set(galleryItems.map(item => item.category))];
  const filteredItems = activeFilter === 'All' ? galleryItems : galleryItems.filter(item => item.category === activeFilter);
  const selectedItem = selectedIndex !== null ? filteredItems[selectedIndex] : null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">
            Gallery
          </h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            Explore actual products manufactured at our workshop
          </p>
        </div>

        {loading ? (
          <div className="text-center py-24 text-[var(--primary)] font-bold text-xl animate-pulse">
            Loading gallery...
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setSelectedIndex(null);
                  }}
                  className={`px-6 py-2 rounded-full font-medium transition-all cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-[var(--primary)] text-white shadow-md'
                      : 'bg-[var(--card)] text-[var(--silver-gray)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/*MASONRY LAYOUT*/}
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={index}
                  layoutId={`gallery-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.02 }}
                  className="group relative rounded-2xl overflow-hidden bg-[var(--cyber-black)] cursor-pointer shadow-lg break-inside-avoid inline-block w-full"
                  onClick={() => setSelectedIndex(index)}
                >
                  <SmartImage
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-auto block opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
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

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 p-6 md:p-24 backdrop-blur-sm cursor-pointer select-none"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(null);
              }}
              className="absolute top-28 right-6 md:right-12 p-3 rounded-full bg-white/10 hover:bg-[var(--primary)] text-white transition-colors z-[170] cursor-pointer shadow-xl border border-white/5"
            >
              <X className="w-7 h-7 md:w-8 md:h-8" />
            </button>

            <button onClick={handlePrev} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-[var(--primary)] hover:scale-110 text-white transition-all z-[170] cursor-pointer shadow-lg border border-white/5">
              <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
            </button>
            <button onClick={handleNext} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-[var(--primary)] hover:scale-110 text-white transition-all z-[170] cursor-pointer shadow-lg border border-white/5">
              <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
            </button>

            <motion.div
              layoutId={`gallery-${selectedIndex}`}
              className="relative w-full max-w-5xl flex items-center justify-center cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <SmartImage
                src={selectedItem.src}
                alt={selectedItem.alt}
                className="max-w-full max-h-[55vh] md:max-h-[60vh] object-contain rounded-xl drop-shadow-[0_0_30px_rgba(139,114,190,0.3)]"
              />
              
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