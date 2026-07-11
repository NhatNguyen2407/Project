import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, CheckCircle, Sparkles, Palette, Package, Facebook, Instagram } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { SEO } from '../components/common_components/SEO';

// import banner image
import doll2d_banner from '../../assets/Products/Banner/Doll2D_Banner.jpg'
import doll2d_banner02 from '../../assets/Products/Banner/Doll2D_Banner02.jpg'
import doll2d_banner03 from '../../assets/Products/Banner/Doll2D_Banner03.jpg'

const steps = [
  { title: 'Share Your Idea', desc: 'Tell us about your custom product vision and upload reference sketches or design images' },
  { title: 'Get a Quote', desc: 'Receive detailed pricing based on your exact specifications and quantity within 24 hours' },
  { title: 'Approve Design', desc: 'Review digital mockups and material samples, making adjustments until everything is perfect' },
  { title: 'Receive Order', desc: 'Quality-checked products beautifully packaged and delivered directly to your doorstep' }
];

const slides = [
  { 
    title: 'Custom Plush Manufacturer', 
    subtitle: 'Turn your artwork into premium plushies. OEM/POD & Global Shipping.', 
    image: doll2d_banner 
  },
  { 
    title: 'Design • Produce • Ship', 
    subtitle: 'From single prototypes to bulk manufacturing. We are your reliable B2B partner.', 
    image: doll2d_banner02 
  },
  { 
    title: 'Premium Quality & Low MOQ', 
    subtitle: 'Strict quality control, white-label services, and seamless fulfillment for creators.', 
    image: doll2d_banner03 
  }
];

export function HomePage() {
  const { products, loading } = useProducts();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <SEO 
        title="Home" 
        description="Dioxyzine Frog - The leading manufacturer of premium custom plushies, fan merchandise, and high-quality handmade crafts."
      />
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
                          Browse products <ArrowRight className="w-5 h-5" />
                        </motion.button>
                      </Link>
                      <Link to="/inquiry">
                        <motion.button whileHover={{ scale: 1.05 }} className="px-8 py-4 rounded-full bg-[#171226]/80 backdrop-blur-md text-white font-bold border border-[var(--primary)] hover:bg-[#2C2144] cursor-pointer">
                          Get a quote
                        </motion.button>
                      </Link>
                    </div>

                    <div className="flex items-center gap-4 bg-[var(--cyber-black)]/60 border border-[var(--border)] backdrop-blur-sm px-5 py-3 rounded-full w-fit">
                      <span className="text-sm font-semibold text-white whitespace-nowrap">Follow us on:</span>
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
            <h2 className="font-heading text-4xl md:text-5xl mb-4 text-white drop-shadow-[0_0_10px_rgba(139,114,190,0.3)]">How Ordering Works</h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">Simple, transparent, and collaborative process from concept to final creation</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
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

      {/* Products */}
      <section className="py-24 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl mb-4 text-white drop-shadow-[0_0_10px_rgba(139,114,190,0.3)]">Featured Products</h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">Explore our most popular customizable merchandise and handmade plushies</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              <div className="col-span-4 text-center py-10 text-[var(--primary)] font-bold animate-pulse text-lg">
                Loading database...
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
                View All Products <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[var(--card)] border-t border-[var(--border)] relative overflow-hidden z-10 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-4xl md:text-5xl text-white mb-6 drop-shadow-[0_0_15px_rgba(139,114,190,0.6)]">Ready to Bring Your Ideas to Life?</h2>
          <p className="text-xl text-[var(--silver-gray)] mb-8 max-w-2xl mx-auto">Get a custom quote for your project in under 24 hours. No commitments, just possibilities.</p>
          <Link to="/inquiry">
            <motion.button whileHover={{ scale: 1.05 }} className="px-10 py-5 rounded-full bg-[var(--primary)] text-white font-bold text-lg shadow-[0_0_20px_rgba(139,114,190,0.5)] cursor-pointer">
              Start Your Inquiry
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  );
}