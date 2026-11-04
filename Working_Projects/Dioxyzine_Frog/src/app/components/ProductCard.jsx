import { Link } from 'react-router';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { getProductUrl } from '../utils/catalog';

import { SmartImage } from '../components/common_components/SmartImage';

export function ProductCard({ id, title, image, basePriceObj, moq, category, pricingType, type, price }) {
  const isReadyUse = type === 'readyuse';
  const isContactPricing = pricingType === 'contact';
  const isQuote = !isReadyUse && (isContactPricing || !basePriceObj);
  
  const displayPrice = () => {
    if (isReadyUse) return `$${Number(price).toFixed(2)}`;
    if (isContactPricing) return 'Custom Quote';
    if (!basePriceObj) return 'Custom Quote';
    const prices = Object.values(basePriceObj);
    const minPrice = Math.min(...prices);
    return `From $${minPrice.toFixed(2)}`;
  };

  const { user } = useAuth();
  const { items, loading, pending, error, refresh, setLiked } = useWishlist();
  const isLiked = items.some(item => String(item.product_id) === String(id));
  const isLiking = pending.includes(String(id));

  const toggleWishlist = async () => {
    if (!user) {
      alert("Please login to save your favorite items! 🐸");
      return;
    }

    try {
      if (error) { if (!await refresh()) alert(error); return; }
      await setLiked(id, !isLiked);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="group relative bg-[var(--card)] rounded-3xl border border-[var(--border)] p-4 hover:border-[var(--primary)] transition-all flex flex-col h-full z-20 hover:shadow-[0_0_20px_rgba(139,114,190,0.2)]">
      <button
        type="button"
        onClick={toggleWishlist}
        disabled={loading || isLiking}
        aria-label={error ? `Retry loading wishlist for ${title}` : isLiked ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
        title={error || undefined}
        aria-pressed={isLiked}
        className="absolute top-3 right-3 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm transition-all z-20 cursor-pointer disabled:opacity-50 flex items-center justify-center"
      >
        <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
      </button>

      <Link to={getProductUrl({ id, type })} className="flex flex-col flex-grow">
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
            {!isReadyUse && moq && (
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
            <p className={`font-bold ${isQuote ? 'text-[var(--silver-gray)] text-sm' : 'text-[var(--primary)] text-xl drop-shadow-[0_0_8px_rgba(139,114,190,0.5)]'}`}>
              {displayPrice()}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
