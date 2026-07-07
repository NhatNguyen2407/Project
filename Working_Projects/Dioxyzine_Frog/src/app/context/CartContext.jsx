import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Khởi tạo giỏ hàng từ localStorage (nếu có), không thì mảng rỗng
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('dioxyzine_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Mỗi khi giỏ hàng thay đổi, lưu ngay vào lo calStorage
  useEffect(() => {
    localStorage.setItem('dioxyzine_cart', JSON.stringify(cart));
  }, [cart]);

  // Các hàm tính toán tự động
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Logic Thêm/Sửa/Xóa
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev; // Chặn mua lố kho
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setIsCartOpen(true); // Thêm xong tự động mở giỏ hàng
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty > 0 && newQty <= item.stock) return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  
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