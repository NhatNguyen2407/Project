import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
// 🚀 Thêm Shield icon cho dòng reply của Admin
import { ChevronLeft, ChevronRight, PlusCircle, Sparkles, ShoppingCart, Star, MessageSquare, Plus, Minus, Clock, Component, Package, Tag, Check, Shield } from 'lucide-react';

import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { MOCK_PRODUCTS } from '../data/storeData';
import { CartDrawer } from '../components/store/CartDrawer';
import { CheckoutModal } from '../components/store/CheckoutModal';
import { SEO } from '../components/common_components/SEO';
import { supabase } from '../service/supabase';

export function ProductDetailPage() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  
  const isReadyUse = id?.startsWith('RDY-');
  
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [sizeIndex, setSizeIndex] = useState(0);
  
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [customSizeText, setCustomSizeText] = useState('');
  const [hasAccessory, setHasAccessory] = useState(false);
  const [accessoryQuantity, setAccessoryQuantity] = useState(11);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [liveRating, setLiveRating] = useState(0);

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

  useEffect(() => {
    const fetchLiveReviews = async () => {
      if (!product?.title) return;
      try {
        const { data, error } = await supabase
          .from('inquiries')
          // 🚀 Gọi thêm admin_reply
          .select('customer_name, rating, review_comment, created_at, admin_reply')
          .not('rating', 'is', null)
          // 🚀 Chỉ lấy các review KHÔNG bị ẩn
          .eq('is_hidden', false) 
          .ilike('product_name', `%${product.title}%`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setReviews(data);
          const avg = data.reduce((acc, curr) => acc + curr.rating, 0) / data.length;
          setLiveRating(avg);
        } else {
          setLiveRating(product.rating || 5);
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
    images = product.images; 
  } else {
    const cover = product.image_cover || product.image;
    if (cover) images.push(cover);
    
    if (product.images_gallery) {
      const gallery = product.images_gallery.split('|').map(img => img.trim()).filter(img => img !== '');
      images = [...images, ...gallery];
    }
  }

  const listToUse = isReadyUse ? MOCK_PRODUCTS : products;
  const currentIndex = listToUse.findIndex((p) => p.id === id);
  const prevProduct = currentIndex > 0 ? listToUse[currentIndex - 1] : listToUse[listToUse.length - 1];
  const nextProduct = currentIndex < listToUse.length - 1 ? listToUse[currentIndex + 1] : listToUse[0];

  const currentMoq = isReadyUse ? 1 : (product.moq || 11);
  const maxQty = isReadyUse ? product.stock : 1000;

  const nextImage = () => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevImage = () => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const calculateLivePrice = () => {
    if (isReadyUse) {
      return { unitPrice: product.price, totalPrice: product.price * quantity };
    }
    
    if (isCustomSize || product.pricingType === 'contact') return { unitPrice: 0, totalPrice: 0 };
    
    let bracket = product.priceBrackets?.find(b => quantity >= b.min && quantity <= b.max);
    if (!bracket && product.priceBrackets?.length > 0) bracket = product.priceBrackets[0];
    
    const basePrices = bracket?.prices || [];
    const baseUnitPrice = basePrices[sizeIndex] || basePrices[basePrices.length - 1] || 0;
    
    const calcQty = Number(quantity) || currentMoq;
    const productTotal = baseUnitPrice * calcQty;

    let accTotal = 0;
    if (hasAccessory) {
      const addonsArr = product.addons?.phuKien || [];
      const accUnitPrice = addonsArr[sizeIndex] || addonsArr[addonsArr.length - 1] || 0;
      const calcAccQty = Number(accessoryQuantity) || 1;
      accTotal = accUnitPrice * calcAccQty;
    }

    return { unitPrice: baseUnitPrice, totalPrice: productTotal + accTotal };
  };

  const pricing = calculateLivePrice();
  const displayTitle = product.title || product.name || '';
  const displayDesc = product.description || '';
  const displayPrice = (val) => (!isReadyUse && (isCustomSize || product.pricingType === 'contact')) ? 'Inquiry' : `$${Number(val).toFixed(2)}`;

  const renderMaterials = () => {
    const title = displayTitle.toLowerCase();
    const category = Array.isArray(product.category) ? product.category.join(' ').toLowerCase() : (product.category || '').toLowerCase();

    const isEmbroidery = title.includes('thêu') || title.includes('embroidery') || title.includes('embroidered');
    const isCustomizeTab = category.includes('customize');

    if (isCustomizeTab) {
      return (
        <>
          <li>Specialized based on your ideas</li>
        </>
      );
    }

    if (isEmbroidery) {
      return (
        <>
          <li>Pile Plush Fabric</li>
          <li>Options: 1mm, 3mm, 5mm, 7mm</li>
        </>
      );
    }

    return (
      <>
        <li>Velboa Fabric</li>
      </>
    );
  };

  return (
    <>
      <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
        <SEO title={displayTitle} description={displayDesc} image={images[0]} />
        
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
            <div className="space-y-4">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-[var(--card)] shadow-[0_0_30px_rgba(139,114,190,0.15)] border border-[var(--border)] group">
                <img src={images[currentImage]} alt="Product" className="w-full h-full object-cover opacity-90 transition-all duration-300" />
                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--cyber-black)]/80 text-white opacity-0 group-hover:opacity-100 hover:bg-[var(--primary)] flex items-center justify-center z-10 transition-all"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--cyber-black)]/80 text-white opacity-0 group-hover:opacity-100 hover:bg-[var(--primary)] flex items-center justify-center z-10 transition-all"><ChevronRight className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="font-heading mb-4 text-white drop-shadow-[0_0_8px_rgba(139,114,190,0.4)] text-3xl md:text-4xl">{displayTitle}</h1>
                <p className="text-lg text-[var(--silver-gray)] leading-relaxed">{displayDesc}</p>
              </div>

              {(!isReadyUse && product.pricingType === 'contact') ? (
                <div className="bg-[#1A1528] border border-[var(--primary)]/50 rounded-3xl p-8 text-center shadow-[0_0_30px_rgba(139,114,190,0.2)]">
                  <Sparkles className="w-12 h-12 text-[var(--primary)] mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Custom Quote Required</h3>
                  <p className="text-[var(--silver-gray)] text-sm">Please submit an inquiry for us to provide the most accurate quote!</p>
                </div>
              ) : (
                <div className="bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)] shadow-lg space-y-6">
                  
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

                  <div className="mb-4 border-b border-[var(--border)] pb-6">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-sm text-[var(--muted-foreground)]">Unit Price</span>
                        <p className="text-3xl lg:text-4xl font-bold text-[var(--primary)]">{displayPrice(pricing.unitPrice)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-[var(--muted-foreground)]">Total Price</span>
                        <p className="text-2xl lg:text-3xl font-bold text-white">{displayPrice(pricing.totalPrice)}</p>
                      </div>
                    </div>
                    
                    {!isReadyUse && (
                      <div className="mt-3 flex justify-end">
                        <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                          MOQ: {currentMoq} pcs
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-semibold mb-3 block text-white">Select Size</label>
                    <div className="grid grid-cols-3 gap-3">
                      {product.sizes?.map((option, index) => (
                        <button key={option.key} onClick={() => { setSizeIndex(index); setIsCustomSize(false); }} className={`p-3 rounded-2xl border transition-all ${!isCustomSize && sizeIndex === index ? 'border-[var(--primary)] bg-[var(--primary)]/20 text-white' : 'border-[var(--border)] text-[var(--silver-gray)] hover:border-gray-400'}`}>
                          <p className="font-medium text-sm">{option.label}</p>
                        </button>
                      ))}
                      {!isReadyUse && (
                        <button onClick={() => setIsCustomSize(true)} className={`p-3 rounded-2xl border transition-all ${isCustomSize ? 'border-[var(--primary)] bg-[var(--primary)]/20 text-white' : 'border-[var(--border)] text-[var(--silver-gray)] hover:border-gray-400'}`}>
                          <p className="font-medium text-sm">Custom Size</p>
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3 mt-6">
                      <label className="font-semibold text-white">Quantity</label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-[#1A1528] border border-[var(--border)] rounded-lg overflow-hidden">
                          <button 
                            type="button" 
                            onClick={() => setQuantity(Math.max(currentMoq, (Number(quantity) || currentMoq) - 1))} 
                            className="p-2 text-[var(--silver-gray)] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          
                          <input 
                            type="number" 
                            min={currentMoq} 
                            max={maxQty} 
                            value={quantity} 
                            onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value))} 
                            onBlur={() => setQuantity(Math.max(currentMoq, Math.min(maxQty, Number(quantity) || currentMoq)))} 
                            className="w-12 py-1 bg-transparent text-[var(--primary)] font-bold text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                          />
                          
                          <button 
                            type="button" 
                            onClick={() => setQuantity(Math.min(maxQty, (Number(quantity) || currentMoq) + 1))} 
                            className="p-2 text-[var(--silver-gray)] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-sm font-medium text-[var(--silver-gray)]">{isReadyUse ? `(Stock: ${maxQty})` : 'pcs'}</span>
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min={currentMoq} 
                      max={maxQty} 
                      value={quantity === '' ? currentMoq : quantity} 
                      onChange={(e) => setQuantity(parseInt(e.target.value))} 
                      className="w-full h-2 rounded-full appearance-none bg-white/10 accent-[var(--primary)] cursor-pointer" 
                    />
                  </div>
                  
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
                              <div className="flex items-center gap-3">
                                <div className="flex items-center bg-[#1A1528] border border-[var(--border)] rounded-lg overflow-hidden">
                                  <button 
                                    type="button" 
                                    onClick={() => setAccessoryQuantity(Math.max(1, (Number(accessoryQuantity) || 1) - 1))} 
                                    className="p-2 text-[var(--silver-gray)] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  
                                  <input 
                                    type="number" 
                                    min="1" 
                                    max="1000" 
                                    value={accessoryQuantity} 
                                    onChange={(e) => setAccessoryQuantity(e.target.value === '' ? '' : parseInt(e.target.value))} 
                                    onBlur={() => setAccessoryQuantity(Math.max(1, Math.min(1000, Number(accessoryQuantity) || 1)))} 
                                    className="w-12 py-1 bg-transparent text-[var(--primary)] font-bold text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                  />
                                  
                                  <button 
                                    type="button" 
                                    onClick={() => setAccessoryQuantity(Math.min(1000, (Number(accessoryQuantity) || 1) + 1))} 
                                    className="p-2 text-[var(--silver-gray)] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                <span className="text-sm font-medium text-[var(--silver-gray)]">pcs</span>
                              </div>
                            </div>
                            <input 
                              type="range" 
                              min="1" 
                              max="1000" 
                              value={accessoryQuantity === '' ? 1 : accessoryQuantity} 
                              onChange={(e) => setAccessoryQuantity(parseInt(e.target.value))} 
                              className="w-full h-2 rounded-full appearance-none bg-white/10 accent-[var(--primary)] cursor-pointer" 
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="bg-[#1A1528] p-5 rounded-2xl border border-[var(--border)]">
                  <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--primary)]" /> Production Time
                  </h4>
                  <p className="text-[var(--silver-gray)] text-sm">5–10 business days</p>
                </div>
                
                <div className="bg-[#1A1528] p-5 rounded-2xl border border-[var(--border)]">
                  <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <Component className="w-4 h-4 text-[var(--primary)]" /> Material
                  </h4>
                  <ul className="text-[var(--silver-gray)] text-sm space-y-1.5 list-disc list-inside">
                    {renderMaterials()}
                  </ul>
                </div>

                <div className="bg-[#1A1528] p-5 rounded-2xl border border-[var(--border)]">
                  <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-[var(--primary)]" /> Packaging
                  </h4>
                  <ul className="text-[var(--silver-gray)] text-sm space-y-1.5 list-disc list-inside">
                    <li>Individual Poly Bag</li>
                    <li>Vacuum Packing Available</li>
                  </ul>
                </div>

                <div className="bg-[#1A1528] p-5 rounded-2xl border border-[var(--border)]">
                  <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[var(--primary)]" /> White Label
                  </h4>
                  <ul className="text-[var(--silver-gray)] text-sm space-y-1.5">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> No logo</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> No invoice</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> Direct shipping</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2">
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
      </div>

      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />

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
                
                {/* 🚀 HIỂN THỊ CÂU TRẢ LỜI CỦA ADMIN */}
                {rev.admin_reply && (
                  <div className="mt-4 bg-[var(--primary)]/10 border border-[var(--primary)]/20 p-4 rounded-xl ml-4 relative">
                    <div className="absolute -left-2 top-4 w-4 h-4 bg-[var(--card)] border-l border-b border-[var(--primary)]/20 rotate-45"></div>
                    <p className="text-xs font-bold text-[var(--primary)] mb-1 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Dioxyzine Frog Reply:
                    </p>
                    <p className="text-sm text-gray-300">"{rev.admin_reply}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}