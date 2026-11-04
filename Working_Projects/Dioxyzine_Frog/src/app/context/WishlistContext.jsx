import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../service/supabase';
import { createWishlistStore } from '../utils/wishlistStore';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id || null;
  const [store] = useState(() => createWishlistStore(supabase));
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  useEffect(() => {
    store.setUser(userId);
    return () => store.setUser(null);
  }, [store, userId]);
  // Hide the previous account immediately, before effect cleanup runs.
  const state = snapshot.userId === userId ? snapshot : { items: [], pending: [], loading: Boolean(userId), error: null };
  return (
    <WishlistContext.Provider value={{ ...state, refresh: store.refresh, setLiked: store.setLiked }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
