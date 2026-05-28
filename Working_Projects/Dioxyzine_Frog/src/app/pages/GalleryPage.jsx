import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Masonry from 'react-responsive-masonry';
import { X, ZoomIn } from 'lucide-react';

const categories = ['All Products', 'Plushies 2 Mảnh', 'Plushies 3 Mảnh', 'Doll 2D (In)', 'Doll 2D (Thêu)', 'Collection'];

const galleryItems = [
  { id: 1, image: 'https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=600&h=800&fit=crop', category: 'Plushies', title: 'Custom Character Plushie' },
  { id: 2, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', category: 'Keychains', title: 'Acrylic Keychain Collection' },
  { id: 3, image: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=600&h=600&fit=crop', category: 'Pins', title: 'Enamel Pin Set' },
  { id: 4, image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=900&fit=crop', category: 'Process', title: 'Workshop Setup' },
  { id: 5, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=800&fit=crop', category: 'Plushies', title: 'Mini Plushie Series' },
  { id: 6, image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&h=400&fit=crop', category: 'Packaging', title: 'Premium Gift Packaging' },
  { id: 7, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=750&fit=crop', category: 'Plushies', title: 'Large Custom Plushie' },
];

export function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxImage, setLightboxImage] = useState(null);

  const filteredItems =
    selectedCategory === 'All'
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
            Our Gallery
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our portfolio of custom creations, production process, and happy customer projects
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-left gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-[0_0_15px_rgba(157,101,255,0.4)] scale-105'
                  : 'bg-[#130D1E] text-foreground border border-[var(--border)] hover:border-[var(--primary)] hover:scale-105'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Masonry columnsCount={3} gutter="1.5rem">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative cursor-pointer"
                  onClick={() => setLightboxImage(item.id)}
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-[0_0_20px_rgba(157,101,255,0.3)] border border-[var(--border)] transition-all duration-300">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090B]/90 via-[#09090B]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <span className="inline-block px-3 py-1 rounded-full bg-[var(--primary)]/20 backdrop-blur-sm text-white text-xs font-medium mb-2 border border-[var(--primary)]/50">
                          {item.category}
                        </span>
                        <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-16 h-16 rounded-full bg-[var(--primary)]/20 backdrop-blur-sm flex items-center justify-center border border-[var(--primary)]/50">
                          <ZoomIn className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </Masonry>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {lightboxImage !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#09090B]/95 backdrop-blur-xl flex items-center justify-center p-4"
              onClick={() => setLightboxImage(null)}
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[var(--primary)] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-5xl max-h-[90vh]"
              >
                {galleryItems.find((item) => item.id === lightboxImage) && (
                  <div className="space-y-4">
                    <img
                      src={galleryItems.find((item) => item.id === lightboxImage)?.image}
                      alt={galleryItems.find((item) => item.id === lightboxImage)?.title}
                      className="w-full h-auto rounded-2xl shadow-[0_0_30px_rgba(157,101,255,0.2)] border border-[var(--border)]"
                    />
                    <div className="text-center text-white">
                      <h3 className="text-2xl font-semibold mb-2">
                        {galleryItems.find((item) => item.id === lightboxImage)?.title}
                      </h3>
                      <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--primary)]/20 backdrop-blur-sm text-sm border border-[var(--primary)]/50">
                        {galleryItems.find((item) => item.id === lightboxImage)?.category}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}