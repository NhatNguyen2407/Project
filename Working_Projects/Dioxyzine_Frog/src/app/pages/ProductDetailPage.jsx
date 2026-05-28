import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ChevronLeft, PlusCircle, Sparkles, Info } from 'lucide-react';
import { productsData } from '../data/productsData';

export function ProductDetailPage() {
  const { id } = useParams();
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // Tìm sản phẩm tương ứng trong database động
  const product = productsData.find((p) => p.id === id) || productsData[0];

  // Các tùy chọn cấu hình động
  const [quantity, setQuantity] = useState(10);
  const [sizeIndex, setSizeIndex] = useState(0); // Lưu theo index của mảng kích thước
  const [hasAccessory, setHasAccessory] = useState(false);
  const [accessoryQuantity, setAccessoryQuantity] = useState(10);

  const images = [product.image, product.image];

  // Thuật toán cốt lõi tính tiền dựa trên bảng giá thực tế của xưởng
  const calculateLivePrice = () => {
    // 1. Tìm bracket số lượng tương ứng
    const bracket = product.priceBrackets.find(b => quantity >= b.min && quantity <= b.max) 
                     || product.priceBrackets[product.priceBrackets.length - 1];
    
    // 2. Lấy đơn giá gốc của sản phẩm dựa trên kích thước được chọn (index)
    const baseUnitPrice = bracket.prices[sizeIndex] || bracket.prices[bracket.prices.length - 1];
    const productTotal = baseUnitPrice * quantity;

    // 3. Tính toán giá phụ kiện đi kèm (nếu chọn) đồng bộ theo size sản phẩm chính
    let accUnitPrice = 0;
    let accTotal = 0;
    if (hasAccessory) {
      if (product.pricingType === '2-manh') {
        // Cộng gộp cả phụ phí tai đuôi + chíp chíp của bản 2 mảnh làm mẫu
        const taiDuoiCost = product.addons.taiDuoi[sizeIndex] || 0;
        const chipChipCost = product.addons.chipChip[sizeIndex] || 0;
        accUnitPrice = taiDuoiCost + chipChipCost;
      } else {
        accUnitPrice = product.addons.phuKien[sizeIndex] || 0;
      }
      accTotal = accUnitPrice * accessoryQuantity;
    }

    const finalTotal = productTotal + accTotal;

    return {
      unitPrice: baseUnitPrice,
      productTotal: productTotal,
      accUnitPrice: accUnitPrice,
      accTotal: accTotal,
      totalPrice: finalTotal
    };
  };

  const pricing = calculateLivePrice();

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
          {/* Trái: Hình ảnh sản phẩm */}
          <div className="space-y-4">
            <motion.div layoutId={`product-${id}`} className="relative aspect-square rounded-3xl overflow-hidden bg-[var(--card)] shadow-[0_0_30px_rgba(139,114,190,0.15)] border border-[var(--border)] group">
              <img src={images[currentImage]} alt={product.title} className="w-full h-full object-cover opacity-90" />
            </motion.div>
          </div>

          {/* Phải: Bảng điều khiển cấu hình và tính giá */}
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#1A1528] border border-[var(--border)] text-xs font-medium text-[var(--primary)] mb-3">
                {product.category.join(' • ')}
              </span>
              <h1 className="font-heading mb-4 text-white drop-shadow-[0_0_8px_rgba(139,114,190,0.4)]">{product.title}</h1>
              <p className="text-lg text-[var(--silver-gray)] leading-relaxed">{product.description}</p>
            </div>

            {/* Khối hiển thị giá thời gian thực */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 text-white shadow-[0_0_30px_rgba(139,114,190,0.2)]">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-sm text-[var(--muted-foreground)]">Đơn giá sản phẩm</span>
                  <p className="text-4xl font-bold text-[var(--primary)] drop-shadow-[0_0_8px_rgba(139,114,190,0.6)]">
                    {pricing.unitPrice}k
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-[var(--muted-foreground)]">Tổng thanh toán tạm tính</span>
                  <p className="text-3xl font-bold text-white">
                    {pricing.totalPrice}k
                  </p>
                  {hasAccessory && (
                    <p className="text-xs text-[var(--primary)] mt-1">
                      (Gấu: {pricing.productTotal}k + Phụ kiện: {pricing.accTotal}k)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Các tùy chọn kéo thả */}
            <div className="bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)] shadow-lg space-y-6">
              {/* Thanh chọn số lượng sản phẩm chính */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold text-white">Số lượng đặt hàng</label>
                  <span className="text-2xl font-bold text-[var(--primary)]">{quantity} cái</span>
                </div>
                <input
                  type="range" min={product.moq} max="300" value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none bg-[var(--primary)] cursor-pointer"
                />
              </div>

              {/* Hộp chọn kích thước lấy data động */}
              <div>
                <label className="font-semibold mb-3 block text-white">Kích thước sản phẩm</label>
                <div className="grid grid-cols-3 gap-3">
                  {product.sizes.map((option, index) => (
                    <button 
                      key={option.key} 
                      onClick={() => setSizeIndex(index)} 
                      className={`p-3 rounded-2xl border transition-all ${sizeIndex === index ? 'border-[var(--primary)] bg-[var(--primary)]/20 text-white' : 'border-[var(--border)] hover:border-[var(--primary)] text-[var(--silver-gray)]'}`}
                    >
                      <p className="font-medium text-sm">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Khu vực xử lý phụ kiện chọn thêm */}
              <div className="pt-4 border-t border-[var(--border)]">
                <div 
                  className="flex items-center justify-between cursor-pointer p-4 rounded-2xl bg-[var(--cyber-black)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
                  onClick={() => setHasAccessory(!hasAccessory)}
                >
                  <div className="flex items-center gap-3">
                    <PlusCircle className={`w-6 h-6 transition-colors ${hasAccessory ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`} />
                    <div>
                      <h4 className="font-semibold text-white">Thêm phụ kiện cho gấu</h4>
                      <p className="text-xs text-[var(--muted-foreground)]">Tai đuôi rời, quần áo, chíp chíp phát âm thanh</p>
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
                        <label className="font-semibold text-white">Số lượng phụ kiện kèm theo</label>
                        <span className="text-xl font-bold text-[var(--primary)]">{accessoryQuantity} cái</span>
                      </div>
                      <input
                        type="range" min="1" max="300" value={accessoryQuantity}
                        onChange={(e) => setAccessoryQuantity(parseInt(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none bg-[#9CA3AF] cursor-pointer"
                      />
                      <div className="mt-4 p-3 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30 flex gap-3 items-start">
                        <Sparkles className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
                        <p className="text-xs text-[var(--silver-gray)] leading-relaxed">
                          Size phụ kiện tự động đồng bộ theo size gấu bông là <strong className="text-white">{product.sizes[sizeIndex]?.label}</strong>. Đơn giá phụ kiện tương ứng: <strong className="text-[var(--primary)]">{pricing.accUnitPrice}k/cái</strong>.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Khối hiển thị lưu ý kĩ thuật từ xưởng */}
            <div className="bg-[var(--cyber-black)] border border-[var(--border)] rounded-2xl p-4 flex gap-3 items-start">
              <Info className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed whitespace-pre-line">{product.note}</p>
            </div>

            <Link to="/about" state={{ product, configuration: { quantity, size: product.sizes[sizeIndex]?.label, hasAccessory, accessoryQuantity, totalEstimatedPrice: pricing.totalPrice } }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-4 rounded-full bg-[var(--primary)] text-white font-bold text-lg shadow-[0_0_20px_rgba(139,114,190,0.5)]">
                Gửi cấu hình nhận báo giá chính thức
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}