import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('dioxyzine_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('dioxyzine_cart', JSON.stringify(cart));
  }, [cart]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  const addToCart = (product) => {
    // Tạo khóa duy nhất kết hợp ID và Size để phân biệt sản phẩm khác size
    const productKey = `${product.id}_${product.selectedSize || 'default'}`;
    
    setCart(prev => {
      const existingIndex = prev.findIndex(item => `${item.id}_${item.selectedSize || 'default'}` === productKey);
      
      const addQty = Number(product.qty) || 1;

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = existing.qty + addQty;
        // Kiểm tra stock nếu có
        if (product.stock && newQty > product.stock) return prev;
        
        const updated = [...prev];
        updated[existingIndex] = { ...existing, qty: newQty };
        return updated;
      }
      
      return [...prev, { ...product, cartKey: productKey, qty: addQty }];
    });
    setIsCartOpen(true); 
  };

  const updateCartQty = (cartKey, delta) => {
    setCart(prev => prev.map(item => {
      const currentKey = item.cartKey || `${item.id}_${item.selectedSize || 'default'}`;
      if (currentKey === cartKey) {
        const newQty = item.qty + delta;
        if (newQty > 0 && (!item.stock || newQty <= item.stock)) {
          return { ...item, qty: newQty };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (cartKey) => setCart(prev => prev.filter(item => {
    const currentKey = item.cartKey || `${item.id}_${item.selectedSize || 'default'}`;
    return currentKey !== cartKey;
  }));
  
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{
      cart, cartTotal, cartCount, isCartOpen, setIsCartOpen,
      addToCart, updateCartQty, removeFromCart, clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);