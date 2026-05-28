import { useState } from 'react';
import { motion } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal } from 'lucide-react';

// Import image of products
import imgP3_01 from '../../assets/Products/Plushies_3/P3_01.jpg'
import imgP3_02 from '../../assets/Products/Plushies_3/P3_02.jpg'
import imgP3_03 from '../../assets/Products/Plushies_3/P3_03.jpg'
import imgP3_04 from '../../assets/Products/Plushies_3/P3_04.jpg'
import imgP3_05 from '../../assets/Products/Plushies_3/P3_05.jpg'

import imgP2_01 from '../../assets/Products/Plushies_2/P2_01.jpg'


const categories = ['All Products', 'Plushies', 'Doll 2D', 'Customize'];

const allProducts = [
  { id: '1', title: 'Custom Character Plushie #01', image: imgP3_01, basePrice: 35, moq: 10, category: 'Plushies', isPopular: true },
  
  { id: '6', title: 'Custom Character Plushie #02', image: imgP2_01, basePrice: 6, moq: 100, category: 'Plushies' },
  { id: '7', title: 'Chibi Plushie', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=500&fit=crop', basePrice: 25, moq: 20, category: 'Plushies', isNew: true },
  { id: '8', title: 'Metal Pin Badge', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop', basePrice: 7, moq: 50, category: 'Pins' },
  { id: '9', title: 'Rubber Keychain', image: 'https://images.unsplash.com/photo-1555274175-6cbf6f3b137b?w=400&h=500&fit=crop', basePrice: 4, moq: 200, category: 'Keychains' },
  { id: '10', title: 'Vinyl Sticker Pack', image: 'https://images.unsplash.com/photo-1598300056393-4aac492f4344?w=400&h=500&fit=crop', basePrice: 3, moq: 500, category: 'Accessories', isPopular: true },
  { id: '11', title: 'Wooden Charm', image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400&h=500&fit=crop', basePrice: 9, moq: 50, category: 'Keychains' },
  { id: '12', title: 'Tote Bag Custom Print', image: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=400&h=500&fit=crop', basePrice: 15, moq: 30, category: 'Accessories', isNew: true },
];

export function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const filteredProducts = allProducts
    .filter((product) => {
      const matchesCategory =
        selectedCategory === 'All Products' || product.category.includes(selectedCategory);
      const matchesSearch =
        searchQuery === '' ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.basePrice - b.basePrice;
      if (sortBy === 'price-high') return b.basePrice - a.basePrice;
      if (sortBy === 'moq') return a.moq - b.moq;
      return 0;
    });

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white drop-shadow-[0_0_10px_rgba(139,114,190,0.4)]">
            Our Products
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Explore our full range of customizable merchandise and plushies
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-[#09090B] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] shadow-md transition-all"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-12 pr-8 py-3 rounded-full bg-[#09090B] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] shadow-md appearance-none cursor-pointer min-w-[200px] transition-all"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="moq">Lowest MOQ</option>
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-[var(--primary)] text-white shadow-[0_0_15px_rgba(139,114,190,0.5)] scale-105'
                    : 'bg-[#130D1E] text-muted-foreground border border-[var(--border)] hover:border-[var(--primary)] hover:text-white hover:scale-105'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-white">{filteredProducts.length}</span>{' '}
            {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
        </motion.div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard {...product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-[#130D1E] rounded-3xl border border-[var(--border)]"
          >
            <div className="w-24 h-24 rounded-full bg-[#1A1528] flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-[var(--primary)]" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white">No products found</h3>
            <p className="text-muted-foreground mb-8">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Products');
              }}
              className="px-6 py-3 rounded-full bg-[var(--primary)] text-white font-semibold shadow-lg hover:shadow-[0_0_15px_rgba(139,114,190,0.5)] transition-shadow"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}