import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { Heart, Share2, ChevronLeft, Upload, Clock, Package, Shield, TrendingDown, ChevronRight } from 'lucide-react';

import imgP3_01 from '../../assets/Products/Plushies_3/P3_01.jpg'
import imgP3_02 from '../../assets/Products/Plushies_3/P3_02.jpg'
import imgP3_03 from '../../assets/Products/Plushies_3/P3_03.jpg'
import imgP3_04 from '../../assets/Products/Plushies_3/P3_04.jpg'
import imgP3_05 from '../../assets/Products/Plushies_3/P3_05.jpg'

export function ProductDetailPage() {
  const { id } = useParams();
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const [quantity, setQuantity] = useState(50);
  const [size, setSize] = useState('medium');
  const [material, setMaterial] = useState('premium');
  const [printing, setPrinting] = useState('embroidered');
  const [packaging, setPackaging] = useState('standard');

  const nextImage = () => {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const images = [
    imgP3_01, imgP3_02, imgP3_03, imgP3_04, imgP3_05
  ];

  const product = {
    title: 'Custom Character Plushie',
    category: 'Plushies',
    basePrice: 35,
    moq: 10,
    description:
      'High-quality custom plushies perfect for fan merchandise. Each plushie is handcrafted with premium materials and attention to detail.',
  };

  const calculatePrice = () => {
    let basePrice = product.basePrice;
    const sizeMultipliers = { small: 0.7, medium: 1, large: 1.5, xlarge: 2 };
    basePrice *= sizeMultipliers[size];

    const materialMultipliers = { standard: 1, premium: 1.3, luxury: 1.6 };
    basePrice *= materialMultipliers[material];

    const printingMultipliers = { printed: 1, embroidered: 1.4, custom: 1.8 };
    basePrice *= printingMultipliers[printing];

    const packagingMultipliers = { standard: 1, gift: 1.2, premium: 1.5 };
    basePrice *= packagingMultipliers[packaging];

    let discount = 1;
    if (quantity >= 100) discount = 0.75;
    else if (quantity >= 50) discount = 0.85;
    else if (quantity >= 25) discount = 0.92;

    const unitPrice = basePrice * discount;
    const totalPrice = unitPrice * quantity;

    return {
      unitPrice: unitPrice.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      savings: quantity >= 25 ? ((1 - discount) * 100).toFixed(0) : '0',
    };
  };

  const pricing = calculatePrice();

  const estimatedTimeline = () => {
    const baseWeeks = 2;
    const sizeWeeks = size === 'xlarge' ? 1 : 0;
    const complexityWeeks = printing === 'custom' ? 1 : 0;
    return baseWeeks + sizeWeeks + complexityWeeks;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-[var(--primary)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            {/* Main Image - Shopee Style Carousel */}
            <motion.div
              layoutId={`product-${id}`}
              className="relative aspect-square rounded-3xl overflow-hidden bg-[#130D1E] shadow-[0_0_30px_rgba(139,114,190,0.15)] border border-[var(--border)] group"
            >
              {/* Ảnh chính */}
              <img
                src={images[currentImage]}
                alt={product.title}
                className="w-full h-full object-cover opacity-90 transition-opacity duration-300"
              />

              {/* Nút Lùi (Prev) - Chỉ hiện khi di chuột vào */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#08080C]/80 border border-[var(--border)] backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-[var(--primary)] hover:scale-110 transition-all z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Nút Tiến (Next) - Chỉ hiện khi di chuột vào */}
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#08080C]/80 border border-[var(--border)] backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-[var(--primary)] hover:scale-110 transition-all z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Các nút Action (Tim, Share) */}
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="w-10 h-10 rounded-full bg-[#08080C]/80 border border-[var(--border)] backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorited
                        ? 'fill-[var(--primary)] text-[var(--primary)]'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              </div>
              
              {/* Dấu chấm báo vị trí ảnh (Dots indicator) */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentImage === idx ? 'w-6 bg-[var(--primary)]' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#1A102B] border border-[var(--border)] text-sm font-medium text-white mb-3">
                {product.category}
              </span>
              <h1 className="text-4xl font-bold mb-4 text-white">{product.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="bg-[#1A102B] border border-[var(--border)] rounded-3xl p-6 text-white shadow-[0_0_20px_rgba(157,101,255,0.2)]">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-sm text-muted-foreground">Unit Price</span>
                  <motion.p
                    key={pricing.unitPrice}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl font-bold text-[var(--primary)] drop-shadow-[0_0_8px_rgba(157,101,255,0.6)]"
                  >
                    ${pricing.unitPrice}
                  </motion.p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <motion.p
                    key={pricing.totalPrice}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold text-white"
                  >
                    ${pricing.totalPrice}
                  </motion.p>
                </div>
              </div>
            </div>

            <div className="bg-[#130D1E] border border-[var(--border)] rounded-3xl p-6 shadow-lg space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold text-white">Quantity</label>
                  <span className="text-2xl font-bold text-[var(--primary)]">
                    {quantity} pcs
                  </span>
                </div>
                <input
                  type="range"
                  min={product.moq}
                  max="200"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none bg-[var(--primary)] cursor-pointer"
                />
              </div>

              <div>
                <label className="font-semibold mb-3 block text-white">Size</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: 'small', label: 'Small', size: '6"' },
                    { value: 'medium', label: 'Medium', size: '10"' },
                    { value: 'large', label: 'Large', size: '14"' },
                    { value: 'xlarge', label: 'X-Large', size: '18"' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSize(option.value)}
                      className={`p-3 rounded-2xl border transition-all ${
                        size === option.value
                          ? 'border-[var(--primary)] bg-[var(--primary)]/20 text-white'
                          : 'border-[var(--border)] hover:border-[var(--primary)] text-muted-foreground'
                      }`}
                    >
                      <p className="font-medium text-sm">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Link to="/about" state={{ product, configuration: { quantity, size, material, printing, packaging } }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 py-4 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold text-lg shadow-[0_0_15px_rgba(157,101,255,0.5)] hover:shadow-[0_0_25px_rgba(157,101,255,0.7)] transition-shadow"
              >
                Request Inquiry
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}