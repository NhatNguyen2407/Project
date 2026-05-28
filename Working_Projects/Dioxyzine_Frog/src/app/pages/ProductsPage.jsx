import { useState } from 'react';
import { motion } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import { productsData } from '../data/productsData';

const categories = ['All Products', 'Plushie', 'Doll', 'Customize'];

export function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const filteredProducts = productsData
    .filter((product) => {
      const matchesCategory =
        selectedCategory === 'All Products' || product.category.includes(selectedCategory);
      const matchesSearch =
        searchQuery === '' ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-8">
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
          </div>

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

        <div className="mb-8">
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-white">{filteredProducts.length}</span> products
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              id={product.id}
              title={product.title}
              image={product.image}
              basePrice={product.priceBrackets[0].prices[0]} 
              moq={product.moq}
              category={product.category[0]}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}