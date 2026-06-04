import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

// import image
import Logo from '../../../assets/Logo.png';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { lang, setLang } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/', label: lang === 'vi' ? 'Trang Chủ' : 'Home' },
    { path: '/products', label: lang === 'vi' ? 'Sản Phẩm' : 'Products' },
    { path: '/pricing', label: lang === 'vi' ? 'Bảng Giá' : 'Pricing' },
    { path: '/gallery', label: lang === 'vi' ? 'Thư Viện' : 'Gallery' },
    { path: '/about', label: lang === 'vi' ? 'Liên Hệ' : 'Contact' },
    { path: '/terms', label: lang === 'vi' ? 'Điều Khoản' : 'Terms' },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-[#08080C]/95 backdrop-blur-md shadow-lg border-b border-[var(--border)]' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                {/* 2. TRUYỀN BIẾN shopLogo VÀO ĐÂY, PHÓNG TO VÀ BỎ VIỀN */}
                <img 
                  src={Logo} 
                  alt="Dioxyzine Frog" 
                  className="w-12 h-12 object-contain scale-125 drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]" 
                />
              </motion.div>
              <span className="text-3xl tracking-wide drop-shadow-[0_0_8px_rgba(139,114,190,0.6)] ml-2" style={{ fontFamily: "'Coiny', cursive", color: "var(--primary)", WebkitTextStroke: "1.5px white", paintOrder: "stroke fill" }}>
                Dioxyzine Frog
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link key={link.path} to={link.path} className={`relative group transition-colors ${isActive ? 'text-[var(--primary)] font-medium' : 'text-foreground hover:text-[var(--primary)]'}`}>
                    {link.label}
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-[var(--primary)] to-transparent transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {/* Nút chuyển đổi ngôn ngữ */}
              <button 
                onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1528] border border-[var(--border)] text-[var(--silver-gray)] hover:text-white hover:border-[var(--primary)] transition-all cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span className="font-bold text-sm">{lang === 'vi' ? 'VI' : 'EN'}</span>
              </button>

              <Link to="/inquiry">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-2.5 rounded-full bg-[var(--primary)] text-white font-semibold shadow-[0_0_15px_rgba(139,114,190,0.4)] hover:shadow-[0_0_20px_rgba(139,114,190,0.6)] transition-shadow cursor-pointer">
                  {lang === 'vi' ? 'Báo Giá' : 'Inquiry'}
                </motion.button>
              </Link>
            </div>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-foreground cursor-pointer">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-[var(--card)] border-l border-[var(--border)] shadow-2xl md:hidden">
            <div className="flex flex-col h-full pt-24 pb-8 px-6 space-y-6">
              <div className="flex justify-end mb-4">
                <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1528] border border-[var(--border)] text-white cursor-pointer">
                  <Globe className="w-4 h-4" />
                  <span className="font-bold text-sm">{lang === 'vi' ? 'Tiếng Việt' : 'English'}</span>
                </button>
              </div>
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.path;
                return (
                  <motion.div key={link.path} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                    <Link to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`block text-2xl font-medium transition-colors ${isActive ? 'text-[var(--primary)]' : 'text-foreground hover:text-[var(--primary)]'}`}>
                      {link.label}
                    </Link>
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