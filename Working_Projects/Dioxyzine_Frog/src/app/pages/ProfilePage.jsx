import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, LogOut, Package, Calendar, Clock, Tag, CreditCard, Crown, Check, Star, MessageSquare, Truck, AlertCircle, PlusCircle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../service/supabase';

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Popup States
  const [reviewOrder, setReviewOrder] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipping', 'Completed'];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const fetchMyOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', error.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  const completedCount = orders.filter(
    (order) => order.status?.toLowerCase() === 'completed'
  ).length;

  const getMembershipDetails = () => {
    if (completedCount >= 10) {
      return { tierName: 'GOLD VIP MEMBER', perks: 'Free Shipping + 10% OFF Total Bill', gradient: 'from-[#4A154B] via-[#2C1654] to-[#120C1F]' };
    } else if (completedCount >= 7) {
      return { tierName: 'SILVER MEMBER', perks: 'Free Shipping + 5% OFF Total Bill', gradient: 'from-[#3A1C6E] via-[#211343] to-[#100A21]' };
    } else if (completedCount >= 5) {
      return { tierName: 'BRONZE MEMBER', perks: 'Free Shipping on All Orders', gradient: 'from-[#2D1B54] via-[#1C1236] to-[#0A0614]' };
    } else {
      return { tierName: 'STANDARD MEMBER', perks: 'Standard Shipping Rates Apply', gradient: 'from-[#1E1135] via-[#130B22] to-[#08040F]' };
    }
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
      const { error } = await supabase
        .from('inquiries')
        .update({ 
          status: 'Completed',
          rating: rating,
          review_comment: comment
        })
        .eq('id', reviewOrder.id);

      if (error) throw error;

      setReviewOrder(null);
      setRating(5);
      setComment('');
      await fetchMyOrders();
    } catch (error) {
      alert('Lỗi khi hoàn thành đơn hàng: ' + error.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-transparent relative z-10">
        <p className="text-[var(--primary)] text-lg font-medium">Please login to view this page...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 h-fit shadow-[0_0_30px_rgba(139,114,190,0.05)]">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#1A1528] rounded-full flex items-center justify-center border-2 border-[var(--primary)] mb-4">
                <User className="w-10 h-10 text-[var(--primary)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--primary)] truncate w-full">{user.user_metadata?.full_name || 'Froggy Member'}</h2>
              <div className="flex items-center gap-2 text-[var(--primary)] opacity-80 mt-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm truncate">{user.email}</span>
              </div>
              <div className="w-full border-t border-[var(--border)] my-6"></div>
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--primary)]/5 text-[var(--primary)] font-bold hover:bg-[var(--primary)]/10 transition-colors cursor-pointer">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className={`bg-gradient-to-br ${currentTier.gradient} border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.4)]`}>
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

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(139,114,190,0.05)]">
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
                    const currentStepIdx = getStepIndex(order.status);
                    const isReturned = order.status?.toLowerCase() === 'returned';

                    return (
                      <div key={order.id} className="bg-[#1A1528] border border-[var(--border)] rounded-2xl p-5 space-y-5 hover:border-[var(--primary)]/30 transition-colors">
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-[var(--primary)] opacity-50">#{order.id.slice(0, 8)}</span>
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 font-semibold">{order.status || 'Pending'}</span>
                            </div>
                            <h4 className="text-lg font-bold text-[var(--primary)]">{order.product_name}</h4>
                            
                            <div className="flex flex-col gap-1 text-xs text-[var(--primary)] opacity-80 mt-2">
                              <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Qty: {order.quantity}</span>
                              <span className="flex items-center gap-1.5"><PlusCircle className="w-3.5 h-3.5" /> Addons: {order.addons || 0}</span>
                              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date Submitted: {new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                              <span className="flex items-center gap-1.5 font-semibold"><Truck className="w-3.5 h-3.5" /> Estimated Shipping: {order.estimated_shipping_date ? new Date(order.estimated_shipping_date).toLocaleDateString('vi-VN') : 'TBD'}</span>
                            </div>
                          </div>
                          
                          {/* KHU VỰC NÚT BẤM CẬP NHẬT MỚI */}
                          <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-start sm:justify-end">
                            
                            {/* Nút Xác nhận và Hoàn hàng (Chỉ hiện lúc Shipping) */}
                            {order.status?.toLowerCase() === 'shipping' && (
                              <>
                                <button onClick={() => setReviewOrder(order)} className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-lg shadow-green-900/20 cursor-pointer">
                                  <Check className="w-4 h-4" /> Received
                                </button>
                                <button onClick={() => setReturnOrder(order)} className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer">
                                  <RotateCcw className="w-4 h-4" /> Return
                                </button>
                              </>
                            )}

                            {/* Nút Đánh giá (Hiện lúc Completed mà chưa có rating) */}
                            {order.status?.toLowerCase() === 'completed' && !order.rating && (
                              <button onClick={() => setReviewOrder(order)} className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/20 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer">
                                <Star className="w-4 h-4" /> Leave Review
                              </button>
                            )}

                            <a href={order.image_link} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none text-center px-4 py-2 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold hover:bg-[var(--primary)]/20 transition-colors">View Design</a>
                          </div>
                        </div>

                        {/* HIỂN THỊ ĐÁNH GIÁ (NẾU CÓ) */}
                        {order.status?.toLowerCase() === 'completed' && order.rating && (
                          <div className="p-4 bg-black/20 rounded-xl border border-white/5 mt-2">
                            <div className="flex items-center gap-1 mb-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-3.5 h-3.5 ${star <= order.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} />
                              ))}
                              <span className="text-xs text-yellow-500 font-bold ml-2">My Review</span>
                            </div>
                            {order.review_comment && (
                              <p className="text-xs text-gray-400 italic">"{order.review_comment}"</p>
                            )}
                          </div>
                        )}

                        {/* THANH TIẾN ĐỘ */}
                        {!isReturned ? (
                          <div className="pt-2">
                            <div className="relative flex justify-between items-center w-full">
                              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
                              <div className="absolute top-1/2 left-0 h-0.5 bg-[var(--primary)] -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%` }}></div>

                              {STEPS.map((step, index) => {
                                const isPassed = index <= currentStepIdx;
                                const isCurrent = index === currentStepIdx;
                                return (
                                  <div key={step} className="flex flex-col items-center relative z-10">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold transition-all duration-300 ${isPassed ? 'bg-[var(--primary)] border-[var(--primary)] text-black' : 'bg-[#1A1528] border-white/10 text-gray-500'} ${isCurrent ? 'ring-4 ring-[var(--primary)]/20 scale-110' : ''}`}>{index + 1}</div>
                                    <span className={`text-[10px] mt-1.5 font-medium tracking-wide transition-colors ${isPassed ? 'text-[var(--primary)]' : 'text-gray-600'} ${isCurrent ? 'font-bold' : ''}`}>{step}</span>
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
          </div>
        </div>
      </div>

      {/* MODAL ĐÁNH GIÁ ĐƠN HÀNG */}
      <AnimatePresence>
        {reviewOrder && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A1528] border border-[var(--border)] rounded-3xl p-6 max-w-md w-full space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2"><MessageSquare className="text-[var(--primary)]" /> Confirm & Review</h3>
                <p className="text-xs text-[var(--silver-gray)] mt-1">Xác nhận và đánh giá đơn hàng: <span className="text-[var(--primary)] font-mono">#{reviewOrder.id.slice(0, 8)}</span></p>
              </div>
              <form onSubmit={handleSubmitReview} className="space-y-5">
                <div className="flex flex-col items-center gap-2">
                  <label className="text-sm font-semibold text-gray-300">Chất lượng sản phẩm thế nào?</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setRating(star)} className="p-1 transition-transform hover:scale-125 cursor-pointer">
                        <Star className={`w-8 h-8 ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-300">Feedback cho xưởng</label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm nhé..." required rows={4} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-[var(--primary)] outline-none resize-none" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setReviewOrder(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-sm transition-colors cursor-pointer">Hủy bỏ</button>
                  <button type="submit" disabled={submittingReview} className="flex-1 py-3 bg-[var(--primary)] text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer">{submittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL HƯỚNG DẪN HOÀN TRẢ HÀNG */}
      <AnimatePresence>
        {returnOrder && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A1528] border border-[var(--border)] rounded-3xl p-6 max-w-md w-full space-y-4 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Yêu cầu hoàn hàng</h3>
              <p className="text-sm text-gray-300">
                Theo chính sách của tiệm, mọi khiếu nại và yêu cầu hoàn trả chỉ được giải quyết trong vòng <strong>48 giờ</strong> kể từ lúc nhận hàng.
              </p>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-gray-400 mt-2 text-left space-y-2">
                <p>Vui lòng nhắn tin trực tiếp cho Fanpage Dioxyzine Frog kèm theo:</p>
                <ul className="list-disc list-inside text-white/80">
                  <li>Mã đơn hàng: <strong className="text-[var(--primary)]">#{returnOrder.id.slice(0, 8)}</strong></li>
                  <li>Video unbox rõ nét tình trạng hàng</li>
                  <li>Lý do yêu cầu hoàn trả</li>
                </ul>
              </div>
              <button onClick={() => setReturnOrder(null)} className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer">
                Đã rõ, Đóng lại
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}