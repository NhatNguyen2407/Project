const EMPTY = { userId: null, items: [], loading: false, pending: [], error: null };
const failure = 'Could not confirm your wishlist. Refresh and try again.';

export function createWishlistStore(client, { timeoutMs = 10000 } = {}) {
  let state = EMPTY;
  let version = 0;
  const listeners = new Set();
  const requests = new Set();
  const publish = changes => {
    state = { ...state, ...changes };
    listeners.forEach(listener => listener());
  };
  const request = async operation => {
    const controller = new AbortController();
    requests.add(controller);
    let timer;
    try {
      return await Promise.race([
        operation(controller.signal),
        new Promise((_, reject) => {
          timer = setTimeout(() => { controller.abort(); reject(new Error(failure)); }, timeoutMs);
          controller.signal.addEventListener('abort', () => reject(new Error(failure)), { once: true });
        }),
      ]);
    } finally {
      clearTimeout(timer);
      requests.delete(controller);
    }
  };
  const refresh = async () => {
    if (!state.userId || state.loading || state.pending.length) return false;
    const current = version;
    const userId = state.userId;
    publish({ loading: true, error: null });
    try {
      const { data, error } = await request(signal => client.from('wishlists')
        .select('product_id,created_at').eq('user_id', userId)
        .order('created_at', { ascending: false }).abortSignal(signal));
      if (error) throw error;
      if (!Array.isArray(data)) throw new Error(failure);
      if (version !== current) return false;
      publish({ items: data, loading: false });
      return true;
    } catch {
      if (version === current) publish({ loading: false, error: failure });
      return false;
    }
  };
  return {
    getSnapshot: () => state,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    setUser(userId) {
      version++;
      requests.forEach(controller => controller.abort());
      publish({ ...EMPTY, userId: userId || null });
      if (userId) void refresh();
    },
    refresh,
    async setLiked(productId, liked) {
      const id = String(productId);
      if (!state.userId) throw new Error('Please sign in to save your favorites.');
      if (state.loading || state.pending.includes(id)) return false;
      if (state.error) throw new Error(failure);
      const current = version;
      const userId = state.userId;
      publish({ pending: [...state.pending, id] });
      try {
        const { data, error } = await request(signal => {
          const table = client.from('wishlists');
          const query = liked
            ? table.upsert({ user_id: userId, product_id: id }, { onConflict: 'user_id,product_id' })
            : table.delete().eq('user_id', userId).eq('product_id', id);
          return query.select('product_id,user_id').abortSignal(signal);
        });
        if (error) throw error;
        if (!Array.isArray(data) || data.length !== 1 || data[0].user_id !== userId || String(data[0].product_id) !== id) {
          throw new Error(failure);
        }
        if (version !== current) return false;
        const items = state.items.filter(item => String(item.product_id) !== id);
        publish({ items: liked ? [{ product_id: id, created_at: new Date().toISOString() }, ...items] : items });
        return true;
      } catch {
        if (version !== current) return false;
        publish({ error: failure });
        throw new Error(failure);
      } finally {
        if (version === current) publish({ pending: state.pending.filter(value => value !== id) });
      }
    },
  };
}
