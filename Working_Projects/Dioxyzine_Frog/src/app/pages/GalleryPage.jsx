import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Expand, X, Filter, Loader2 } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { SEO } from '../components/common_components/SEO';
import { SmartImage } from '../components/common_components/SmartImage';

const categories = ['All', 'Plushies', 'Dolls', 'Accessories', 'Bags'];
const ITEMS_PER_PAGE = 12;

export function GalleryPage() {
  const { products, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const galleryItems = useMemo(() => {
    let items = [];
    products.forEach(product => {
      const isPlushieOrDoll = product.category.some(c => ['Plushies', 'Dolls'].includes(c));
      const displayCategory = isPlushieOrDoll ? 'Plushies' : product.category[0];

      if (product.images && product.images.length > 0) {
        product.images.forEach((img, idx) => {
          items.push({ id: `${product.id}-${idx}`, image: img, title: product.title, category: displayCategory });
        });
      } else if (product.image) {
        items.push({ id: product.id, image: product.image, title: product.title, category: displayCategory });
      }
    });
    return items;
  }, [products]);

  const filteredItems = galleryItems.filter(item => selectedCategory === 'All' || item.category === selectedCategory);
  
  const visibleItems = filteredItems.slice(0, visibleCount);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <SEO title="Product Gallery" description="Explore the real-life premium plushies and custom merchandise manufactured at our workshop." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">Gallery</h1>
          <p className="text-lg text-[var(--muted-foreground)]">Realized concepts and final products from our workshop</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category} onClick={() => handleCategoryChange(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all cursor-pointer ${
                selectedCategory === category
                  ? 'bg-[var(--primary)] text-white shadow-[0_0_15px_rgba(139,114,190,0.4)]'
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
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleItems.map((item) => (
                <motion.div
                  layout key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
                  className="relative aspect-square group rounded-2xl overflow-hidden cursor-pointer bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)]"
                  onClick={() => setSelectedImage(item)}
                >
                  <SmartImage src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-[var(--cyber-black)]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <Expand className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(139,114,190,0.8)]" />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {visibleCount < filteredItems.length && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 rounded-full bg-[#1A1528] border border-[var(--primary)] text-white font-bold hover:bg-[var(--primary)] hover:shadow-[0_0_15px_rgba(139,114,190,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
                >
                  <Loader2 className="w-5 h-5" />
                  Load More
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
            <button className="absolute top-6 right-6 text-[var(--silver-gray)] hover:text-white bg-[#1A1528] rounded-full p-2 border border-[var(--border)] transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}>
              <X className="w-6 h-6" />
            </button>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative max-w-5xl w-full max-h-[85vh] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(139,114,190,0.3)] bg-black" onClick={(e) => e.stopPropagation()}>
              <img src={selectedImage.image} alt={selectedImage.title} className="w-full h-full max-h-[85vh] object-contain" />
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{selectedImage.title}</h3>
                <p className="text-[var(--primary)] font-medium">{selectedImage.category}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}