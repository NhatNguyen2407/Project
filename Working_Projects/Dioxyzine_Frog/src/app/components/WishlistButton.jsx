import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

export function WishlistButton({ id, title }) {
  const { user } = useAuth();
  const { items, loading, pending, error, refresh, setLiked } = useWishlist();
  const liked = items.some(item => String(item.product_id) === String(id));
  const toggle = async () => {
    if (!user) { alert('Please sign in to save your favorites.'); return; }
    try {
      if (error) { if (!await refresh()) alert(error); return; }
      await setLiked(id, !liked);
    } catch (failure) { alert(failure.message); }
  };
  return (
    <button type="button" onClick={toggle} disabled={loading || pending.includes(String(id))}
      aria-label={error ? `Retry loading wishlist for ${title}` : liked ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
      title={error || undefined} aria-pressed={liked}
      className="absolute top-3 right-3 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm transition-all z-20 cursor-pointer disabled:opacity-50 flex items-center justify-center">
      <Heart className={`w-5 h-5 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
    </button>
  );
}
