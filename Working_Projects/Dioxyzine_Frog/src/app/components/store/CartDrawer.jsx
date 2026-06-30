// src/app/components/store/CartDrawer.jsx
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Minus, Plus, ChevronRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { createPortal } from 'react-dom';

// --- ĐÃ THÊM IMPORT NÀY ĐỂ ĐIỀU HƯỚNG URL ---
import { useNavigate } from 'react-router';

export function CartDrawer() {
  const { 
    cart, cartTotal, cartCount, isCartOpen, setIsCartOpen, updateCartQty, removeFromCart 
  } = useCart();

  // Khởi tạo công cụ chuyển trang của react-router
  const navigate = useNavigate();

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[9990] flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={() => setIsCartOpen(false)} 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer" 
          />
          
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
            transition={{ type: 'tween', duration: 0.3 }} 
            className="relative w-full max-w-md bg-[var(--card)] border-l border-[var(--border)] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] h-full"
          >
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[#1A1528]">
              <h2 className="text-2xl font-bold text-white font-heading">Your Cart ({cartCount})</h2>
              <button type="button" onClick={() => setIsCartOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer transition-colors relative z-10">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--silver-gray)]">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                  <p className="font-semibold text-lg">Your cart is empty.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 bg-[#1A1528] p-3 rounded-2xl border border-[var(--border)] relative">
                    <img src={item.image} className="w-24 h-24 rounded-xl object-cover border border-[var(--border)]" alt={item.name} />
                    <div className="flex-grow flex flex-col justify-between">
                      <h4 className="text-white font-semibold text-sm line-clamp-2 pr-6">{item.name}</h4>
                      <button type="button" onClick={() => removeFromCart(item.id)} className="absolute top-3 right-3 text-gray-500 hover:text-red-400 cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[var(--primary)] font-bold">${(item.price * item.qty).toFixed(2)}</span>
                        <div className="flex items-center bg-[#08080C] rounded-lg border border-[var(--border)]">
                          <button type="button" onClick={() => updateCartQty(item.id, -1)} className="px-2 py-1 text-white hover:text-[var(--primary)] cursor-pointer">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-sm text-white font-bold">{item.qty}</span>
                          <button type="button" onClick={() => updateCartQty(item.id, 1)} className="px-2 py-1 text-white hover:text-[var(--primary)] cursor-pointer">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-[var(--border)] bg-[#1A1528]">
                <p className="text-xs text-[var(--muted-foreground)] mb-4 text-center">Taxes and shipping calculated at checkout</p>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-white font-bold text-lg">Subtotal</span>
                  <span className="text-3xl font-bold text-[var(--primary)]">${cartTotal.toFixed(2)}</span>
                </div>
                {/* --- ĐÃ SỬA CHỖ NÀY: CHUYỂN HƯỚNG URL SANG TRANG THANH TOÁN MỚI --- */}
                <button 
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false); // Đóng ngăn kéo giỏ hàng
                    navigate('/checkout'); // Phi thẳng sang trang checkout độc lập
                  }}
                  className="w-full py-4 rounded-full bg-[var(--primary)] text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(139,114,190,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}