import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../service/supabase';
import { useAuth } from '../context/AuthContext';

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

  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false); // Ngăn click spam

  // 1. Kiểm tra xem khách đã thích chưa lúc vừa load thẻ sản phẩm
  useEffect(() => {
    if (user) {
      const checkWishlist = async () => {
        const { data } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', id) // id của sản phẩm truyền vào qua props
          .maybeSingle();
          
        if (data) setIsLiked(true);
      };
      checkWishlist();
    }
  }, [user, id]);

  // 2. Logic Bấm nút thả tim
  const toggleWishlist = async (e) => {
    e.preventDefault(); // Ngăn không cho thẻ chuyển sang trang chi tiết khi bấm tim
    e.stopPropagation();

    if (!user) {
      alert("Please login to save your favorite items! 🐸");
      return;
    }

    setIsLiking(true);
    try {
      if (isLiked) {
        setIsLiked(false);
        await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', id);
      } else {
        setIsLiked(true);
        await supabase.from('wishlists').insert([{ user_id: user.id, product_id: id }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Link to={`/product/${id}`} className="group relative bg-[var(--card)] rounded-3xl border border-[var(--border)] p-4 hover:border-[var(--primary)] transition-all flex flex-col h-full z-20 hover:shadow-[0_0_20px_rgba(139,114,190,0.2)] block">
      <button 
        onClick={toggleWishlist} 
        disabled={isLiking}
        className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm transition-all z-20 cursor-pointer disabled:opacity-50"
      >
        <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
      </button>
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