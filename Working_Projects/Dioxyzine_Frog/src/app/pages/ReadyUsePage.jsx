import { useState } from 'react';
import { motion } from 'motion/react';
import { Filter, ArrowDownUp, Star } from 'lucide-react';
import { Link } from 'react-router';
import { useProducts } from '../context/ProductContext';

export function ReadyUsePage() {
  const { products } = useProducts();
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const readyUseProducts = products.filter(p => p.type === 'readyuse');

  let displayedProducts = readyUseProducts.filter(p => activeCategory === 'All' || p.category.includes(activeCategory));
  
  if (sortBy === 'price_asc') displayedProducts.sort((a, b) => a.price - b.price);
  if (sortBy === 'price_desc') displayedProducts.sort((a, b) => b.price - a.price);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-[var(--border)] pb-6">
        <div className="flex flex-wrap items-center gap-2 bg-[#1A1528] p-2 rounded-2xl border border-[var(--border)] w-full md:w-auto">
          <Filter className="w-5 h-5 ml-2 text-[var(--silver-gray)] hidden sm:block" />
          {['All', 'Plushies', 'Accessories', 'Bags'].map(cat => (
            <button 
              key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex-grow sm:flex-grow-0 ${activeCategory === cat ? 'bg-[var(--primary)] text-white' : 'text-[var(--silver-gray)] hover:text-white hover:bg-white/5'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--silver-gray)] bg-[#1A1528] px-4 py-2.5 rounded-xl border border-[var(--border)] flex-grow">
            <ArrowDownUp className="w-5 h-5" />
            <select onChange={(e) => setSortBy(e.target.value)} className="bg-transparent border-none focus:outline-none text-white cursor-pointer font-bold outline-none w-full">
              <option value="newest" className="bg-[#1A1528]">Newest Arrivals</option>
              <option value="price_asc" className="bg-[#1A1528]">Price: Low to High</option>
              <option value="price_desc" className="bg-[#1A1528]">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {displayedProducts.map(product => (
          <Link 
            to={`/product/${product.id}`} 
            key={product.id} 
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl md:rounded-3xl overflow-hidden group hover:border-[var(--primary)] transition-colors flex flex-col z-20 relative shadow-sm hover:shadow-[0_0_20px_rgba(139,114,190,0.2)] block"
          >
            <div className="relative aspect-square overflow-hidden bg-black">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700" />
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="bg-white/10 backdrop-blur-md text-white font-bold text-xs md:text-sm px-4 py-1.5 rounded-full border border-white/20 tracking-wider">SOLD OUT</span>
                </div>
              )}
            </div>
            
            <div className="p-4 md:p-5 flex flex-col flex-grow">
              <h3 className="text-white text-sm md:text-base font-semibold mb-2 line-clamp-2 leading-snug">{product.title}</h3>
              
              <div className="mt-auto pt-2">
                <div className="flex items-center gap-2 mb-2 text-xs text-[var(--silver-gray)] font-medium">
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-3 h-3 fill-current mr-1" />
                    <span className="text-white">{product.rating?.toFixed(1)}</span>
                  </div>
                  <span className="text-[var(--border)]">|</span>
                  <span>{product.sold} sold</span>
                </div>
                
                <span className="text-lg md:text-xl font-bold text-[var(--primary)] drop-shadow-[0_0_8px_rgba(139,114,190,0.5)]">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}