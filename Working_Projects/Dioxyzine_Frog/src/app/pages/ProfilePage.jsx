import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, LogOut, Package, Calendar, Tag, CreditCard, Crown, Check, Star, MessageSquare, Truck, AlertCircle, PlusCircle, Settings, Save, Lock, Camera, Trash2, Heart, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../service/supabase';
import { useProducts } from '../context/ProductContext';
import { useWishlist } from '../context/WishlistContext';
import { useAccountOrders } from '../hooks/useAccountOrders';
import { deleteCustomerAccount, finishDeletedAccountSignOut, profileFromUser, saveCustomerProfile, prepareReorder } from '../service/customerProfile';
import { getProductUrl } from '../utils/catalog';

import { useCart } from '../context/CartContext';
import { toast, Toaster } from 'sonner';

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { cart, addToCart, setIsCartOpen } = useCart();
  const { products, loading: loadingProducts } = useProducts();
  const [activeView, setActiveView] = useState('orders'); 

  const { items: orders, loading: loadingOrders, error: ordersError, reload: fetchMyOrders } = useAccountOrders(user?.id);
  const { items: wishlist, loading: loadingWishlist, error: wishlistError, pending: wishlistPending, refresh: fetchMyWishlist, setLiked } = useWishlist();
  const accountId = useRef(user?.id);
  accountId.current = user?.id;
  const currentCart = useRef(cart);
  currentCart.current = cart;

  const [reviewOrder, setReviewOrder] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [profileForm, setProfileForm] = useState({ fullName: '', avatarUrl: '', email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileNotice, setProfileNotice] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleteResult, setDeleteResult] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // 🚀 Cập nhật lại các bước Tracking cho chuẩn hóa
  const STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipping', 'Completed'];

  const handleRemoveFromWishlist = async (productId) => {
    const userId = user?.id;
    try {
      const saved = await setLiked(productId, false);
      if (saved && accountId.current === userId) toast.success('Removed from your wishlist.');
    } catch (error) {
      if (accountId.current === userId) toast.error(error.message);
    }
  };

  // Token refreshes must not overwrite an account settings draft.
  useEffect(() => {
    setProfileForm(profileFromUser(user));
    setNewPassword('');
    setConfirmPassword('');
    setProfileNotice(null);
    setAvatarFile(null);
    setReviewOrder(null);
    setSubmittingReview(false);
    setRating(5);
    setComment('');
    setReturnOrder(null);
    setShowDeleteModal(false);
    setDeleteConfirmText('');
    setDeletingAccount(false);
    setUpdatingProfile(false);
    setLoggingOut(false);
    setReordering(false);
    setDeleteResult(false);
  }, [user?.id]);

  useEffect(() => {
    if (!avatarFile) { setAvatarPreview(null); return; }
    const preview = URL.createObjectURL(avatarFile);
    setAvatarPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [avatarFile]);

  const handleLogout = async () => {
    if (loggingOut || updatingProfile || deletingAccount) return;
    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login', { replace: true });
    } catch {
      toast.error('Could not sign out. Please retry.');
    } finally { setLoggingOut(false); }
  };

  const completedCount = orders.filter((order) => order.order_status?.toLowerCase() === 'completed').length;

  const getMembershipDetails = () => {
    const perks = 'Benefits coming soon. Standard checkout rates apply.';
    if (completedCount >= 10) return { tierName: 'GOLD VIP MEMBER', perks, gradient: 'from-[#4A154B] via-[#2C1654] to-[#120C1F]' };
    if (completedCount >= 7) return { tierName: 'SILVER MEMBER', perks, gradient: 'from-[#3A1C6E] via-[#211343] to-[#100A21]' };
    if (completedCount >= 5) return { tierName: 'BRONZE MEMBER', perks, gradient: 'from-[#2D1B54] via-[#1C1236] to-[#0A0614]' };
    return { tierName: 'STANDARD MEMBER', perks: 'Standard Shipping Rates Apply', gradient: 'from-[#1E1135] via-[#130B22] to-[#08040F]' };
  };

  const currentTier = getMembershipDetails();

  const getStepIndex = (status) => {
    const idx = STEPS.findIndex(s => s.toLowerCase() === (status || '').toLowerCase());
    return idx !== -1 ? idx : 0;
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewOrder || submittingReview) return;
    const userId = user.id;
    
    setSubmittingReview(true);
    try {
      // The RPC checks ownership and writes the separate order_reviews record.
      const { data, error } = await supabase.rpc('submit_order_review', {
        p_order_id: reviewOrder.id,
        p_rating: rating,
        p_comment: comment,
      });

      if (error) throw error;
      if (accountId.current !== userId) return;
      if (data !== true) {
        throw new Error("Không thể gửi đánh giá cho đơn hàng này. Vui lòng thử lại hoặc liên hệ hỗ trợ.");
      }

      setReviewOrder(null); 
      setRating(5); 
      setComment(''); 
      await fetchMyOrders(); 
      toast.success("Cảm ơn bạn đã xác nhận và đánh giá!");
    } catch (error) { 
      if (accountId.current === userId) toast.error('Could not save your review. Refresh your orders and retry.');
    } finally { 
      if (accountId.current === userId) setSubmittingReview(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE' || deletingAccount || updatingProfile) return;
    const userId = user.id;
    setDeletingAccount(true);
    try {
      const { signedOut } = await deleteCustomerAccount(supabase, userId);
      if (accountId.current && accountId.current !== userId) return;
      if (signedOut) navigate('/', { replace: true });
      else setDeleteResult(userId);
    } catch (err) {
      if (accountId.current === userId) { toast.error(err.message); setDeletingAccount(false); }
    }
  };

  const finishDeleteSignOut = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    const result = await finishDeletedAccountSignOut(supabase, deleteResult);
    if (result.signedOut) navigate('/', { replace: true });
    if (result.accountChanged) setDeleteResult(false);
    setLoggingOut(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (updatingProfile || deletingAccount) return;
    const userId = user.id;
    setUpdatingProfile(true);
    setProfileNotice(null);
    try {
      const result = await saveCustomerProfile(supabase, user, profileForm, newPassword, confirmPassword, avatarFile, window.location.origin);
      if (accountId.current !== userId) return;
      setProfileForm(profileFromUser(result.user));
      setAvatarFile(null);
      setNewPassword('');
      setConfirmPassword('');
      setProfileNotice({ message: result.emailPending ? 'Changes saved. Check your inbox to confirm the pending email change.' : 'Your account changes have been saved.' });
    } catch (error) {
      if (accountId.current !== userId) return;
      if (error.currentUser) { setProfileForm(profileFromUser(error.currentUser)); setAvatarFile(null); }
      setNewPassword('');
      setConfirmPassword('');
      setProfileNotice({ error: true, message: error.message });
    } finally { if (accountId.current === userId) setUpdatingProfile(false); }
  };

  const handleOrderAgain = async (order) => {
    if (reordering) return;
    const userId = user.id;
    if (!Array.isArray(order.cart_items) || order.cart_items.length === 0) {
      toast.error('Không thể đặt lại đơn hàng này.');
      return;
    }

    setReordering(true);
    try {
      const ids = [...new Set(order.cart_items.map(item => item.id))];
      const { data, error } = await supabase.from('products').select('*').in('id', ids);
      if (error) throw error;
      if (accountId.current !== userId) return;
      const items = prepareReorder(order.cart_items, data, currentCart.current);
      items.forEach(addToCart);
      setIsCartOpen(true);
      toast.success('Đã thêm các sản phẩm từ đơn cũ vào giỏ hàng! 🛒');
    } catch (error) {
      if (accountId.current === userId) toast.error(error.message || 'Could not reorder these items.');
    } finally { if (accountId.current === userId) setReordering(false); }
  };

  if (deleteResult && (!user || user.id === deleteResult)) return (
    <div className="min-h-screen pt-32 px-4 text-center" role="alert">
      <p>Your account was deleted. Sign-out could not finish. Retry when your connection is available.</p>
      <button onClick={finishDeleteSignOut} disabled={loggingOut} className="mt-4 px-6 py-3 rounded-xl bg-[var(--primary)] text-white disabled:opacity-50">
        {loggingOut ? 'Signing out...' : 'Retry sign-out'}
      </button>
    </div>
  );
  if (!user) return <div className="min-h-screen pt-24 pb-16 flex items-center justify-center text-[var(--primary)] text-lg font-medium">Please login to view this page...</div>;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <Toaster position="top-center" richColors />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm text-center">
              <div className="w-24 h-24 bg-[var(--muted)] dark:bg-[#1A1528] rounded-full flex items-center justify-center border-2 border-[var(--primary)] mx-auto mb-4 overflow-hidden">
                {user.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} alt="Your profile avatar" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-[var(--primary)]" />}
              </div>
              <h2 className="text-xl font-bold text-[var(--primary)] truncate">{user.user_metadata?.full_name || 'Froggy Member'}</h2>
              <div className="flex items-center justify-center gap-2 text-[var(--primary)] opacity-80 mt-2"><Mail className="w-4 h-4" /><span className="text-xs truncate">{user.email}</span></div>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-3 shadow-sm space-y-2">
              <button onClick={() => setActiveView('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'orders'
                ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                : 'hover:bg-[var(--accent)]/50 text-[var(--foreground)] dark:text-gray-400 dark:hover:text-white'}`}>
                <Package className="w-5 h-5" /> My Orders</button>
              <button onClick={() => setActiveView('wishlist')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'wishlist'
                ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                : 'hover:bg-[var(--accent)]/50 text-[var(--foreground)] dark:text-gray-400 dark:hover:text-white'}`}>
                <Heart className="w-5 h-5" /> My Wishlist</button>
              <button onClick={() => setActiveView('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'settings'
                ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                : 'hover:bg-[var(--accent)]/50 text-[var(--foreground)] dark:text-gray-400 dark:hover:text-white'}`}>
                <Settings className="w-5 h-5" /> Settings</button>
              <div className="border-t border-[var(--border)] my-2"></div>
              <button onClick={handleLogout} disabled={loggingOut || updatingProfile || deletingAccount} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"><LogOut className="w-5 h-5" /> {loggingOut ? 'Signing out...' : 'Sign Out'}</button>
            </div>
          </div>

          <div className="md:col-span-3 space-y-6">
            {activeView === 'orders' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                
                {/* Banner Loyalty */}
                <div className={`bg-gradient-to-br ${currentTier.gradient} border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-lg`}>
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="flex justify-between items-start mb-10">
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-[var(--primary)] tracking-widest opacity-60">DIOXYZINE FROG LOYALTY</p>
                      <h3 className="text-xl font-black text-[var(--primary)] tracking-wider">{loadingOrders ? 'Checking membership...' : ordersError ? 'Membership unavailable' : currentTier.tierName}</h3>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-[var(--primary)]"><CreditCard className="w-6 h-6" /></div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-[var(--primary)] uppercase tracking-wider opacity-60">Current Benefits</p>
                      <p className="text-sm font-bold text-[var(--primary)] flex items-center gap-1.5"><Crown className="w-4 h-4" /> {loadingOrders || ordersError ? 'Load your orders to view your membership.' : currentTier.perks}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-[var(--primary)] uppercase tracking-wider opacity-60">Completed</p>
                      <p className="text-lg font-bold font-mono text-[var(--primary)]">{loadingOrders || ordersError ? '-' : completedCount} Orders</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h3 className="text-xl font-bold text-[var(--primary)] mb-6 flex items-center gap-2"><Package /> My Orders ({orders.length})</h3>

                  {loadingOrders ? (
                    <div className="text-center py-8 text-[var(--primary)] opacity-60">Loading your orders...</div>
                  ) : ordersError ? (
                    <div className="text-center space-y-3" role="alert"><p>{ordersError}</p><button type="button" onClick={fetchMyOrders} className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white">Retry orders</button></div>
                  ) : orders.length === 0 ? (
                    <div className="bg-[var(--muted)] dark:bg-[#1A1528] rounded-2xl p-8 text-center border border-[var(--border)] border-dashed">
                      <p className="text-[var(--primary)] opacity-70">You don't have any orders yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => {
                        const status = (order.order_status || 'pending').toLowerCase();
                        const currentStepIdx = getStepIndex(status);
                        const isReturned = status === 'returned';
                        const isCompleted = status === 'completed';

                        return (
                          <div key={order.id} className="bg-[var(--muted)] dark:bg-[#1A1528] border border-[var(--border)] rounded-2xl p-5 space-y-5 hover:border-[var(--primary)]/30 transition-colors relative overflow-hidden">
                            
                            {/* Nút Order Again siêu vip */}
                            {isCompleted && (
                              <button 
                                onClick={() => handleOrderAgain(order)}
                                disabled={reordering}
                                className="absolute top-4 right-4 p-2.5 rounded-xl bg-[var(--primary)] text-white hover:bg-purple-600 transition-all flex items-center gap-2 shadow-lg z-10 cursor-pointer"
                              >
                                <RefreshCw className="w-4 h-4" />
                                <span className="text-xs font-bold hidden sm:inline">Order Again</span>
                              </button>
                            )}

                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-[var(--primary)] opacity-50">#{order.id.slice(0, 8)}</span>
                                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 font-semibold">{order.order_status || 'Pending'}</span>
                                </div>
                                <h4 className="text-lg font-bold text-[var(--primary)] pr-24">
                                  {Array.isArray(order.cart_items)
                                    ? order.cart_items.map((item) => item.title || item.name || item.id).join(', ')
                                    : 'Custom Order'}
                                </h4>

                                <div className="flex flex-col gap-1 text-xs text-[var(--primary)] opacity-80 mt-2">
                                  <span className="flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5" />
                                    Qty: {Array.isArray(order.cart_items)
                                      ? order.cart_items.reduce((sum, item) => sum + Number(item.qty || 0), 0)
                                      : 0}
                                  </span>
                                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date: {new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col w-full sm:w-auto mt-4 sm:mt-0 gap-3">
                                {/* Khối vận chuyển chỉ hiện khi đang Shipping */}
                                {status === 'shipping' && (
                                  <div className="bg-[var(--card)] dark:bg-white/5 border border-[var(--border)] dark:border-white/10 rounded-xl p-4 w-full sm:w-[280px]">
                                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--border)] dark:border-white/10">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-[#EE0033]/20 flex items-center justify-center"><Truck className="w-4 h-4 text-[#EE0033]" /></div>
                                        <div>
                                          <p className="text-[10px] text-[var(--muted-foreground)] dark:text-gray-400 uppercase tracking-wider">Vận chuyển</p>
                                          <p className="text-sm font-bold text-[var(--foreground)] dark:text-white">
                                            Viettel Post
                                          </p>
                                        </div>
                                      </div>

                                      <div className="text-right">
                                        <p className="text-[10px] text-[var(--muted-foreground)] dark:text-gray-400 uppercase tracking-wider">Mã Vận Đơn</p>
                                        <p className="text-sm font-bold text-[var(--primary)] font-mono">{order.tracking_code || 'Updating...'}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <a href="https://viettelpost.com.vn/tra-cuu-hanh-trinh-don/" target="_blank" rel="noreferrer" className="flex-1 py-2 bg-[#EE0033] hover:bg-[#CC002C] text-white text-xs font-bold rounded-lg text-center transition-colors">Tra Cứu Hàng</a>
                                      <button onClick={() => setReviewOrder(order)} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"><Check className="w-4 h-4" /> Đã Nhận</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 🚀 ĐÃ BỔ SUNG LẠI LOGIC: HIỂN THỊ REVIEW HOẶC THANH TRACKING */}
                            {isCompleted ? (
                              <div className="pt-2 border-t border-[var(--border)] mt-4">
                                {order.rating ? (
                                  <div className="p-4 bg-[var(--muted)] dark:bg-black/20 rounded-xl border border-[var(--border)] dark:border-white/5">
                                    <div className="flex items-center gap-1 mb-1.5">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`w-3.5 h-3.5 ${star <= order.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} />
                                      ))}
                                      <span className="text-xs text-yellow-500 font-bold ml-2">My Review</span>
                                    </div>
                                    <p className="text-xs text-[var(--foreground)] dark:text-gray-400 italic">"{order.review_comment}"</p>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                                    <p className="text-sm font-bold text-green-400 flex items-center gap-2"><Check className="w-5 h-5"/> Đơn hàng đã giao thành công!</p>
                                    <button onClick={() => setReviewOrder(order)} className="px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer">
                                      <Star className="w-4 h-4" /> Leave Review
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : !isReturned ? (
                              <div className="pt-4 mt-2 border-t border-[var(--border)]">
                                <div className="relative flex justify-between items-center w-full">
                                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[var(--border)] dark:bg-white/5 -translate-y-1/2 z-0"></div>
                                  <div className="absolute top-1/2 left-0 h-0.5 bg-[var(--primary)] -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%` }}></div>

                                  {STEPS.map((step, index) => {
                                    const isPassed = index <= currentStepIdx;
                                    const isCurrent = index === currentStepIdx;
                                    return (
                                      <div key={step} className="flex flex-col items-center relative z-10">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold transition-all duration-300 
                                            ${isPassed
                                              ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                                              : 'bg-[var(--card)] dark:bg-[#1A1528] border-[var(--border)] dark:border-white/10 text-[var(--muted-foreground)]'
                                            } 
                                            ${isCurrent ? 'ring-4 ring-[var(--primary)]/20 scale-110' : ''}`
                                          }>{index + 1}
                                        </div>
                                        <span className={`text-[10px] mt-1.5 font-medium tracking-wide transition-colors hidden sm:block 
                                              ${isPassed ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)] dark:text-gray-600'} 
                                              ${isCurrent ? 'font-bold' : ''}`
                                            }>{step}
                                          </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-2 text-red-400 text-xs font-semibold">
                                <AlertCircle className="w-4 h-4" /> Đơn hàng này đã được xử lý hoàn trả hàng.
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeView === 'wishlist' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <h3 className="text-xl font-bold text-[var(--primary)] flex items-center gap-2">
                    <Heart className="w-6 h-6" /> My Wishlist ({wishlist.length})
                  </h3>
                  <button
                    type="button"
                    onClick={fetchMyWishlist}
                    disabled={loadingWishlist || wishlistPending.length > 0}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold hover:border-[var(--primary)] disabled:opacity-50"
                  >
                    {loadingWishlist ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {loadingWishlist || loadingProducts ? (
                  <div className="text-center py-10 text-[var(--muted-foreground)]">
                    Loading your wishlist...
                  </div>
                ) : wishlistError ? (
                  <p role="alert" className="py-8 text-center text-red-400">{wishlistError}</p>
                ) : wishlist.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 sm:p-10 text-center">
                    <Heart className="w-10 h-10 mx-auto mb-3 text-[var(--primary)] opacity-70" />
                    <h4 className="font-bold text-[var(--foreground)] mb-2">Your wishlist is empty</h4>
                    <p className="text-sm text-[var(--muted-foreground)] mb-5">
                      Save products with the heart button and they will appear here.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/products')}
                      className="px-5 py-3 rounded-xl bg-[var(--primary)] text-white font-bold hover:opacity-90"
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {wishlist.map((item) => {
                      const product = products.find(
                        (candidate) => String(candidate.id) === String(item.product_id)
                      );

                      return (
                        <div
                          key={item.product_id}
                          className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]"
                        >
                          {product ? (
                            <>
                              <button
                                type="button"
                                onClick={() => navigate(getProductUrl(product))}
                                className="block w-full text-left"
                                aria-label={`View ${product.title}`}
                              >
                                <div className="aspect-square bg-[var(--muted)] overflow-hidden">
                                  <img
                                    src={product.image}
                                    alt={product.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                  />
                                </div>
                                <div className="p-4">
                                  <h4 className="font-bold text-[var(--foreground)] line-clamp-2">
                                    {product.title}
                                  </h4>
                                  <p className="text-xs text-[var(--muted-foreground)] mt-2">
                                    Saved {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                                  </p>
                                </div>
                              </button>
                              <div className="flex gap-2 px-4 pb-4">
                                <button
                                  type="button"
                                  onClick={() => navigate(getProductUrl(product))}
                                  className="flex-1 px-3 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-bold hover:opacity-90"
                                >
                                  View Product
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFromWishlist(item.product_id)}
                                  disabled={wishlistPending.includes(String(item.product_id))}
                                  className="px-3 py-2 rounded-xl border border-red-500/40 text-red-500 text-sm font-bold hover:bg-red-500/10"
                                >
                                  Remove
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="p-5">
                              <p className="font-semibold text-[var(--foreground)]">Product unavailable</p>
                              <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-4">
                                This product may have been removed from the store.
                              </p>
                              <button
                                type="button"
                                onClick={() => handleRemoveFromWishlist(item.product_id)}
                                disabled={wishlistPending.includes(String(item.product_id))}
                                className="px-3 py-2 rounded-xl border border-red-500/40 text-red-500 text-sm font-bold hover:bg-red-500/10"
                              >
                                Remove from Wishlist
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeView === 'settings' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm"
              >
                <h3 className="text-xl font-bold text-[var(--primary)] mb-6 flex items-center gap-2">
                  <Settings className="w-6 h-6" /> Account Settings
                </h3>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {profileNotice && <p role={profileNotice.error ? 'alert' : 'status'} className={`rounded-xl p-4 text-sm ${profileNotice.error ? 'bg-red-500/10 text-red-400' : 'bg-[var(--primary)]/10 text-[var(--foreground)]'}`}>{profileNotice.message}</p>}
                  <fieldset disabled={updatingProfile || deletingAccount || loggingOut} className="space-y-6 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 border-b border-[var(--border)]">
                      <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-[var(--muted)] dark:bg-[#1A1528] border-2 border-[var(--primary)]/60 shrink-0">
                        {(avatarPreview || profileForm.avatarUrl) ? (
                          <img
                            src={avatarPreview || profileForm.avatarUrl}
                            alt="Profile avatar preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-[var(--primary)]" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="profile-avatar" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] cursor-pointer font-semibold text-sm">
                          <Camera className="w-4 h-4" /> Choose avatar
                        </label>
                        <input
                          id="profile-avatar"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (!file) return;
                            if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
                              toast.error('Please choose a PNG, JPEG, or WebP image.');
                              e.target.value = '';
                              return;
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error('Avatar must be 5 MB or smaller.');
                              e.target.value = '';
                              return;
                            }
                            setAvatarFile(file);
                            e.target.value = '';
                          }}
                        />
                        <p className="text-xs text-[var(--muted-foreground)]">PNG, JPEG or WebP · Maximum 5 MB</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="profile-display-name" className="block text-sm font-semibold text-[var(--foreground)]">
                        <User className="w-4 h-4 inline-block mr-2 align-text-bottom" /> Display Name
                      </label>
                      <input
                        id="profile-display-name"
                        required
                        type="text"
                        autoComplete="name"
                        maxLength={80}
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="w-full px-4 py-3 bg-[var(--input-background)] dark:bg-[#1A1528] border border-[var(--border)] rounded-xl text-[var(--foreground)] dark:text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="profile-email" className="block text-sm font-semibold text-[var(--foreground)]">
                        <Mail className="w-4 h-4 inline-block mr-2 align-text-bottom" /> Email Address
                      </label>
                      <input
                        id="profile-email"
                        required
                        type="email"
                        autoComplete="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-4 py-3 bg-[var(--input-background)] dark:bg-[#1A1528] border border-[var(--border)] rounded-xl text-[var(--foreground)] dark:text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                      />
                      <p className="text-xs text-[var(--muted-foreground)]">Changing your email may require confirmation through your email inbox.</p>
                      {user.new_email && <p role="status" className="text-xs text-[var(--primary)]">Email change pending confirmation. Your current login email is {user.email}.</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="profile-new-password" className="block text-sm font-semibold text-[var(--foreground)]">
                        <Lock className="w-4 h-4 inline-block mr-2 align-text-bottom" /> New Password <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
                      </label>
                      <input
                        id="profile-new-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); if (!e.target.value) setConfirmPassword(''); }}
                        placeholder="Leave blank to keep your current password"
                        className="w-full px-4 py-3 bg-[var(--input-background)] dark:bg-[#1A1528] border border-[var(--border)] rounded-xl text-[var(--foreground)] dark:text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                      />
                      <p className="text-xs text-[var(--muted-foreground)]">Use at least 8 characters if you want to change it.</p>
                    </div>

                    {newPassword && (
                      <div className="space-y-2">
                        <label htmlFor="profile-confirm-password" className="block text-sm font-semibold">Confirm New Password</label>
                        <input id="profile-confirm-password" type="password" autoComplete="new-password" required
                          value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-xl" />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[var(--primary)] hover:bg-purple-600 text-white font-bold rounded-xl shadow-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {updatingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                  </fieldset>
                </form>

                <div className="mt-10 pt-8 border-t border-red-500/20">
                  <h4 className="text-red-400 font-bold flex items-center gap-2 mb-2">
                    <Trash2 className="w-5 h-5" /> Danger Zone
                  </h4>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    Deleting your account is permanent. Your order history will be kept for accounting records but disconnected from your name and contact info.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    disabled={updatingProfile || loggingOut}
                    className="px-6 py-3 border border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Delete my account
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      <AnimatePresence>
        {reviewOrder && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--card)] dark:bg-[#1A1528] border border-[var(--border)] rounded-3xl p-6 max-w-md w-full space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-[var(--foreground)] dark:text-white flex items-center justify-center gap-2"><MessageSquare className="text-[var(--primary)]" /> Confirm & Review</h3>
                <p className="text-xs text-[var(--silver-gray)] mt-1">Xác nhận đơn hàng: <span className="text-[var(--primary)] font-mono">#{reviewOrder.id.slice(0, 8)}</span></p>
              </div>
              <form onSubmit={handleSubmitReview} className="space-y-5">
                <div className="flex flex-col items-center gap-2">
                  <label className="text-sm font-semibold text-[var(--foreground)] dark:text-gray-300">Đánh giá sản phẩm</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setRating(star)} className="p-1 transition-transform hover:scale-125 cursor-pointer">
                        <Star className={`w-8 h-8 ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[var(--foreground)] dark:text-gray-300">Nhận xét (Tùy chọn)</label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Sản phẩm rất tuyệt vời..." rows={4} className="w-full bg-[var(--input-background)] dark:bg-black/40 border border-[var(--border)] dark:border-white/10 rounded-2xl p-4 text-sm text-[var(--foreground)] dark:text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] outline-none resize-none"/>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setReviewOrder(null)} className="flex-1 py-3 bg-[var(--muted)] dark:bg-white/5 hover:bg-[var(--accent)] dark:hover:bg-white/10 text-[var(--foreground)] dark:text-gray-300 font-bold rounded-xl text-sm transition-colors cursor-pointer">Hủy</button>
                  <button type="submit" disabled={submittingReview} className="flex-1 py-3 bg-[var(--primary)] text-white font-bold rounded-xl text-sm hover:opacity-90 cursor-pointer">{submittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--card)] dark:bg-[#1A1528] border border-red-500/30 rounded-3xl p-6 max-w-md w-full space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Trash2 className="w-7 h-7 text-red-400" />
                </div>
                <h3 id="delete-account-title" className="text-xl font-bold text-[var(--foreground)] dark:text-white">Delete your account?</h3>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">
                  This cannot be undone. Your login will be permanently deleted{user?.email ? ` (${user.email})` : ''}. Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm.
                </p>
              </div>
              <input
                type="text"
                aria-label="Type DELETE to confirm account deletion"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-3 bg-[var(--input-background)] dark:bg-black/40 border border-red-500/30 rounded-xl text-[var(--foreground)] dark:text-white text-center font-mono focus:border-red-500 outline-none"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                  disabled={deletingAccount}
                  className="flex-1 py-3 bg-[var(--muted)] dark:bg-white/5 hover:bg-[var(--accent)] dark:hover:bg-white/10 text-[var(--foreground)] dark:text-gray-300 font-bold rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deletingAccount ? 'Deleting...' : 'Delete permanently'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
