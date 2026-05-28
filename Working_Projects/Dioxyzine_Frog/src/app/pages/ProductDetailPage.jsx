import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Share2, ChevronLeft, ChevronRight, Upload, Clock, Package, Shield, TrendingDown, PlusCircle, Sparkles } from 'lucide-react';

export function ProductDetailPage() {
  const { id } = useParams();
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // Configuration State
  const [quantity, setQuantity] = useState(50);
  const [size, setSize] = useState('medium');
  const [material, setMaterial] = useState('premium');
  const [printing, setPrinting] = useState('embroidered');
  const [packaging, setPackaging] = useState('standard');

  // Phụ kiện State
  const [hasAccessory, setHasAccessory] = useState(false);
  const [accessoryQuantity, setAccessoryQuantity] = useState(50);

  const images = [
    'https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&h=1000&fit=crop',
  ];

  const product = {
    title: 'Custom Character Plushie',
    category: 'Plushies',
    basePrice: 35,
    moq: 10,
    description:
      'High-quality custom plushies perfect for fan merchandise, mascots, or personal characters. Each plushie is handcrafted with premium materials and attention to detail.',
  };

  // Logic Tính Giá (Có Phụ Kiện)
  const calculatePrice = () => {
    let basePrice = product.basePrice;

    // Size multiplier
    const sizeMultipliers = { small: 0.7, medium: 1, large: 1.5, xlarge: 2 };
    basePrice *= sizeMultipliers[size];

    // Material multiplier
    const materialMultipliers = { standard: 1, premium: 1.3, luxury: 1.6 };
    basePrice *= materialMultipliers[material];

    // Quantity discount cho sản phẩm chính
    let discount = 1;
    if (quantity >= 100) discount = 0.75;
    else if (quantity >= 50) discount = 0.85;
    else if (quantity >= 25) discount = 0.92;

    const unitPrice = basePrice * discount;
    const productTotal = unitPrice * quantity;

    // Tính giá phụ kiện (Đồng bộ theo Size của sản phẩm chính)
    let accTotal = 0;
    let accUnitPrice = 0;
    if (hasAccessory) {
      // Giá phụ kiện prototype (Tính theo k)
      const accPriceMap = { small: 5, medium: 10, large: 25, xlarge: 35 };
      accUnitPrice = accPriceMap[size] || 10;
      accTotal = accUnitPrice * accessoryQuantity;
    }

    const finalTotal = productTotal + accTotal;

    return {
      unitPrice: unitPrice.toFixed(2),
      productTotal: productTotal.toFixed(2),
      accUnitPrice: accUnitPrice.toFixed(2),
      accTotal: accTotal.toFixed(2),
      totalPrice: finalTotal.toFixed(2),
      savings: quantity >= 25 ? ((1 - discount) * 100).toFixed(0) : '0',
    };
  };

  const pricing = calculatePrice();

  const estimatedTimeline = () => {
    const baseWeeks = 2;
    const sizeWeeks = size === 'xlarge' ? 1 : 0;
    const accWeeks = hasAccessory ? 1 : 0;
    return baseWeeks + sizeWeeks + accWeeks;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/products" className="inline-flex items-center gap-2 text-[var(--silver-gray)] hover:text-[var(--primary)] transition-colors font-medium">
            <ChevronLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Product Gallery */}
          <div className="space-y-4">
            <motion.div layoutId={`product-${id}`} className="relative aspect-square rounded-3xl overflow-hidden bg-[var(--card)] shadow-[0_0_30px_rgba(139,114,190,0.15)] border border-[var(--border)] group">
              <img src={images[currentImage]} alt={product.title} className="w-full h-full object-cover opacity-90 transition-opacity duration-300" />
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button onClick={() => setIsFavorited(!isFavorited)} className="w-12 h-12 rounded-full bg-[var(--cyber-black)]/80 border border-[var(--border)] backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-[var(--primary)] text-[var(--primary)]' : 'text-gray-400'}`} />
                </button>
              </div>
            </motion.div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, index) => (
                <button key={index} onClick={() => setCurrentImage(index)} className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${currentImage === index ? 'border-[var(--primary)] shadow-[0_0_15px_rgba(139,114,190,0.5)] scale-105' : 'border-[var(--border)] hover:border-[var(--primary)] opacity-70 hover:opacity-100'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Configuration Panel */}
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#1A1528] border border-[var(--border)] text-xs font-medium text-[var(--primary)] mb-3">
                {product.category}
              </span>
              <h1 className="font-heading mb-4 text-white drop-shadow-[0_0_8px_rgba(139,114,190,0.4)]">{product.title}</h1>
              <p className="text-lg text-[var(--silver-gray)] leading-relaxed">{product.description}</p>
            </div>

            {/* Live Pricing Display */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 text-white shadow-[0_0_30px_rgba(139,114,190,0.2)]">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-sm opacity-90 text-[var(--muted-foreground)]">Đơn giá (Base)</span>
                  <motion.p key={pricing.unitPrice} initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-4xl font-bold text-[var(--primary)] drop-shadow-[0_0_8px_rgba(139,114,190,0.6)]">
                    {pricing.unitPrice}k
                  </motion.p>
                </div>
                <div className="text-right">
                  <span className="text-sm opacity-90 text-[var(--muted-foreground)]">Tổng thanh toán</span>
                  <motion.p key={pricing.totalPrice} initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-3xl font-bold text-white">
                    {pricing.totalPrice}k
                  </motion.p>
                  {hasAccessory && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-[var(--primary)] mt-1">
                      (Sản phẩm: {pricing.productTotal}k + Phụ kiện: {pricing.accTotal}k)
                    </motion.p>
                  )}
                </div>
              </div>
            </div>

            {/* Configuration Options */}
            <div className="bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)] shadow-lg space-y-6">
              {/* Quantity Slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold text-white">Số lượng sản phẩm</label>
                  <span className="text-2xl font-bold text-[var(--primary)]">{quantity} pcs</span>
                </div>
                <input
                  type="range" min={product.moq} max="200" value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none bg-[var(--primary)] cursor-pointer"
                />
              </div>

              {/* Size */}
              <div>
                <label className="font-semibold mb-3 block text-white">Kích thước (Size)</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: 'small', label: 'Small', size: '10cm' },
                    { value: 'medium', label: 'Medium', size: '20cm' },
                    { value: 'large', label: 'Large', size: '30cm' },
                    { value: 'xlarge', label: 'X-Large', size: '40cm' },
                  ].map((option) => (
                    <button key={option.value} onClick={() => setSize(option.value)} className={`p-3 rounded-2xl border transition-all ${size === option.value ? 'border-[var(--primary)] bg-[var(--primary)]/20 text-white' : 'border-[var(--border)] hover:border-[var(--primary)] text-[var(--silver-gray)]'}`}>
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs opacity-70">{option.size}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phụ kiện Toggle & Slider */}
              <div className="pt-4 border-t border-[var(--border)]">
                <div 
                  className="flex items-center justify-between cursor-pointer p-4 rounded-2xl bg-[var(--cyber-black)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
                  onClick={() => setHasAccessory(!hasAccessory)}
                >
                  <div className="flex items-center gap-3">
                    <PlusCircle className={`w-6 h-6 transition-colors ${hasAccessory ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`} />
                    <div>
                      <h4 className="font-semibold text-white">Thêm phụ kiện (Add-ons)</h4>
                      <p className="text-xs text-[var(--muted-foreground)]">Thêm tai đuôi, chíp chíp...</p>
                    </div>
                  </div>
                  {/* Toggle Switch UI */}
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${hasAccessory ? 'bg-[var(--primary)]' : 'bg-[#1A1528] border border-[var(--border)]'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${hasAccessory ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>

                {/* Sub-slider cho Phụ Kiện (Chỉ hiện khi Toggle ON) */}
                <AnimatePresence>
                  {hasAccessory && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-6 overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <label className="font-semibold text-white">Số lượng phụ kiện</label>
                        <span className="text-xl font-bold text-[var(--primary)]">{accessoryQuantity} pcs</span>
                      </div>
                      <input
                        type="range" min="1" max="200" value={accessoryQuantity}
                        onChange={(e) => setAccessoryQuantity(parseInt(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none bg-[#9CA3AF] cursor-pointer"
                      />
                      <div className="mt-4 p-3 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30 flex gap-3 items-start">
                        <Sparkles className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
                        <p className="text-xs text-[var(--silver-gray)] leading-relaxed">
                          Size phụ kiện sẽ được tự động đồng bộ tương thích với size sản phẩm chính là <strong className="text-white uppercase">{size}</strong>. Đơn giá phụ kiện hiện tại: <strong className="text-[var(--primary)]">{pricing.accUnitPrice}k/cái</strong>.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* CTA Button */}
            <Link to="/about" state={{ product, configuration: { quantity, size, hasAccessory, accessoryQuantity } }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-4 rounded-full bg-[var(--primary)] text-white font-bold text-lg shadow-[0_0_20px_rgba(139,114,190,0.5)] hover:shadow-[0_0_30px_rgba(139,114,190,0.8)] transition-shadow">
                Gửi yêu cầu báo giá
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}