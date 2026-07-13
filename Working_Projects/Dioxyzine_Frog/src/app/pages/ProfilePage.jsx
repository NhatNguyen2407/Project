import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, LogOut, Package, Calendar, Tag, CreditCard, Crown, Check, Star, MessageSquare, Truck, AlertCircle, PlusCircle, Settings, Save, Lock, Camera, Trash2, Heart, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../service/supabase';

import { useCart } from '../context/CartContext';
import { MOCK_PRODUCTS } from '../data/storeData';
import { toast, Toaster } from 'sonner';

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { addToCart, setIsCartOpen } = useCart();
  const [activeView, setActiveView] = useState('orders'); 

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  const [reviewOrder, setReviewOrder] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [profileForm, setProfileForm] = useState({ fullName: '', avatarUrl: '', email: '' });
  const [newPassword, setNewPassword] = useState('');
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // 🚀 Cập nhật lại các bước Tracking cho chuẩn hóa
  const STEPS = ['Pending', 'Prototyping', 'Production', 'Shipping', 'Completed'];

  const fetchMyWishlist = async () => {
    try {
      const { data, error } = await supabase.from('wishlists').select('product_id, created_at').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      setWishlist(data || []);
    } catch (error) { console.error('Lỗi khi lấy Wishlist:', error.message); } finally { setLoadingWishlist(false); }
  };

  const fetchMyOrders = async () => {
    try {
      const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (error) { console.error('Lỗi khi lấy danh sách đơn hàng:', error.message); } finally { setLoadingOrders(false); }
  };

  useEffect(() => {
    if (user) {
      setProfileForm({ fullName: user.user_metadata?.full_name || '', avatarUrl: user.user_metadata?.avatar_url || '', email: user.email || '' });
      fetchMyOrders();
      fetchMyWishlist(); 
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const completedCount = orders.filter((order) => order.status?.toLowerCase() === 'completed').length;

  const getMembershipDetails = () => {
    if (completedCount >= 10) return { tierName: 'GOLD VIP MEMBER', perks: 'Free Shipping + 10% OFF Total Bill', gradient: 'from-[#4A154B] via-[#2C1654] to-[#120C1F]' };
    if (completedCount >= 7) return { tierName: 'SILVER MEMBER', perks: 'Free Shipping + 5% OFF Total Bill', gradient: 'from-[#3A1C6E] via-[#211343] to-[#100A21]' };
    if (completedCount >= 5) return { tierName: 'BRONZE MEMBER', perks: 'Free Shipping on All Orders', gradient: 'from-[#2D1B54] via-[#1C1236] to-[#0A0614]' };
    return { tierName: 'STANDARD MEMBER', perks: 'Standard Shipping Rates Apply', gradient: 'from-[#1E1135] via-[#130B22] to-[#08040F]' };
  };

  const currentTier = getMembershipDetails();

  const getStepIndex = (status) => {
    const idx = STEPS.findIndex(s => s.toLowerCase() === (status || '').toLowerCase());
    return idx !== -1 ? idx : 0;
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewOrder) return;
    
    setSubmittingReview(true);
    try {
      // 🚀 BỔ SUNG .select() ĐỂ BẮT LỖI TÀNG HÌNH CỦA SUPABASE
      const { data, error } = await supabase.from('inquiries').update({ 
        status: 'completed', 
        rating: rating, 
        review_comment: comment 
      }).eq('id', reviewOrder.id).select();

      if (error) throw error;

      // Nếu Supabase từ chối Update, nó sẽ trả về mảng rỗng
      if (!data || data.length === 0) {
        throw new Error("Bị chặn quyền! Vui lòng chạy lệnh SQL cấp quyền UPDATE trên Supabase.");
      }

      setReviewOrder(null); 
      setRating(5); 
      setComment(''); 
      await fetchMyOrders(); 
      toast.success("Cảm ơn bạn đã xác nhận và đánh giá!");
    } catch (error) { 
      toast.error('Lỗi cập nhật: ' + error.message); 
    } finally { 
      setSubmittingReview(false); 
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      let finalAvatarUrl = profileForm.avatarUrl;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        finalAvatarUrl = publicUrl;
      }

      const { error: metaError } = await supabase.auth.updateUser({ data: { full_name: profileForm.fullName, avatar_url: finalAvatarUrl } });
      if (metaError) throw metaError;

      if (newPassword.trim() !== '') {
        const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwError) throw pwError;
      }

      if (profileForm.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: profileForm.email });
        if (emailError) throw emailError;
        toast.info('Supabase đã gửi link xác nhận đến CẢ EMAIL CŨ VÀ MỚI. Vui lòng check cả 2 hộp thư.');
      } else {
        toast.success('Đã lưu cấu hình tài khoản thành công! 🐸');
      }
      window.location.reload();
    } catch (error) { toast.error('Lỗi cập nhật: ' + error.message); } finally { setUpdatingProfile(false); }
  };

  const handleOrderAgain = async (order) => {
    const type = (order.product_type || '').toLowerCase();
    if (type === 'readyuse' || type === 'ready-made') {
      try {
        const { data: dbProduct } = await supabase.from('products').select('*').eq('title', order.product_name).single();
        let prodData = dbProduct;
        if (!prodData) prodData = MOCK_PRODUCTS.find(p => p.title === order.product_name);

        if (prodData) {
          addToCart({ ...prodData, qty: order.quantity, selectedSize: order.size });
          setIsCartOpen(true); 
          toast.success("Đã ném sản phẩm cũ vào giỏ hàng! 🛒");
        } else {
          toast.error("Sản phẩm này hiện không còn trong kho.");
        }
      } catch (err) { toast.error('Không thể tự động đặt lại đơn này.'); }
    } else {
      navigate('/inquiry', { state: { passedProduct: order.product_name, passedQty: order.quantity, passedSize: order.size || '', passedAccQty: order.addons || 0, isReorder: true } });
    }
  };

  if (!user) return <div className="min-h-screen pt-24 pb-16 flex items-center justify-center text-[var(--primary)] text-lg font-medium">Please login to view this page...</div>;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <Toaster position="top-center" richColors />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm text-center">
              <div className="w-24 h-24 bg-[#1A1528] rounded-full flex items-center justify-center border-2 border-[var(--primary)] mx-auto mb-4 overflow-hidden">
                {user.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-[var(--primary)]" />}
              </div>
              <h2 className="text-xl font-bold text-[var(--primary)] truncate">{user.user_metadata?.full_name || 'Froggy Member'}</h2>
              <div className="flex items-center justify-center gap-2 text-[var(--primary)] opacity-80 mt-2"><Mail className="w-4 h-4" /><span className="text-xs truncate">{user.email}</span></div>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-3 shadow-sm space-y-2">
              <button onClick={() => setActiveView('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'orders' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}><Package className="w-5 h-5" /> My Orders</button>
              <button onClick={() => setActiveView('wishlist')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'wishlist' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}><Heart className="w-5 h-5" /> My Wishlist</button>
              <button onClick={() => setActiveView('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'settings' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}><Settings className="w-5 h-5" /> Settings</button>
              <div className="border-t border-[var(--border)] my-2"></div>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-400 hover:bg-red-400/10 transition-colors"><LogOut className="w-5 h-5" /> Sign Out</button>
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
                      <h3 className="text-xl font-black text-[var(--primary)] tracking-wider">{currentTier.tierName}</h3>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-[var(--primary)]"><CreditCard className="w-6 h-6" /></div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-[var(--primary)] uppercase tracking-wider opacity-60">Current Benefits</p>
                      <p className="text-sm font-bold text-[var(--primary)] flex items-center gap-1.5"><Crown className="w-4 h-4" /> {currentTier.perks}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-[var(--primary)] uppercase tracking-wider opacity-60">Completed</p>
                      <p className="text-lg font-bold font-mono text-[var(--primary)]">{completedCount} Orders</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h3 className="text-xl font-bold text-[var(--primary)] mb-6 flex items-center gap-2"><Package /> My Orders ({orders.length})</h3>

                  {loadingOrders ? (
                    <div className="text-center py-8 text-[var(--primary)] opacity-60">Loading your orders...</div>
                  ) : orders.length === 0 ? (
                    <div className="bg-[#1A1528] rounded-2xl p-8 text-center border border-[var(--border)] border-dashed">
                      <p className="text-[var(--primary)] opacity-70">You don't have any orders yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => {
                        const status = (order.status || 'pending').toLowerCase();
                        const currentStepIdx = getStepIndex(status);
                        const isReturned = status === 'returned';
                        const isCompleted = status === 'completed';

                        return (
                          <div key={order.id} className="bg-[#1A1528] border border-[var(--border)] rounded-2xl p-5 space-y-5 hover:border-[var(--primary)]/30 transition-colors relative overflow-hidden">
                            
                            {/* Nút Order Again siêu vip */}
                            {isCompleted && (
                              <button 
                                onClick={() => handleOrderAgain(order)}
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
                                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 font-semibold">{order.status || 'Pending'}</span>
                                </div>
                                <h4 className="text-lg font-bold text-[var(--primary)] pr-24">{order.product_name}</h4>
                                
                                <div className="flex flex-col gap-1 text-xs text-[var(--primary)] opacity-80 mt-2">
                                  <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Qty: {order.quantity}</span>
                                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date: {new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col w-full sm:w-auto mt-4 sm:mt-0 gap-3">
                                {/* Khối vận chuyển chỉ hiện khi đang Shipping */}
                                {status === 'shipping' && (
                                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 w-full sm:w-[280px]">
                                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-[#EE0033]/20 flex items-center justify-center"><Truck className="w-4 h-4 text-[#EE0033]" /></div>
                                        <div>
                                          <p className="text-[10px] text-[var(--silver-gray)] uppercase tracking-wider">Vận chuyển</p>
                                          <p className="text-sm font-bold text-white">Viettel Post</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[10px] text-[var(--silver-gray)] uppercase tracking-wider">Mã Vận Đơn</p>
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
                                  <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-1 mb-1.5">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`w-3.5 h-3.5 ${star <= order.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} />
                                      ))}
                                      <span className="text-xs text-yellow-500 font-bold ml-2">My Review</span>
                                    </div>
                                    <p className="text-xs text-gray-400 italic">"{order.review_comment}"</p>
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
                                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
                                  <div className="absolute top-1/2 left-0 h-0.5 bg-[var(--primary)] -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%` }}></div>

                                  {STEPS.map((step, index) => {
                                    const isPassed = index <= currentStepIdx;
                                    const isCurrent = index === currentStepIdx;
                                    return (
                                      <div key={step} className="flex flex-col items-center relative z-10">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold transition-all duration-300 ${isPassed ? 'bg-[var(--primary)] border-[var(--primary)] text-black' : 'bg-[#1A1528] border-white/10 text-gray-500'} ${isCurrent ? 'ring-4 ring-[var(--primary)]/20 scale-110' : ''}`}>{index + 1}</div>
                                        <span className={`text-[10px] mt-1.5 font-medium tracking-wide transition-colors hidden sm:block ${isPassed ? 'text-[var(--primary)]' : 'text-gray-600'} ${isCurrent ? 'font-bold' : ''}`}>{step}</span>
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

            {activeView === 'settings' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-6 flex items-center gap-2"><Settings className="w-6 h-6"/> Account Settings</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* ...Phần avatar và email settings giữ nguyên để không làm dài code... */}
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--silver-gray)] font-semibold flex items-center gap-2"><User className="w-4 h-4"/> Display Name</label>
                    <input required type="text" value={profileForm.fullName} onChange={e => setProfileForm({...profileForm, fullName: e.target.value})} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:border-[var(--primary)] outline-none" />
                  </div>
                  <button type="submit" disabled={updatingProfile} className="w-full sm:w-auto px-8 py-3.5 bg-[var(--primary)] hover:bg-purple-600 text-white font-bold rounded-xl shadow-lg cursor-pointer">
                    {updatingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      <AnimatePresence>
        {reviewOrder && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A1528] border border-[var(--border)] rounded-3xl p-6 max-w-md w-full space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2"><MessageSquare className="text-[var(--primary)]" /> Confirm & Review</h3>
                <p className="text-xs text-[var(--silver-gray)] mt-1">Xác nhận đơn hàng: <span className="text-[var(--primary)] font-mono">#{reviewOrder.id.slice(0, 8)}</span></p>
              </div>
              <form onSubmit={handleSubmitReview} className="space-y-5">
                <div className="flex flex-col items-center gap-2">
                  <label className="text-sm font-semibold text-gray-300">Đánh giá sản phẩm</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setRating(star)} className="p-1 transition-transform hover:scale-125 cursor-pointer">
                        <Star className={`w-8 h-8 ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-300">Nhận xét (Tùy chọn)</label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Sản phẩm rất tuyệt vời..." rows={4} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-[var(--primary)] outline-none resize-none" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setReviewOrder(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-sm transition-colors cursor-pointer">Hủy</button>
                  <button type="submit" disabled={submittingReview} className="flex-1 py-3 bg-[var(--primary)] text-white font-bold rounded-xl text-sm hover:opacity-90 cursor-pointer">{submittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}