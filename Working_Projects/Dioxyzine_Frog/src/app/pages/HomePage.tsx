import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { MarqueeBanner } from '../components/MarqueeBanner';
import { ArrowRight, CheckCircle, Sparkles, Users, Palette, Package } from 'lucide-react';
import { useState, useEffect } from 'react';

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

const featuredProducts = [
  {
    id: '1',
    title: 'Custom Character Plushie',
    image: 'https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=400&h=500&fit=crop',
    basePrice: 35,
    moq: 10,
    category: 'Plushies',
    isPopular: true,
  },
  {
    id: '2',
    title: 'Anime Keychain Set',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop',
    basePrice: 8,
    moq: 50,
    category: 'Accessories',
    isNew: true,
  },
  {
    id: '3',
    title: 'Enamel Pin Collection',
    image: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=400&h=500&fit=crop',
    basePrice: 5,
    moq: 100,
    category: 'Pins',
    isPopular: true,
  },
  {
    id: '4',
    title: 'Mini Standee Figure',
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=500&fit=crop',
    basePrice: 12,
    moq: 25,
    category: 'Figures',
    isNew: true,
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Independent Artist',
    content: 'DIFR transformed my character designs into the most adorable plushies! The quality exceeded my expectations.',
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
      {/* Marquee Banner */}
      <MarqueeBanner text="✨ New: Custom plushies from $35 | Free shipping on orders over $500 | 24-hour quote response time" />

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
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent z-10"></div>
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="max-w-2xl"
                >
                  <motion.h1
                    className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p
                    className="text-xl md:text-2xl text-white/90 mb-8"
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
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] text-white font-semibold shadow-2xl hover:shadow-3xl transition-shadow flex items-center gap-2"
                      >
                        Browse Products
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </Link>
                    <Link to="/about">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-md text-white font-semibold border-2 border-white/30 hover:bg-white/20 transition-colors"
                      >
                        Start Inquiry
                      </motion.button>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index
                  ? 'w-8 bg-white'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Floating Decorative Elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-20 h-20 bg-[var(--pastel-lavender)]/30 rounded-full blur-2xl"
        ></motion.div>
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-1/3 left-1/3 w-32 h-32 bg-[var(--dusty-pink)]/30 rounded-full blur-3xl"
        ></motion.div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-white to-[var(--cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] bg-clip-text text-transparent">
              How Ordering Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, transparent, and collaborative process from concept to creation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                icon: <Sparkles className="w-8 h-8" />,
                title: 'Share Your Idea',
                description: 'Tell us about your custom product vision and upload reference images',
              },
              {
                step: 2,
                icon: <Palette className="w-8 h-8" />,
                title: 'Get a Quote',
                description: 'Receive detailed pricing based on your specifications within 24 hours',
              },
              {
                step: 3,
                icon: <CheckCircle className="w-8 h-8" />,
                title: 'Approve Design',
                description: 'Review mockups and samples, make adjustments until perfect',
              },
              {
                step: 4,
                icon: <Package className="w-8 h-8" />,
                title: 'Receive Order',
                description: 'Quality-checked products delivered with care packaging',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--dusty-pink)] to-[var(--burgundy)] flex items-center justify-center text-white mb-6 shadow-lg">
                    {item.icon}
                  </div>
                  <div className="absolute top-6 right-6 text-6xl font-bold text-[var(--dusty-pink)]/10">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[var(--dusty-pink)] to-transparent"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-[var(--cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] bg-clip-text text-transparent">
              Featured Products
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our most popular customizable merchandise
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] text-white font-semibold shadow-lg flex items-center gap-2 mx-auto"
              >
                View All Products
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] bg-clip-text text-transparent">
              What Creators Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of satisfied artists and creators
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white to-[var(--cream)] rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover ring-4 ring-[var(--dusty-pink)]/30"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[var(--burgundy)] to-[var(--dusty-pink)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Bring Your Ideas to Life?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Get a custom quote for your project in under 24 hours. No commitments, just possibilities.
            </p>
            <Link to="/about">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 rounded-full bg-white text-[var(--burgundy)] font-bold text-lg shadow-2xl hover:shadow-3xl transition-shadow"
              >
                Start Your Inquiry
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
