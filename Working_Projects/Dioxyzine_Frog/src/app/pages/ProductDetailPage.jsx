import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, PlusCircle, Sparkles, Info } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

export function ProductDetailPage() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  
  const [currentImage, setCurrentImage] = useState(0);

  // States tính giá
  const [quantity, setQuantity] = useState(11);
  const [sizeIndex, setSizeIndex] = useState(0);
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [customSizeText, setCustomSizeText] = useState('');
  const [hasAccessory, setHasAccessory] = useState(false);
  const [accessoryQuantity, setAccessoryQuantity] = useState(11);

  // RESET STATE KHI ĐỔI SẢN PHẨM
  useEffect(() => {
    const currentProduct = products.find((p) => p.id === id);
    if (currentProduct) {
      setCurrentImage(0);
      setQuantity(currentProduct.moq || 11);
      setSizeIndex(0);
      setIsCustomSize(false);
      setCustomSizeText('');
      setHasAccessory(false);
      setAccessoryQuantity(currentProduct.moq || 11);
    }
  }, [id, products]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 text-center text-2xl text-[var(--primary)] font-bold animate-pulse bg-transparent relative z-10">
        Loading product data...
      </div>
    );
  }

  const currentIndex = products.findIndex((p) => p.id === id);
  if (currentIndex === -1) {
    return (
      <div className="min-h-screen pt-32 text-center text-white bg-transparent relative z-10 text-2xl">
        Product not found.
      </div>
    );
  }

  const product = products[currentIndex];
  const prevProduct = currentIndex > 0 ? products[currentIndex - 1] : products[products.length - 1];
  const nextProduct = currentIndex < products.length - 1 ? products[currentIndex + 1] : products[0];

  const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  const currentMoq = product.moq || 11;

  const nextImage = () => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevImage = () => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const calculateLivePrice = () => {
    if (isCustomSize || product.pricingType === 'contact') return { unitPrice: 0, productTotal: 0, accUnitPrice: 0, accTotal: 0, totalPrice: 0 };
    
    let bracket = product.priceBrackets?.find(b => quantity >= b.min && quantity <= b.max);
    if (!bracket && product.priceBrackets?.length > 0) bracket = product.priceBrackets[0];
    
    const basePrices = bracket?.prices || [];
    const baseUnitPrice = basePrices[sizeIndex] || basePrices[basePrices.length - 1] || 0;
    const productTotal = baseUnitPrice * quantity;

    let accUnitPrice = 0;
    if (hasAccessory) {
      const addonsArr = product.addons?.phuKien || [];
      accUnitPrice = addonsArr[sizeIndex] || addonsArr[addonsArr.length - 1] || 0;
    }
    const accTotal = accUnitPrice * accessoryQuantity;

    return { unitPrice: baseUnitPrice, productTotal, accUnitPrice, accTotal, totalPrice: productTotal + accTotal };
  };

  const formatCurrency = (val) => {
    if (!val) return '$0.00';
    return `$${Number(val).toFixed(2)}`;
  };

  const pricing = calculateLivePrice();
  const displayTitle = product.title || '';
  const displayDesc = product.description || '';
  const displayNote = product.note || '';
  const displayPrice = (val) => (isCustomSize || product.pricingType === 'contact') ? 'Inquiry' : formatCurrency(val);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* next/prev navbar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/products" className="inline-flex items-center gap-2 text-[var(--silver-gray)] hover:text-[var(--primary)] transition-colors font-medium">
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
          {/* image */}
          <div className="space-y-4">
            <motion.div layoutId={`product-${id}`} className="relative aspect-square rounded-3xl overflow-hidden bg-[var(--card)] shadow-[0_0_30px_rgba(139,114,190,0.15)] border border-[var(--border)] group">
              {images.length > 0 ? (
                <img src={images[currentImage]} alt="Product" className="w-full h-full object-cover opacity-90 transition-all duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--muted-foreground)]">No Image</div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--cyber-black)]/80 text-white opacity-0 group-hover:opacity-100 hover:bg-[var(--primary)] flex items-center justify-center z-10"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--cyber-black)]/80 text-white opacity-0 group-hover:opacity-100 hover:bg-[var(--primary)] flex items-center justify-center z-10"><ChevronRight className="w-5 h-5" /></button>
                </>
              )}
            </motion.div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <button key={index} onClick={() => setCurrentImage(index)} className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${currentImage === index ? 'border-[var(--primary)] opacity-100 scale-105' : 'border-[var(--border)] opacity-60 hover:opacity-100'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* details */}
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#1A1528] border border-[var(--border)] text-xs font-medium text-[var(--primary)] mb-3 uppercase tracking-wider">
                {product.category?.join(' • ')}
              </span>
              <h1 className="font-heading mb-4 text-white drop-shadow-[0_0_8px_rgba(139,114,190,0.4)] text-3xl md:text-4xl">{displayTitle}</h1>
              <p className="text-lg text-[var(--silver-gray)] leading-relaxed">{displayDesc}</p>
              
              <div className="mt-4 p-4 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/30">
                <p className="text-sm font-semibold text-white">
                  {product.pricingType === 'contact' 
                    ? '✨ This is a personalized product crafted uniquely from your ideas without using any standard templates.'
                    : '💡 Inquiry to get the design template'
                  }
                </p>
              </div>
            </div>

            {product.pricingType === 'contact' ? (
              <div className="bg-[#1A1528] border border-[var(--primary)]/50 rounded-3xl p-8 text-center shadow-[0_0_30px_rgba(139,114,190,0.2)]">
                <Sparkles className="w-12 h-12 text-[var(--primary)] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Custom Quote Required</h3>
                <p className="text-[var(--silver-gray)] text-sm">
                  This item is bespoke made. Please submit an inquiry for us to provide the most accurate quote!
                </p>
              </div>
            ) : (
              <>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 text-white shadow-[0_0_30px_rgba(139,114,190,0.2)]">
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
                </div>

                <p className="text-sm italic text-center text-[var(--muted-foreground)]">
                  * This is an estimated price list, please contact us for the most accurate quote.
                </p>

                <div className="bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)] shadow-lg space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="font-semibold text-white">Order Quantity</label>
                      <div className="flex items-center gap-2">
                        <input type="number" min={currentMoq} max="1000" value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || currentMoq)} className="w-20 px-2 py-1 bg-[#1A1528] border border-[var(--border)] text-[var(--primary)] font-bold text-center rounded-lg" />
                        <span className="text-sm font-medium text-[var(--silver-gray)]">pcs</span>
                      </div>
                    </div>
                    <input type="range" min={currentMoq} max="1000" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-[var(--primary)]" />
                  </div>

                  <div>
                    <label className="font-semibold mb-3 block text-white">Size Options</label>
                    <div className="grid grid-cols-3 gap-3">
                      {product.sizes?.map((option, index) => (
                        <button key={option.key} onClick={() => { setSizeIndex(index); setIsCustomSize(false); }} className={`p-3 rounded-2xl border transition-all ${!isCustomSize && sizeIndex === index ? 'border-[var(--primary)] bg-[var(--primary)]/20 text-white' : 'border-[var(--border)] text-[var(--silver-gray)]'}`}>
                          <p className="font-medium text-sm">{option.label}</p>
                        </button>
                      ))}
                      <button onClick={() => setIsCustomSize(true)} className={`p-3 rounded-2xl border transition-all ${isCustomSize ? 'border-[var(--primary)] bg-[var(--primary)]/20 text-white' : 'border-[var(--border)] text-[var(--silver-gray)]'}`}>
                        <p className="font-medium text-sm">Custom Size</p>
                      </button>
                    </div>
                    <AnimatePresence>
                      {isCustomSize && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                          <input type="text" placeholder="Enter desired size..." value={customSizeText} onChange={(e) => setCustomSizeText(e.target.value)} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] text-white rounded-xl" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center justify-between cursor-pointer p-4 rounded-2xl bg-[var(--cyber-black)] border border-[var(--border)]" onClick={() => setHasAccessory(!hasAccessory)}>
                      <div className="flex items-center gap-3">
                        <PlusCircle className={`w-6 h-6 ${hasAccessory ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`} />
                        <div>
                          <h4 className="font-semibold text-white">Add Accessories</h4>
                          <p className="text-xs text-[var(--muted-foreground)]">Ears, tails, squeakers</p>
                        </div>
                      </div>
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
                              <input type="number" min="1" max="1000" value={accessoryQuantity} onChange={(e) => setAccessoryQuantity(Number(e.target.value) || 1)} className="w-20 px-2 py-1 bg-[#1A1528] border border-[var(--border)] text-[var(--primary)] font-bold text-center rounded-lg" />
                              <span className="text-sm font-medium text-[var(--silver-gray)]">pcs</span>
                            </div>
                          </div>
                          <input type="range" min="1" max="1000" value={accessoryQuantity} onChange={(e) => setAccessoryQuantity(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-[#9CA3AF]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            )}

            <div className="bg-[var(--cyber-black)] border border-[var(--border)] rounded-2xl p-4 flex gap-3 items-start">
              <Info className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed whitespace-pre-line">{displayNote}</p>
            </div>
            
            <Link to="/inquiry" state={{ 
              passedProduct: displayTitle, 
              passedQty: product.pricingType === 'contact' ? '' : quantity, 
              passedSize: product.pricingType === 'contact' ? '' : (isCustomSize ? customSizeText : product.sizes?.[sizeIndex]?.label),
              passedAccQty: hasAccessory && product.pricingType !== 'contact' ? accessoryQuantity : 0
            }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-4 rounded-full bg-[var(--primary)] text-white font-bold text-lg shadow-[0_0_20px_rgba(139,114,190,0.5)] cursor-pointer">
                Submit Inquiry
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}