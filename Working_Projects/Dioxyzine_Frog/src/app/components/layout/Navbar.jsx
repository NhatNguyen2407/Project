import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '../../../assets/Logo.png';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/tutorial', label: 'Tutorial' },
    { path: '/about', label: 'About' },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-[#08080C]/95 backdrop-blur-md shadow-lg border-b border-[var(--border)]' : 'bg-transparent'
        }`}
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <img src={Logo} alt="Dioxyzine Frog" className="w-12 h-12 object-contain scale-125 drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]" />
              </motion.div>
              <span className="text-3xl tracking-wide drop-shadow-[0_0_8px_rgba(139,114,190,0.6)] ml-2" style={{ fontFamily: "'Coiny', cursive", color: "var(--primary)", WebkitTextStroke: "1.5px white", paintOrder: "stroke fill" }}>
                Dioxyzine Frog
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path) && link.path !== '/' || location.pathname === link.path;
                
                if (link.label === 'Products' || link.label === 'About') {
                  const isProducts = link.label === 'Products';
                  const basePath = isProducts ? '/products' : '/about/contact';

                  return (
                    <div key={link.path} className="relative group py-6">
                      <Link to={basePath} className={`flex items-center gap-1 transition-colors ${isActive ? 'text-[var(--primary)] font-medium' : 'text-foreground hover:text-[var(--primary)]'}`}>
                        {link.label}
                        <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                        <span className={`absolute bottom-5 left-0 h-0.5 bg-gradient-to-r from-[var(--primary)] to-transparent transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                      </Link>
                      
                      {/* Box Dropdown */}
                      <div className="absolute left-0 top-full -mt-2 w-56 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 bg-[#1A1528] border border-[var(--primary)]/30 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
                        {isProducts ? (
                          <>
                            <Link to="/products/custom" className="block px-5 py-4 hover:bg-[var(--primary)]/20 text-white text-sm font-medium transition-colors">
                              Custom Orders
                            </Link>
                            <Link to="/products/readyuse" className="block px-5 py-4 hover:bg-[var(--primary)]/20 text-white text-sm font-medium border-t border-[var(--border)] transition-colors">
                              Ready-made
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link to="/about/contact" className="block px-5 py-4 hover:bg-[var(--primary)]/20 text-white text-sm font-medium transition-colors">
                              Contact Us
                            </Link>
                            <Link to="/about/terms" className="block px-5 py-4 hover:bg-[var(--primary)]/20 text-white text-sm font-medium border-t border-[var(--border)] transition-colors">
                              Terms of Service
                            </Link>
                            <Link to="/about/feedback" className="block px-5 py-4 hover:bg-[var(--primary)]/20 text-white text-sm font-medium border-t border-[var(--border)] transition-colors">
                              Feedback
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link key={link.path} to={link.path} className={`relative group transition-colors py-6 ${isActive ? 'text-[var(--primary)] font-medium' : 'text-foreground hover:text-[var(--primary)]'}`}>
                    {link.label}
                    <span className={`absolute bottom-5 left-0 h-0.5 bg-gradient-to-r from-[var(--primary)] to-transparent transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/inquiry">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-2.5 rounded-full bg-[var(--primary)] text-white font-semibold shadow-[0_0_15px_rgba(139,114,190,0.4)] hover:shadow-[0_0_20px_rgba(139,114,190,0.6)] transition-shadow cursor-pointer">
                  Inquiry
                </motion.button>
              </Link>
            </div>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-foreground cursor-pointer">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-[var(--card)] border-l border-[var(--border)] shadow-2xl md:hidden">
            <div className="flex flex-col h-full pt-24 pb-8 px-6 space-y-6 overflow-y-auto">
              {navLinks.map((link, index) => {
                const isActive = location.pathname.startsWith(link.path) && link.path !== '/' || location.pathname === link.path;
                
                return (
                  <motion.div key={link.path} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                    <Link to={link.label === 'Products' ? '/products/custom' : (link.label === 'About' ? '/about/contact' : link.path)} onClick={() => { if (link.label !== 'Products' && link.label !== 'About') setIsMobileMenuOpen(false) }} className={`block text-2xl font-medium transition-colors ${isActive ? 'text-[var(--primary)]' : 'text-foreground hover:text-[var(--primary)]'}`}>
                      {link.label}
                    </Link>
                    
                    {/* Sub-menu Mobile */}
                    {link.label === 'Products' && (
                      <div className="mt-3 ml-4 flex flex-col gap-3 border-l-2 border-[var(--border)] pl-4">
                        <Link to="/products/custom" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-[var(--silver-gray)] hover:text-white transition-colors">Custom Orders</Link>
                        <Link to="/products/readyuse" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-[var(--silver-gray)] hover:text-white transition-colors">Ready-made</Link>
                      </div>
                    )}
                    {link.label === 'About' && (
                      <div className="mt-3 ml-4 flex flex-col gap-3 border-l-2 border-[var(--border)] pl-4">
                        <Link to="/about/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-[var(--silver-gray)] hover:text-white transition-colors">Contact Us</Link>
                        <Link to="/about/terms" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-[var(--silver-gray)] hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="/about/feedback" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-[var(--silver-gray)] hover:text-white transition-colors">Feedback</Link>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}