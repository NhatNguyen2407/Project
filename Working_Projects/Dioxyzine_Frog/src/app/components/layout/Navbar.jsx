import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/about', label: 'About / Contact' },
    { path: '/terms', label: 'Terms & Shipping' },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-[#09090B]/95 backdrop-blur-md shadow-lg border-b border-[var(--border)]' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Avatar */}
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <img 
                  src="/src/assets/avatar.jpeg" 
                  alt="Dioxyzine Frog" 
                  className="w-12 h-12 rounded-full border-2 border-[var(--primary)] object-cover shadow-[0_0_15px_rgba(157,101,255,0.5)]" 
                />
              </motion.div>
              <span className="text-2xl font-bold text-white drop-shadow-[0_0_8px_rgba(157,101,255,0.8)] tracking-wide">
                Dioxyzine Frog
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative group transition-colors ${
                      isActive
                        ? 'text-[var(--primary)] font-medium'
                        : 'text-foreground hover:text-[var(--primary)]'
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-[var(--primary)] to-transparent transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    ></span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="https://www.facebook.com/dioxyzine.frog"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-[var(--primary)] hover:drop-shadow-[0_0_8px_rgba(157,101,255,0.8)] transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <Link to="/about">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-medium shadow-lg hover:shadow-[0_0_15px_rgba(157,101,255,0.4)] transition-all cursor-pointer"
                >
                  Inquiry
                </motion.button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-foreground"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-[#130D1E] border-l border-[var(--border)] shadow-2xl md:hidden"
          >
            <div className="flex flex-col h-full pt-24 pb-8 px-6 space-y-6">
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.path;
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.path}
                      className={`block text-2xl font-medium transition-colors ${
                        isActive ? 'text-[var(--primary)]' : 'text-foreground hover:text-[var(--primary)]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}

              <div className="flex items-center space-x-4 pt-6 border-t border-[var(--border)]">
                <a
                  href="https://www.facebook.com/dioxyzine.frog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-[var(--primary)] transition-colors"
                >
                  <Facebook className="w-6 h-6" />
                </a>
              </div>

              <Link to="/about" className="pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-medium shadow-lg"
                >
                  Start Inquiry
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}