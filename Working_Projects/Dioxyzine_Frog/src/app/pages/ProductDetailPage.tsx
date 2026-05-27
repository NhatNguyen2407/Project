import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import {
  Heart,
  Share2,
  ChevronLeft,
  Upload,
  Clock,
  Package,
  Shield,
  TrendingDown,
} from 'lucide-react';

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

  // Dynamic Pricing Logic
  const calculatePrice = () => {
    let basePrice = product.basePrice;

    // Size multiplier
    const sizeMultipliers = { small: 0.7, medium: 1, large: 1.5, xlarge: 2 };
    basePrice *= sizeMultipliers[size as keyof typeof sizeMultipliers];

    // Material multiplier
    const materialMultipliers = { standard: 1, premium: 1.3, luxury: 1.6 };
    basePrice *= materialMultipliers[material as keyof typeof materialMultipliers];

    // Printing multiplier
    const printingMultipliers = { printed: 1, embroidered: 1.4, custom: 1.8 };
    basePrice *= printingMultipliers[printing as keyof typeof printingMultipliers];

    // Packaging multiplier
    const packagingMultipliers = { standard: 1, gift: 1.2, premium: 1.5 };
    basePrice *= packagingMultipliers[packaging as keyof typeof packagingMultipliers];

    // Quantity discount
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
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-white to-[var(--cream)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-[var(--burgundy)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Product Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              layoutId={`product-${id}`}
              className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--cream)] to-[var(--dusty-pink)]/20 shadow-2xl"
            >
              <img
                src={images[currentImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorited
                        ? 'fill-[var(--dusty-pink)] text-[var(--dusty-pink)]'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
                <button className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </motion.div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                    currentImage === index
                      ? 'border-[var(--burgundy)] shadow-lg scale-105'
                      : 'border-transparent hover:border-[var(--dusty-pink)]'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Configuration Panel */}
          <div className="space-y-6">
            {/* Product Info */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[var(--pastel-lavender)]/30 text-sm font-medium text-[var(--burgundy)] mb-3">
                {product.category}
              </span>
              <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Live Pricing Display */}
            <div className="bg-gradient-to-br from-[var(--burgundy)] to-[var(--dusty-pink)] rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-sm opacity-90">Unit Price</span>
                  <motion.p
                    key={pricing.unitPrice}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl font-bold"
                  >
                    ${pricing.unitPrice}
                  </motion.p>
                </div>
                <div className="text-right">
                  <span className="text-sm opacity-90">Total</span>
                  <motion.p
                    key={pricing.totalPrice}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold"
                  >
                    ${pricing.totalPrice}
                  </motion.p>
                </div>
              </div>
              {parseInt(pricing.savings) > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm"
                >
                  <TrendingDown className="w-4 h-4" />
                  You save {pricing.savings}% with bulk pricing!
                </motion.div>
              )}
            </div>

            {/* Configuration Options */}
            <div className="bg-white rounded-3xl p-6 shadow-lg space-y-6">
              {/* Quantity Slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold">Quantity</label>
                  <span className="text-2xl font-bold text-[var(--burgundy)]">
                    {quantity} pcs
                  </span>
                </div>
                <input
                  type="range"
                  min={product.moq}
                  max="200"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none bg-gradient-to-r from-[var(--dusty-pink)] to-[var(--burgundy)] cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--burgundy) 0%, var(--dusty-pink) ${
                      ((quantity - product.moq) / (200 - product.moq)) * 100
                    }%, var(--muted) ${
                      ((quantity - product.moq) / (200 - product.moq)) * 100
                    }%, var(--muted) 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>MOQ: {product.moq}</span>
                  <span>Max: 200</span>
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="font-semibold mb-3 block">Size</label>
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
                      className={`p-3 rounded-2xl border-2 transition-all ${
                        size === option.value
                          ? 'border-[var(--burgundy)] bg-[var(--dusty-pink)]/10'
                          : 'border-border hover:border-[var(--dusty-pink)]'
                      }`}
                    >
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.size}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Material */}
              <div>
                <label className="font-semibold mb-3 block">Material</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'standard', label: 'Standard' },
                    { value: 'premium', label: 'Premium' },
                    { value: 'luxury', label: 'Luxury' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setMaterial(option.value)}
                      className={`p-3 rounded-2xl border-2 transition-all ${
                        material === option.value
                          ? 'border-[var(--burgundy)] bg-[var(--dusty-pink)]/10'
                          : 'border-border hover:border-[var(--dusty-pink)]'
                      }`}
                    >
                      <p className="font-medium text-sm">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Printing Method */}
              <div>
                <label className="font-semibold mb-3 block">Printing Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'printed', label: 'Printed' },
                    { value: 'embroidered', label: 'Embroidered' },
                    { value: 'custom', label: 'Custom' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPrinting(option.value)}
                      className={`p-3 rounded-2xl border-2 transition-all ${
                        printing === option.value
                          ? 'border-[var(--burgundy)] bg-[var(--dusty-pink)]/10'
                          : 'border-border hover:border-[var(--dusty-pink)]'
                      }`}
                    >
                      <p className="font-medium text-sm">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Packaging */}
              <div>
                <label className="font-semibold mb-3 block">Packaging</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'standard', label: 'Standard' },
                    { value: 'gift', label: 'Gift Box' },
                    { value: 'premium', label: 'Premium' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPackaging(option.value)}
                      className={`p-3 rounded-2xl border-2 transition-all ${
                        packaging === option.value
                          ? 'border-[var(--burgundy)] bg-[var(--dusty-pink)]/10'
                          : 'border-border hover:border-[var(--dusty-pink)]'
                      }`}
                    >
                      <p className="font-medium text-sm">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Production Timeline */}
            <div className="bg-[var(--pastel-mint)]/20 rounded-2xl p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-[var(--burgundy)]" />
              <div>
                <p className="text-sm font-medium">Estimated Production Time</p>
                <p className="text-xs text-muted-foreground">
                  {estimatedTimeline()} weeks after approval
                </p>
              </div>
            </div>

            {/* Upload References */}
            <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-[var(--dusty-pink)] transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="font-medium mb-1">Upload Reference Images</p>
              <p className="text-sm text-muted-foreground">
                Drop your design files or click to browse
              </p>
            </div>

            {/* CTA Button */}
            <Link to="/about" state={{ product, configuration: { quantity, size, material, printing, packaging } }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-full bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow"
              >
                Request Inquiry
              </motion.button>
            </Link>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { icon: <Shield className="w-5 h-5" />, text: 'Quality Guaranteed' },
                { icon: <Package className="w-5 h-5" />, text: 'Free Samples' },
                { icon: <Clock className="w-5 h-5" />, text: 'Fast Turnaround' },
              ].map((badge, index) => (
                <div key={index} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-[var(--cream)] flex items-center justify-center text-[var(--burgundy)] mx-auto mb-2">
                    {badge.icon}
                  </div>
                  <p className="text-xs text-muted-foreground">{badge.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
