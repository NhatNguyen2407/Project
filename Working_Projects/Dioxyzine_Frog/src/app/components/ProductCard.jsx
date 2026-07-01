import { Link } from 'react-router';

// --- ĐÃ SỬA: Import SmartImage ---
import { SmartImage } from '../components/common_components/SmartImage';

export function ProductCard({ id, title, image, basePriceObj, moq, category, pricingType }) {
  const isContactPricing = pricingType === 'contact';
  
  const displayPrice = () => {
    if (isContactPricing) return 'Custom Quote';
    if (!basePriceObj) return 'Contact for price';
    const prices = Object.values(basePriceObj);
    const minPrice = Math.min(...prices);
    return `From $${minPrice.toFixed(2)}`;
  };

  return (
    <Link to={`/product/${id}`} className="group relative bg-[var(--card)] rounded-3xl border border-[var(--border)] p-4 hover:border-[var(--primary)] transition-all flex flex-col h-full z-20 hover:shadow-[0_0_20px_rgba(139,114,190,0.2)] block">
      
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-black">
        
        {/* SmartImage */}
        <SmartImage 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 opacity-90 group-hover:opacity-100" 
        />
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {category && (
            <span className="px-3 py-1 text-xs font-bold text-white bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-sm uppercase tracking-wider">
              {category}
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {moq && (
            <span className="px-3 py-1 text-xs font-bold text-white bg-[var(--primary)]/20 backdrop-blur-md rounded-full border border-[var(--primary)]/30 shadow-sm">
              MOQ: {moq}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-grow text-center">
        <h3 className="text-lg font-bold text-white group-hover:text-[var(--primary)] transition-colors mb-2 line-clamp-2">
          {title}
        </h3>
        
        <div className="mt-auto pt-4 border-t border-[var(--border)]">
          <p className={`font-bold ${isContactPricing ? 'text-[var(--silver-gray)] text-sm' : 'text-[var(--primary)] text-xl drop-shadow-[0_0_8px_rgba(139,114,190,0.5)]'}`}>
            {displayPrice()}
          </p>
        </div>
      </div>
    </Link>
  );
}