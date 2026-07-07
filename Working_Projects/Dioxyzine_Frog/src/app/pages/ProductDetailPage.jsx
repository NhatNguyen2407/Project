import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
// Bổ sung Star và MessageSquare vào đây
import { ChevronLeft, ChevronRight, PlusCircle, Sparkles, Info, ShoppingCart, Star, MessageSquare } from 'lucide-react';

import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { MOCK_PRODUCTS } from '../data/storeData';
import { CartDrawer } from '../components/store/CartDrawer';
import { CheckoutModal } from '../components/store/CheckoutModal';
import { SEO } from '../components/common_components/SEO';
// Bổ sung import supabase để lấy reviews
import { supabase } from '../service/supabase';

export function ProductDetailPage() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  
  // Xác định xem đây là hàng Custom hay hàng Sẵn có (Ready Use)
  const isReadyUse = id?.startsWith('RDY-');
  
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [sizeIndex, setSizeIndex] = useState(0);
  
  // States riêng cho hàng Custom
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [customSizeText, setCustomSizeText] = useState('');
  const [hasAccessory, setHasAccessory] = useState(false);
  const [accessoryQuantity, setAccessoryQuantity] = useState(11);

  // States quản lý Modal Giỏ hàng / Thanh toán
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [liveRating, setLiveRating] = useState(0);

  // Tìm thông tin sản phẩm dựa trên loại hàng
  const product = isReadyUse 
    ? MOCK_PRODUCTS.find((p) => p.id === id)
    : products.find((p) => p.id === id);

  useEffect(() => {
    if (product) {
      setCurrentImage(0);
      setQuantity(isReadyUse ? 1 : (product.moq || 11));
      setSizeIndex(0);
      setIsCustomSize(false);
      setCustomSizeText('');
      setHasAccessory(false);
      setAccessoryQuantity(product.moq || 11);
    }
  }, [id, product, isReadyUse]);

  // 🚀 FETCH REVIEWS THỰC TẾ TỪ DATABASE
  useEffect(() => {
    const fetchLiveReviews = async () => {
      if (!product?.title) return;
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('customer_name, rating, review_comment, created_at')
          .not('rating', 'is', null) // Chỉ lấy đơn đã có đánh giá
          .ilike('product_name', `%${product.title}%`) // Tìm tên sản phẩm trong giỏ hàng
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setReviews(data);
          // Tính trung bình cộng số sao
          const avg = data.reduce((acc, curr) => acc + curr.rating, 0) / data.length;
          setLiveRating(avg);
        } else {
          setLiveRating(product.rating || 5); // Nếu chưa ai đánh giá thì lấy mặc định
        }
      } catch (err) {
        console.error("Lỗi tải reviews:", err);
      }
    };
    fetchLiveReviews();
  }, [product]);

  if (loading && !isReadyUse) {
    return <div className="min-h-screen pt-32 text-center text-2xl text-[var(--primary)] font-bold animate-pulse">Loading product data...</div>;
  }

  if (!product) {
    return <div className="min-h-screen pt-32 text-center text-white text-2xl">Product not found.</div>;
  }

  let images = [];
  if (product.images && product.images.length > 0) {
    images = product.images; // Đọc data cứng (MOCK_PRODUCTS)
  } else {
    // Đọc data từ Database (Mini CMS)
    const cover = product.image_cover || product.image;
    if (cover) images.push(cover);
    
    if (product.images_gallery) {
      // Cắt chuỗi ảnh phụ bằng dấu | và ghép nối vào mảng ảnh chính
      const gallery = product.images_gallery.split('|').map(img => img.trim()).filter(img => img !== '');
      images = [...images, ...gallery];
    }
  }

  // Khởi tạo các mảng để làm nút Next/Prev
  const listToUse = isReadyUse ? MOCK_PRODUCTS : products;
  const currentIndex = listToUse.findIndex((p) => p.id === id);
  const prevProduct = currentIndex > 0 ? listToUse[currentIndex - 1] : listToUse[listToUse.length - 1];
  const nextProduct = currentIndex < listToUse.length - 1 ? listToUse[currentIndex + 1] : listToUse[0];

  const currentMoq = isReadyUse ? 1 : (product.moq || 11);
  const maxQty = isReadyUse ? product.stock : 1000;

  const nextImage = () => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevImage = () => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  // TÍNH GIÁ TIỀN
  const calculateLivePrice = () => {
    if (isReadyUse) {
      return { unitPrice: product.price, totalPrice: product.price * quantity };
    }
    
    if (isCustomSize || product.pricingType === 'contact') return { unitPrice: 0, totalPrice: 0 };
    
    let bracket = product.priceBrackets?.find(b => quantity >= b.min && quantity <= b.max);
    if (!bracket && product.priceBrackets?.length > 0) bracket = product.priceBrackets[0];
    
    const basePrices = bracket?.prices || [];
    const baseUnitPrice = basePrices[sizeIndex] || basePrices[basePrices.length - 1] || 0;
    const productTotal = baseUnitPrice * quantity;

    let accTotal = 0;
    if (hasAccessory) {
      const addonsArr = product.addons?.phuKien || [];
      const accUnitPrice = addonsArr[sizeIndex] || addonsArr[addonsArr.length - 1] || 0;
      accTotal = accUnitPrice * accessoryQuantity;
    }

    return { unitPrice: baseUnitPrice, totalPrice: productTotal + accTotal };
  };

  const pricing = calculateLivePrice();
  const displayTitle = product.title || product.name || '';
  const displayDesc = product.description || '';
  const displayPrice = (val) => (!isReadyUse && (isCustomSize || product.pricingType === 'contact')) ? 'Inquiry' : `$${Number(val).toFixed(2)}`;

  return (
    <>
      <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
        <SEO 
          title={displayTitle} 
          description={displayDesc} 
          image={images[0]} 
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link to={`/products/${isReadyUse ? 'readyuse' : 'custom'}`} className="inline-flex items-center gap-2 text-[var(--silver-gray)] hover:text-[var(--primary)] transition-colors font-medium">
              <ChevronLeft className="w-4 h-4" />
              Back to Products
            </Link>

            <div className="flex items-center gap-3">
              <Link to={`/product/${prevProduct.id}`} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--silver-gray)] hover:text-white hover:border-[var(--primary)] transition-all">
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Previous</span>
              </Link>
              <Link to={`/product/${nextProduct.id}`} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--silver-gray)] hover:text-white hover:border-[var(--primary)] transition-all">
                <span className="hidden sm:inline text-sm font-medium">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Ảnh sản phẩm */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-[var(--card)] shadow-[0_0_30px_rgba(139,114,190,0.15)] border border-[var(--border)] group">
                <img src={images[currentImage]} alt="Product" className="w-full h-full object-cover opacity-90 transition-all duration-300" />
                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--cyber-black)]/80 text-white opacity-0 group-hover:opacity-100 hover:bg-[var(--primary)] flex items-center justify-center z-10"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--cyber-black)]/80 text-white opacity-0 group-hover:opacity-100 hover:bg-[var(--primary)] flex items-center justify-center z-10"><ChevronRight className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            </div>

            {/* Chi tiết sản phẩm */}
            <div className="space-y-6">
              <div>
                <h1 className="font-heading mb-4 text-white drop-shadow-[0_0_8px_rgba(139,114,190,0.4)] text-3xl md:text-4xl">{displayTitle}</h1>
                <p className="text-lg text-[var(--silver-gray)] leading-relaxed">{displayDesc}</p>
              </div>

              {/* KHU VỰC GIÁ TIỀN */}
              {(!isReadyUse && product.pricingType === 'contact') ? (
                <div className="bg-[#1A1528] border border-[var(--primary)]/50 rounded-3xl p-8 text-center shadow-[0_0_30px_rgba(139,114,190,0.2)]">
                  <Sparkles className="w-12 h-12 text-[var(--primary)] mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Custom Quote Required</h3>
                  <p className="text-[var(--silver-gray)] text-sm">Please submit an inquiry for us to provide the most accurate quote!</p>
                </div>
              ) : (
                <div className="bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)] shadow-lg space-y-6">
                  
                  {/* HIỂN THỊ SỐ SAO THỰC TẾ */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-5 h-5 ${star <= Math.round(liveRating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} />
                      ))}
                    </div>
                    <span className="text-[var(--silver-gray)] font-bold text-sm ml-2">
                      {liveRating.toFixed(1)} / 5.0 ({reviews.length} reviews)
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mb-4 border-b border-[var(--border)] pb-6">
                    <div>
                      <span className="text-sm text-[var(--muted-foreground)]">Unit Price</span>
                      <p className="text-3xl lg:text-4xl font-bold text-[var(--primary)]">{displayPrice(pricing.unitPrice)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-[var(--muted-foreground)]">Total Price</span>
                      <p className="text-2xl lg:text-3xl font-bold text-white">{displayPrice(pricing.totalPrice)}</p>
                    </div>
                  </div>

                  {/* CHỌN SIZE */}
                  <div>
                    <label className="font-semibold mb-3 block text-white">Select Size</label>
                    <div className="grid grid-cols-3 gap-3">
                      {product.sizes?.map((option, index) => (
                        <button key={option.key} onClick={() => { setSizeIndex(index); setIsCustomSize(false); }} className={`p-3 rounded-2xl border transition-all ${!isCustomSize && sizeIndex === index ? 'border-[var(--primary)] bg-[var(--primary)]/20 text-white' : 'border-[var(--border)] text-[var(--silver-gray)]'}`}>
                          <p className="font-medium text-sm">{option.label}</p>
                        </button>
                      ))}
                      {!isReadyUse && (
                        <button onClick={() => setIsCustomSize(true)} className={`p-3 rounded-2xl border transition-all ${isCustomSize ? 'border-[var(--primary)] bg-[var(--primary)]/20 text-white' : 'border-[var(--border)] text-[var(--silver-gray)]'}`}>
                          <p className="font-medium text-sm">Custom Size</p>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* CHỌN SỐ LƯỢNG */}
                  <div>
                    <div className="flex items-center justify-between mb-3 mt-6">
                      <label className="font-semibold text-white">Quantity</label>
                      <div className="flex items-center gap-2">
                        <input type="number" min={currentMoq} max={maxQty} value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || currentMoq)} className="w-20 px-2 py-1 bg-[#1A1528] border border-[var(--border)] text-[var(--primary)] font-bold text-center rounded-lg outline-none" />
                        <span className="text-sm font-medium text-[var(--silver-gray)]">{isReadyUse ? `(Stock: ${maxQty})` : 'pcs'}</span>
                      </div>
                    </div>
                    <input type="range" min={currentMoq} max={maxQty} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-[var(--primary)] cursor-pointer" />
                  </div>
                  
                  {/* ACCESSORY DÀNH RIÊNG CHO HÀNG CUSTOM */}
                  {!isReadyUse && (
                    <div className="pt-4 border-t border-[var(--border)]">
                      <div className="flex items-center justify-between cursor-pointer p-4 rounded-2xl bg-[var(--cyber-black)] border border-[var(--border)]" onClick={() => setHasAccessory(!hasAccessory)}>
                        <h4 className="font-semibold text-white">Add Accessories</h4>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${hasAccessory ? 'bg-[var(--primary)]' : 'bg-[#1A1528] border border-[var(--border)]'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${hasAccessory ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                      </div>
                      <AnimatePresence>
                        {hasAccessory && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-6 overflow-hidden">
                            <div className="flex items-center justify-between mb-3">
                              <label className="font-semibold text-white">Accessory Qty</label>
                              <div className="flex items-center gap-2">
                                <input type="number" min="1" max="1000" value={accessoryQuantity} onChange={(e) => setAccessoryQuantity(Number(e.target.value) || 1)} className="w-20 px-2 py-1 bg-[#1A1528] border border-[var(--border)] text-[var(--primary)] font-bold text-center rounded-lg outline-none" />
                                <span className="text-sm font-medium text-[var(--silver-gray)]">pcs</span>
                              </div>
                            </div>
                            <input type="range" min="1" max="1000" value={accessoryQuantity} onChange={(e) => setAccessoryQuantity(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-[var(--primary)] cursor-pointer" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}

              {/* NÚT KÍCH HOẠT (INQUIRY HOẶC ADD TO CART) */}
              {isReadyUse ? (
                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
                  disabled={product.stock === 0}
                  onClick={() => addToCart({...product, qty: quantity, selectedSize: product.sizes?.[sizeIndex]?.label})} 
                  className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all ${product.stock === 0 ? 'bg-white/10 text-gray-400 cursor-not-allowed' : 'bg-[var(--primary)] text-white shadow-[0_0_20px_rgba(139,114,190,0.5)] cursor-pointer'}`}
                >
                  <ShoppingCart className="w-6 h-6" /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </motion.button>
              ) : (
                <Link to="/inquiry" state={{ passedProduct: displayTitle, passedQty: product.pricingType === 'contact' ? '' : quantity, passedSize: product.pricingType === 'contact' ? '' : (isCustomSize ? customSizeText : product.sizes?.[sizeIndex]?.label), passedAccQty: hasAccessory && product.pricingType !== 'contact' ? accessoryQuantity : 0 }}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-4 rounded-full bg-[#1A1528] border border-[var(--primary)] text-white font-bold text-lg hover:bg-[var(--primary)] transition-colors cursor-pointer">
                    Submit Inquiry
                  </motion.button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GỌI CART VÀ CHECKOUT VÀO ĐÂY ĐỂ HOẠT ĐỘNG KHI CLICK */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />

      {/* 🚀 KHU VỰC HIỂN THỊ BÌNH LUẬN CỦA KHÁCH HÀNG */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-24">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 font-heading">
          <MessageSquare className="text-[var(--primary)]" /> Customer Reviews
        </h3>
        
        {reviews.length === 0 ? (
          <div className="bg-[#1A1528] rounded-3xl p-8 border border-[var(--border)] text-center text-[var(--muted-foreground)]">
            Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên trải nghiệm nhé!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev, idx) => (
              <div key={idx} className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-white font-bold text-sm">{rev.customer_name || 'Khách hàng ẩn danh'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(rev.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-700'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-[var(--silver-gray)] text-sm italic">"{rev.review_comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}