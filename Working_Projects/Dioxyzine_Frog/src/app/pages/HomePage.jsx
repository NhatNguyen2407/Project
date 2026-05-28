import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, CheckCircle, Sparkles, Palette, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { productsData } from '../data/productsData';

const heroSlides = [
  {
    title: 'Custom Plushies, Made with Love',
    subtitle: 'Transform your characters into huggable reality',
    image: 'https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=1600&h=900&fit=crop',
  },
  {
    title: 'Fan Merchandise That Matters',
    subtitle: 'Premium quality for your creative projects',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop',
  },
  {
    title: 'Your Vision, Our Craft',
    subtitle: 'No minimum orders, unlimited creativity',
    image: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=1600&h=900&fit=crop',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Independent Artist',
    content: 'Dioxyzine Frog transformed my character designs into the most adorable plushies! The quality exceeded my expectations.',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    name: 'Alex Martinez',
    role: 'Content Creator',
    content: 'Fast turnaround, amazing customer service, and the pricing is transparent. Will definitely order again!',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    name: 'Maya Tanaka',
    role: 'Small Business Owner',
    content: 'Perfect for my fan merchandise line. The attention to detail and customization options are unmatched.',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
];

export function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: currentSlide === index ? 1 : 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
            style={{ pointerEvents: currentSlide === index ? 'auto' : 'none' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#08080C]/90 via-[#08080C]/60 to-transparent z-10"></div>
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 z-20 flex items-center pt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="max-w-2xl"
                >
                  <motion.h1
                    className="font-heading text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p
                    className="text-xl md:text-2xl text-[var(--silver-gray)] mb-8"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {slide.subtitle}
                  </motion.p>
                  <motion.div
                    className="flex flex-col sm:flex-row gap-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Link to="/products">
                      <motion.button className="px-8 py-4 rounded-full bg-[var(--primary)] text-white font-semibold shadow-[0_0_20px_rgba(139,114,190,0.5)] hover:shadow-[0_0_30px_rgba(139,114,190,0.8)] transition-shadow flex items-center gap-2">
                        Browse Products
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </Link>
                    <Link to="/about">
                      <motion.button className="px-8 py-4 rounded-full bg-[#171226]/80 backdrop-blur-md text-white font-semibold border border-[var(--primary)] hover:bg-[#2C2144] transition-colors">
                        Start Inquiry
                      </motion.button>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index
                  ? 'w-8 bg-[var(--primary)] shadow-[0_0_10px_rgba(139,114,190,0.8)]'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-[0_0_10px_rgba(139,114,190,0.3)]">
              How Ordering Works
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Simple, transparent, and collaborative process from concept to creation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, icon: <Sparkles className="w-8 h-8" />, title: 'Share Your Idea', description: 'Tell us about your custom product vision and upload reference images' },
              { step: 2, icon: <Palette className="w-8 h-8" />, title: 'Get a Quote', description: 'Receive detailed pricing based on your specifications within 24 hours' },
              { step: 3, icon: <CheckCircle className="w-8 h-8" />, title: 'Approve Design', description: 'Review mockups and samples, make adjustments until perfect' },
              { step: 4, icon: <Package className="w-8 h-8" />, title: 'Receive Order', description: 'Quality-checked products delivered with care packaging' },
            ].map((item, index) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="relative">
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-lg hover:shadow-[0_0_20px_rgba(139,114,190,0.2)] transition-shadow h-full">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] mb-6 shadow-[0_0_15px_rgba(139,114,190,0.3)]">
                    {item.icon}
                  </div>
                  <div className="absolute top-6 right-6 text-6xl font-bold text-white/5">{item.step}</div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
                  <p className="text-[var(--muted-foreground)] leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products (Đã liên kết dữ liệu thật) */}
      <section className="py-24 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-[0_0_10px_rgba(139,114,190,0.3)]">
              Featured Products
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Explore our most popular customizable merchandise
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {productsData.slice(0, 4).map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id}
                title={product.title}
                image={product.image}
                basePrice={product.priceBrackets[0].prices[0]} 
                moq={product.moq}
                category={product.category[0]}
                isPopular={true}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/products">
              <motion.button className="px-8 py-4 rounded-full bg-[var(--primary)] text-white font-semibold shadow-[0_0_15px_rgba(139,114,190,0.4)] flex items-center gap-2 mx-auto">
                View All Products
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-[0_0_10px_rgba(139,114,190,0.3)]">
              What Creators Say
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-lg hover:shadow-[0_0_20px_rgba(139,114,190,0.2)] transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-[var(--primary)]" />
                  <div>
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-[var(--primary)]">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-[var(--silver-gray)] leading-relaxed italic">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}