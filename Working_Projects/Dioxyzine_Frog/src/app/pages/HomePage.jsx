import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, CheckCircle, Sparkles, Palette, Package, Facebook, Instagram } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useProducts } from '../context/ProductContext';


// import banner image
import doll2d_banner from '../../assets/Products/Banner/Doll2D_Banner.jpg'
import doll2d_banner02 from '../../assets/Products/Banner/Doll2D_Banner02.jpg'
import doll2d_banner03 from '../../assets/Products/Banner/Doll2D_Banner03.jpg'

const translations = {
  vi: {
    howItWorks: 'Quy Trình Đặt Hàng', subHow: 'Đơn giản, minh bạch và hợp tác chặt chẽ từ ý tưởng ban đầu đến thành phẩm',
    featured: 'Sản Phẩm Nổi Bật', subFeatured: 'Khám phá các dòng sản phẩm gấu bông và merchandise tùy chỉnh phổ biến nhất',
    viewAll: 'Xem Tất Cả Sản Phẩm', 
    ctaTitle: 'Sẵn Sàng Biến Ý Tưởng Thành Hiện Thực?', ctaSub: 'Nhận báo giá chi tiết cho dự án của bạn trong vòng 24 giờ. Không ràng buộc, chỉ có cơ hội.', ctaBtn: 'Bắt Đầu Gửi Yêu Cầu',
    followUs: 'Theo dõi chúng tôi tại:', browseBtn: 'Xem sản phẩm', quoteBtn: 'Nhận báo giá',
    steps: [
      { title: 'Chia Sẻ Ý Tưởng', desc: 'Nói cho chúng tôi về ý tưởng sản phẩm tùy chỉnh của bạn và tải lên hình ảnh phác thảo tham khảo' },
      { title: 'Nhận Báo Giá', desc: 'Nhận bảng tính phí chi tiết dựa trên số lượng và thông số kích thước của bạn trong vòng 24h' },
      { title: 'Chốt Thiết Kế', desc: 'Xem xét bản mẫu mô phỏng kỹ thuật, điều chỉnh các nét may ráp cho đến khi hoàn toàn ưng ý' },
      { title: 'Nhận Thành Phẩm', desc: 'Sản phẩm được kiểm tra chất lượng nghiêm ngặt tại xưởng và đóng gói giao tới tận tay bạn' }
    ]
  },
  en: {
    howItWorks: 'How Ordering Works', subHow: 'Simple, transparent, and collaborative process from concept to final creation',
    featured: 'Featured Products', subFeatured: 'Explore our most popular customizable merchandise and handmade plushies',
    viewAll: 'View All Products', 
    ctaTitle: 'Ready to Bring Your Ideas to Life?', ctaSub: 'Get a custom quote for your project in under 24 hours. No commitments, just possibilities.', ctaBtn: 'Start Your Inquiry',
    followUs: 'Follow us on:', browseBtn: 'Browse products', quoteBtn: 'Get a quote',
    steps: [
      { title: 'Share Your Idea', desc: 'Tell us about your custom product vision and upload reference sketches or design images' },
      { title: 'Get a Quote', desc: 'Receive detailed pricing based on your exact specifications and quantity within 24 hours' },
      { title: 'Approve Design', desc: 'Review digital mockups and material samples, making adjustments until everything is perfect' },
      { title: 'Receive Order', desc: 'Quality-checked products beautifully packaged and delivered directly to your doorstep' }
    ]
  }
};

const heroSlides = {
  vi: [
    { title: 'Biến mọi ý tưởng của bạn thành hiện thực', subtitle: 'Gấu bông, fanmerch và quà tặng handmade độc quyền', image: doll2d_banner },
    { title: 'Gia công chất lượng cao', subtitle: 'Chỉnh sửa tùy ý đến khi ưng, hỗ trợ tối đa cho artist', image: doll2d_banner02 },
    { title: 'Sáng tạo không giới hạn', subtitle: 'Phục vụ mọi dự án của bạn từ đơn lẻ đến số lượng lớn', image: doll2d_banner03 }
  ],
  en: [
    { title: 'Turn all your ideas into reality', subtitle: 'Exclusive handmade plushies, fan merch, and gifts', image: doll2d_banner },
    { title: 'High-quality manufacturing', subtitle: 'Unlimited revisions until satisfied, full support for artists', image: doll2d_banner02 },
    { title: 'Unlimited creativity', subtitle: 'Serving all your projects from single pieces to bulk orders', image: doll2d_banner03 }
  ]
};

