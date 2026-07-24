import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Minus, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';

export function CartDrawer() {
  const { 
    cart, cartTotal, cartCount, isCartOpen, setIsCartOpen, updateCartQty, removeFromCart 
  } = useCart();

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
            className="relative w-full max-w-md bg-card border-l border-border flex flex-col shadow-2xl h-full"
          >
            {/* Header giỏ hàng - Màu nền linh hoạt theo theme */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted">
              <h2 className="text-2xl font-bold text-foreground font-heading">Your Cart ({cartCount})</h2>
              <button type="button" onClick={() => setIsCartOpen(false)} className="p-2 rounded-full hover:bg-card text-foreground cursor-pointer transition-colors relative z-10">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Danh sách sản phẩm trong giỏ */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-40" />
                  <p className="font-semibold text-lg">Your cart is empty.</p>
                </div>
              ) : (
                cart.map(item => {
                  const itemKey = item.cartKey || `${item.id}_${item.selectedSize || 'default'}`;
                  return (
                    <div key={itemKey} className="flex gap-4 bg-muted p-4 rounded-2xl border border-border relative shadow-sm">
                      <img src={item.image} className="w-20 h-20 rounded-xl object-cover border border-border shrink-0 bg-card" alt={item.title || item.name} />
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <h4 className="text-foreground font-bold text-sm line-clamp-1 pr-6">{item.title || item.name}</h4>
                          {/* Hiển thị Size nếu sản phẩm có chọn size */}
                          {item.selectedSize && (
                            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                              Size: {item.selectedSize}
                            </span>
                          )}
                        </div>

                        <button type="button" onClick={() => removeFromCart(itemKey)} className="absolute top-3 right-3 text-muted-foreground hover:text-red-500 cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[var(--primary)] font-black text-base">${((item.price || 0) * (item.qty || 1)).toFixed(2)}</span>
                          
                          <div className="flex items-center bg-card rounded-lg border border-border shadow-sm">
                            <button type="button" onClick={() => updateCartQty(itemKey, -1)} className="px-2.5 py-1 text-muted-foreground hover:text-[var(--primary)] cursor-pointer">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-sm text-foreground font-bold">{item.qty}</span>
                            <button type="button" onClick={() => updateCartQty(itemKey, 1)} className="px-2.5 py-1 text-muted-foreground hover:text-[var(--primary)] cursor-pointer">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer giỏ hàng & nút Thanh toán */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-border bg-muted">
                <p className="text-xs text-muted-foreground mb-3 text-center font-medium">Taxes and shipping calculated at checkout</p>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-foreground font-bold text-lg">Subtotal</span>
                  <span className="text-3xl font-black text-[var(--primary)]">${cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => {
                    setIsCartOpen(false); 
                    navigate('/checkout'); 
                  }}
                  className="w-full py-4 rounded-full bg-[var(--primary)] text-white font-bold text-lg shadow-md hover:scale-[1.01] transition-transform cursor-pointer text-center block"
                >
                  Proceed to Checkout
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