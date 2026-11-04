import { useEffect, useReducer, useState } from 'react';
import { supabase } from '../service/supabase';
import { mergeOrderReview } from '../service/customerProfile';

export function useAccountOrders(userId) {
  const [attempt, reload] = useReducer(value => value + 1, 0);
  const [state, setState] = useState({ userId: null, items: [], loading: false, error: null });
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const controller = new AbortController();
    const fail = () => setState({ userId, items: [], loading: false, error: 'Could not load your orders. Please retry.' });
    setState({ userId, items: [], loading: true, error: null });
    const timer = setTimeout(() => {
      if (!active) return;
      fail();
      active = false;
      controller.abort();
    }, 10000);
    Promise.resolve().then(() => supabase.from('orders')
      .select('*,order_reviews(rating,review_comment,admin_reply)').eq('user_id', userId)
      .order('created_at', { ascending: false }).abortSignal(controller.signal)
    ).then(({ data, error }) => {
      if (!active) return;
      if (error || !Array.isArray(data)) throw error || new Error('Invalid orders');
      setState({ userId, items: data.map(mergeOrderReview), loading: false, error: null });
    }).catch(() => { if (active) fail(); }).finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [userId, attempt]);
  const current = state.userId === userId ? state : { items: [], loading: Boolean(userId), error: null };
  return { ...current, reload };
}