export function HomePage() {
  const { lang } = useLanguage();
  const { products, loading } = useProducts();
  const [currentSlide, setCurrentSlide] = useState(0);
  const t = translations[lang];
  const slides = heroSlides[lang];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {slides.map((slide, index) => (
          <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: currentSlide === index ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0" style={{ pointerEvents: currentSlide === index ? 'auto' : 'none' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#08080C]/90 via-[#08080C]/60 to-transparent z-10"></div>
            <img src={slide.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 z-20 flex items-center pt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="max-w-3xl">
                  <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">{slide.title}</h1>
                  <p className="text-xl md:text-2xl text-[var(--silver-gray)] mb-8">{slide.subtitle}</p>
                  
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap gap-4">
                      <Link to="/products">
                        <motion.button whileHover={{ scale: 1.05 }} className="px-8 py-4 rounded-full bg-[var(--primary)] text-white font-bold shadow-[0_0_20px_rgba(139,114,190,0.5)] flex items-center gap-2 cursor-pointer">
                          {t.browseBtn} <ArrowRight className="w-5 h-5" />
                        </motion.button>
                      </Link>
                      <Link to="/inquiry">
                        <motion.button whileHover={{ scale: 1.05 }} className="px-8 py-4 rounded-full bg-[#171226]/80 backdrop-blur-md text-white font-bold border border-[var(--primary)] hover:bg-[#2C2144] cursor-pointer">
                          {t.quoteBtn}
                        </motion.button>
                      </Link>
                    </div>

                    <div className="flex items-center gap-4 bg-[var(--cyber-black)]/60 border border-[var(--border)] backdrop-blur-sm px-5 py-3 rounded-full w-fit">
                      <span className="text-sm font-semibold text-white whitespace-nowrap">{t.followUs}</span>
                      <div className="flex items-center gap-3">
                        <a href="https://facebook.com/dioxyzinefrog" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#1877F2] hover:scale-110 text-white flex items-center justify-center transition-transform shadow-md">
                          <Facebook className="w-5 h-5" />
                        </a>
                        <a href="https://instagram.com/dioxyzinefrog.print" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:scale-110 text-white flex items-center justify-center transition-transform shadow-md">
                          <Instagram className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Quy Trình */}
      <section className="py-24 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl mb-4 text-white drop-shadow-[0_0_10px_rgba(139,114,190,0.3)]">{t.howItWorks}</h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">{t.subHow}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {t.steps.map((step, index) => (
              <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-lg relative h-full">
                <div className="w-16 h-16 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] mb-6 shadow-[0_0_15px_rgba(139,114,190,0.3)]">
                  {index === 0 && <Sparkles className="w-8 h-8" />}
                  {index === 1 && <Palette className="w-8 h-8" />}
                  {index === 2 && <CheckCircle className="w-8 h-8" />}
                  {index === 3 && <Package className="w-8 h-8" />}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{step.title}</h3>
                <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sản Phẩm Nổi Bật */}
      <section className="py-24 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl mb-4 text-white drop-shadow-[0_0_10px_rgba(139,114,190,0.3)]">{t.featured}</h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">{t.subFeatured}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              <div className="col-span-4 text-center py-10 text-[var(--primary)] font-bold animate-pulse text-lg">
                Đang tải dữ liệu từ máy chủ (Loading database)...
              </div>
            ) : (
              products.slice(0, 4).map((product) => (
                <ProductCard 
                  key={product.id} id={product.id} title={product.title} image={product.image}
                  basePriceObj={product.priceBrackets?.[0]?.prices} moq={product.moq}
                  category={product.category[0]} pricingType={product.pricingType}
                />
              ))
            )}
          </div>
          <div className="text-center mt-12">
            <Link to="/products">
              <motion.button whileHover={{ scale: 1.05 }} className="px-8 py-4 rounded-full bg-[var(--primary)] text-white font-semibold flex items-center gap-2 mx-auto cursor-pointer shadow-lg">
                {t.viewAll} <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[var(--card)] border-t border-[var(--border)] relative overflow-hidden z-10 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-4xl md:text-5xl text-white mb-6 drop-shadow-[0_0_15px_rgba(139,114,190,0.6)]">{t.ctaTitle}</h2>
          <p className="text-xl text-[var(--silver-gray)] mb-8 max-w-2xl mx-auto">{t.ctaSub}</p>
          <Link to="/inquiry">
            <motion.button whileHover={{ scale: 1.05 }} className="px-10 py-5 rounded-full bg-[var(--primary)] text-white font-bold text-lg shadow-[0_0_20px_rgba(139,114,190,0.5)] cursor-pointer">
              {t.ctaBtn}
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  );
}