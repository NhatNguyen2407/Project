import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ChevronLeft, ChevronRight, PlusCircle, Sparkles, Info } from 'lucide-react';
import { productsData } from '../data/productsData';
import { useLanguage } from '../context/LanguageContext';

export function ProductDetailPage() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const product = productsData.find((p) => p.id === id) || productsData[0];
  const images = product.images || [];

  const [quantity, setQuantity] = useState(10);
  const [sizeIndex, setSizeIndex] = useState(0);
  const [hasAccessory, setHasAccessory] = useState(false);
  const [accessoryQuantity, setAccessoryQuantity] = useState(10);

  const nextImage = () => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevImage = () => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const calculateLivePrice = () => {
    const bracket = product.priceBrackets?.find(b => quantity >= b.min && quantity <= b.max) 
                     || product.priceBrackets?.[product.priceBrackets.length - 1] || { prices: [] };
    
    const baseUnitPrice = bracket.prices[sizeIndex] || bracket.prices[bracket.prices.length - 1] || 0;
    const productTotal = baseUnitPrice * quantity;

    let accUnitPrice = 0;
    if (hasAccessory) {
      accUnitPrice = product.addons?.phuKien?.[sizeIndex] || 0;
    }
    const accTotal = accUnitPrice * accessoryQuantity;

    return {
      unitPrice: baseUnitPrice,
      productTotal: productTotal,
      accUnitPrice: accUnitPrice,
      accTotal: accTotal,
      totalPrice: productTotal + accTotal
    };
  };

  const formatCurrency = (priceInK) => {
    if (!priceInK) return lang === 'vi' ? '0 VND' : '$0.00 USD';
    const priceInVND = priceInK * 1000;
    if (lang === 'en') {
      const priceInUSD = priceInVND / 26300;
      return `$${priceInUSD.toFixed(2)} USD`;
    }
    return new Intl.NumberFormat('vi-VN').format(priceInVND) + ' VND';
  };

  const pricing = calculateLivePrice();

  // Dùng Optional Chaining (?.) để chống sập web nếu thiếu data
  const displayTitle = product.title?.[lang] || product.title || '';
  const displayDesc = product.description?.[lang] || product.description || '';
  const displayNote = product.note?.[lang] || product.note || '';

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/products" className="inline-flex items-center gap-2 text-[var(--silver-gray)] hover:text-[var(--primary)] transition-colors font-medium">
            <ChevronLeft className="w-4 h-4" />
            {lang === 'vi' ? 'Trở về Sản Phẩm' : 'Back to Products'}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Ảnh Sản Phẩm */}
          <div className="space-y-4">
            <motion.div layoutId={`product-${id}`} className="relative aspect-square rounded-3xl overflow-hidden bg-[var(--card)] shadow-[0_0_30px_rgba(139,114,190,0.15)] border border-[var(--border)] group">
              {images.length > 0 ? (
                <img src={images[currentImage]} alt="Product" className="w-full h-full object-cover opacity-90 transition-all duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">No Image</div>
              )}
              {images.length > 1 && (
                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--cyber-black)]/80 text-white opacity-0 group-hover:opacity-100 hover:bg-[var(--primary)] transition-all flex items-center justify-center z-10">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {images.length > 1 && (
                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--cyber-black)]/80 text-white opacity-0 group-hover:opacity-100 hover:bg-[var(--primary)] transition-all flex items-center justify-center z-10">
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </motion.div>
            {/* Thumbnails */}
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

          {/* Cấu hình & Báo giá */}
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#1A1528] border border-[var(--border)] text-xs font-medium text-[var(--primary)] mb-3">
                {product.category?.join(' • ')}
              </span>
              <h1 className="font-heading mb-4 text-white drop-shadow-[0_0_8px_rgba(139,114,190,0.4)]">
                {displayTitle}
              </h1>
              <p className="text-lg text-[var(--silver-gray)] leading-relaxed">
                {displayDesc}
              </p>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 text-white shadow-[0_0_30px_rgba(139,114,190,0.2)]">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-sm text-[var(--muted-foreground)]">{lang === 'vi' ? 'Đơn giá sản phẩm' : 'Unit Price'}</span>
                  <p className="text-3xl lg:text-4xl font-bold text-[var(--primary)] drop-shadow-[0_0_8px_rgba(139,114,190,0.6)]">
                    {formatCurrency(pricing.unitPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-[var(--muted-foreground)]">{lang === 'vi' ? 'Tổng thanh toán' : 'Total Price'}</span>
                  <p className="text-2xl lg:text-3xl font-bold text-white">
                    {formatCurrency(pricing.totalPrice)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)] shadow-lg space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold text-white">{lang === 'vi' ? 'Số lượng đặt hàng' : 'Order Quantity'}</label>
                  <span className="text-2xl font-bold text-[var(--primary)]">{quantity} {lang === 'vi' ? 'cái' : 'pcs'}</span>
                </div>
                <input type="range" min={product.moq || 1} max="300" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-[var(--primary)] cursor-pointer" />
              </div>

              <div>
                <label className="font-semibold mb-3 block text-white">{lang === 'vi' ? 'Kích thước' : 'Size Options'}</label>
                <div className="grid grid-cols-3 gap-3">
                  {product.sizes?.map((option, index) => (
                    <button key={option.key} onClick={() => setSizeIndex(index)} className={`p-3 rounded-2xl border transition-all ${sizeIndex === index ? 'border-[var(--primary)] bg-[var(--primary)]/20 text-white' : 'border-[var(--border)] text-[var(--silver-gray)]'}`}>
                      <p className="font-medium text-sm">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)]">
                <div className="flex items-center justify-between cursor-pointer p-4 rounded-2xl bg-[var(--cyber-black)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors" onClick={() => setHasAccessory(!hasAccessory)}>
                  <div className="flex items-center gap-3">
                    <PlusCircle className={`w-6 h-6 ${hasAccessory ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`} />
                    <div>
                      <h4 className="font-semibold text-white">{lang === 'vi' ? 'Thêm phụ kiện' : 'Add Accessories'}</h4>
                      <p className="text-xs text-[var(--muted-foreground)]">{lang === 'vi' ? 'Tai đuôi rời, chíp chíp' : 'Ears, tails, squeakers'}</p>
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
                        <label className="font-semibold text-white">{lang === 'vi' ? 'Số lượng phụ kiện' : 'Accessory Qty'}</label>
                        <span className="text-xl font-bold text-[var(--primary)]">{accessoryQuantity} {lang === 'vi' ? 'cái' : 'pcs'}</span>
                      </div>
                      <input type="range" min="1" max="300" value={accessoryQuantity} onChange={(e) => setAccessoryQuantity(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-[#9CA3AF] cursor-pointer" />
                      <div className="mt-4 p-3 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30 flex gap-3">
                        <Sparkles className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
                        <p className="text-xs text-[var(--silver-gray)] leading-relaxed">
                          {lang === 'vi' 
                            ? <>Đơn giá phụ kiện tương ứng size {product.sizes?.[sizeIndex]?.label}: <strong className="text-[var(--primary)]">{formatCurrency(pricing.accUnitPrice)}/cái</strong>.</>
                            : <>Accessory price for size {product.sizes?.[sizeIndex]?.label}: <strong className="text-[var(--primary)]">{formatCurrency(pricing.accUnitPrice)}/pc</strong>.</>
                          }
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="bg-[var(--cyber-black)] border border-[var(--border)] rounded-2xl p-4 flex gap-3 items-start">
              <Info className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed whitespace-pre-line">{displayNote}</p>
            </div>
            
            <Link to="/about">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-4 rounded-full bg-[var(--primary)] text-white font-bold text-lg shadow-[0_0_20px_rgba(139,114,190,0.5)]">
                {lang === 'vi' ? 'Gửi yêu cầu nhận báo giá chính thức' : 'Submit for Official Quote'}
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}