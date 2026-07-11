import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, ShoppingCart, X, ChevronDown, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '../../../assets/Logo.png';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../service/supabase';
import { useCart } from '../../context/CartContext';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { cart, setIsCartOpen } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const { user, role } = useAuth();

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
    // { path: '#', label: 'Services' },
    { path: '/gallery', label: 'Gallery' }, 
    // { path: '/pricing', label: 'Pricing' },
    { path: '/tutorial', label: 'Blog' }, 
    { path: '/about', label: 'About' },
  ];
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

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
            <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <img src={Logo} alt="Dioxyzine Frog" className="w-12 h-12 object-contain scale-125 drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]" />
              </motion.div>
              <span className="text-2xl sm:text-3xl tracking-wide drop-shadow-[0_0_8px_rgba(139,114,190,0.6)] ml-2" style={{ fontFamily: "'Coiny', cursive", color: "var(--primary)", WebkitTextStroke: "1.5px white", paintOrder: "stroke fill" }}>
                Dioxyzine Frog
              </span>
            </Link>

            {/* Desktop Menu Links */}
            <div className="hidden xl:flex items-center space-x-6"> {/* Đổi md:flex thành xl:flex và giảm space để chứa thêm tab Services */}
              {navLinks.map((link) => {
                const isActive = (location.pathname.startsWith(link.path) && link.path !== '/' && link.path !== '#') || location.pathname === link.path;
                
                if (link.label === 'Products' || link.label === 'About' || link.label === 'Services') {
                  const isProducts = link.label === 'Products';
                  const isServices = link.label === 'Services';
                  const basePath = isProducts ? '/products' : (isServices ? '#' : '/about/contact');

                  return (
                    <div key={link.label} className="relative group py-6">
                      <Link to={basePath} className={`flex items-center gap-1 transition-colors ${isActive ? 'text-[var(--primary)] font-medium' : 'text-foreground hover:text-[var(--primary)]'}`}>
                        {link.label}
                        <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                        <span className={`absolute bottom-5 left-0 h-0.5 bg-gradient-to-r from-[var(--primary)] to-transparent transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                      </Link>
                      
                      {/* Dropdown Desktop */}
                      <div className="absolute left-0 top-full -mt-2 w-56 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 bg-[#1A1528] border border-[var(--primary)]/30 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
                        {isProducts && (
                          <>
                            <Link to="/products/custom" className="block px-5 py-4 hover:bg-[var(--primary)]/20 text-white text-sm font-medium transition-colors">
                              Custom Orders
                            </Link>
                            <Link to="/products/readyuse" className="block px-5 py-4 hover:bg-[var(--primary)]/20 text-white text-sm font-medium border-t border-[var(--border)] transition-colors">
                              Ready-made
                            </Link>
                          </>
                        )}
                        {isServices && (
                          <>
                            <Link to="#" className="block px-5 py-4 hover:bg-[var(--primary)]/20 text-white text-sm font-medium transition-colors">Custom Plush</Link>
                            <Link to="#" className="block px-5 py-4 hover:bg-[var(--primary)]/20 text-white text-sm font-medium border-t border-[var(--border)] transition-colors">OEM</Link>
                            <Link to="#" className="block px-5 py-4 hover:bg-[var(--primary)]/20 text-white text-sm font-medium border-t border-[var(--border)] transition-colors">White Label</Link>
                            <Link to="#" className="block px-5 py-4 hover:bg-[var(--primary)]/20 text-white text-sm font-medium border-t border-[var(--border)] transition-colors">Dropshipping</Link>
                            <Link to="#" className="block px-5 py-4 hover:bg-[var(--primary)]/20 text-white text-sm font-medium border-t border-[var(--border)] transition-colors">Fulfillment</Link>
                          </>
                        )}
                        {link.label === 'About' && (
                          <>
                            <Link to="/pricing" className="block px-5 py-4 hover:bg-[var(--primary)]/20 text-white text-sm font-medium transition-colors">
                              Pricing
                            </Link>
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
                  <Link key={link.label} to={link.path} className={`relative group transition-colors py-6 ${isActive ? 'text-[var(--primary)] font-medium' : 'text-foreground hover:text-[var(--primary)]'}`}>
                    {link.label}
                    <span className={`absolute bottom-5 left-0 h-0.5 bg-gradient-to-r from-[var(--primary)] to-transparent transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                  </Link>
                );
              })}
            </div>

            {/* User Auth & Actions (Desktop) */}
            <div className="hidden xl:flex items-center space-x-4">
              <button 
                onClick={() => setIsCartOpen(true)} 
                className="relative p-2 text-white hover:text-[var(--primary)] transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg">
                    {totalItems}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative group py-6 cursor-pointer z-50">
                  <div className="flex items-center gap-2 bg-[#1A1528] border border-[var(--primary)]/30 px-3 py-1.5 rounded-full hover:border-[var(--primary)] transition-colors">
                    <div className="w-7 h-7 bg-[var(--primary)] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white max-w-[100px] truncate">
                      {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform" />
                  </div>

                  <div className="absolute right-0 top-full -mt-2 w-48 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 bg-[#1A1528] border border-[var(--primary)]/30 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                    {/* ADMIN on DESKTOP */}
                    {role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--primary)]/20 text-white text-sm font-medium transition-colors border-b border-[var(--border)]">
                        <Shield className="w-4 h-4 text-[var(--primary)]" /> Admin Control
                      </Link>
                    )}
                    
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--primary)]/20 text-white text-sm font-medium transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-[var(--primary)]" /> My Dashboard
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-400 text-sm font-medium border-t border-[var(--border)] transition-colors text-left cursor-pointer">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login">
                  <span className="text-foreground hover:text-[var(--primary)] font-medium transition-colors whitespace-nowrap">Sign In</span>
                </Link>
              )}

              <Link to="/inquiry">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-2.5 rounded-full bg-[var(--primary)] text-white font-semibold shadow-[0_0_15px_rgba(139,114,190,0.4)] hover:shadow-[0_0_20px_rgba(139,114,190,0.6)] transition-shadow cursor-pointer">
                  Inquiry
                </motion.button>
              </Link>
            </div>

            {/* mobile hamburger button & icon mobile */}
            <div className="xl:hidden flex items-center gap-4 z-50 relative">
              <button 
                onClick={() => setIsCartOpen(true)} 
                className="relative p-2 text-white hover:text-[var(--primary)] transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg">
                    {totalItems}
                  </span>
                )}
              </button>

              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-foreground cursor-pointer">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
            
          </div>
        </div>
      </motion.nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-[var(--card)] border-l border-[var(--border)] shadow-2xl xl:hidden">
            <div className="flex flex-col h-full pt-24 pb-8 px-6 overflow-y-auto">
              
              {/* Profile Block on Mobile */}
              <div className="mb-8 pb-8 border-b border-[var(--border)]">
                {user ? (
                   <div className="space-y-4">
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center border-2 border-[var(--border)]">
                          <User className="w-6 h-6 text-white" />
                       </div>
                       <div>
                         <p className="text-white font-bold">{user.user_metadata?.full_name || 'Froggy Member'}</p>
                         <p className="text-sm text-[var(--muted-foreground)] truncate">{user.email}</p>
                       </div>
                     </div>
                     
                     {/* admin */}
                     {role === 'admin' && (
                       <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--primary)]/10 text-[var(--primary)] font-medium border border-[var(--primary)]/30 rounded-xl hover:bg-[var(--primary)]/20 transition-colors">
                         <Shield className="w-4 h-4" /> Admin Control
                       </Link>
                     )}

                     <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 bg-[#1A1528] rounded-xl text-white font-medium border border-[var(--border)] hover:border-[var(--primary)] transition-colors">
                       <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                     </Link>
                   </div>
                ) : (
                  <div className="flex gap-3">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 py-3 text-center bg-[#1A1528] rounded-xl text-white font-medium border border-[var(--border)]">
                      Sign In
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 py-3 text-center bg-[var(--primary)] rounded-xl text-white font-medium">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Link Menu */}
              <div className="space-y-6 flex-1">
                {navLinks.map((link, index) => {
                  const isActive = (location.pathname.startsWith(link.path) && link.path !== '/' && link.path !== '#') || location.pathname === link.path;
                  
                  return (
                    <motion.div key={link.label} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                      <Link to={link.label === 'Products' ? '/products/custom' : (link.label === 'About' ? '/about/contact' : (link.label === 'Services' ? '#' : link.path))} onClick={() => { if (link.label !== 'Products' && link.label !== 'About' && link.label !== 'Services') setIsMobileMenuOpen(false) }} className={`block text-2xl font-medium transition-colors ${isActive ? 'text-[var(--primary)]' : 'text-foreground hover:text-[var(--primary)]'}`}>
                        {link.label}
                      </Link>
                      
                      {link.label === 'Products' && (
                        <div className="mt-3 ml-4 flex flex-col gap-3 border-l-2 border-[var(--border)] pl-4">
                          <Link to="/products/custom" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-[var(--silver-gray)] hover:text-white transition-colors">Custom Orders</Link>
                          <Link to="/products/readyuse" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-[var(--silver-gray)] hover:text-white transition-colors">Ready-made</Link>
                        </div>
                      )}
                      {link.label === 'Services' && (
                        <div className="mt-3 ml-4 flex flex-col gap-3 border-l-2 border-[var(--border)] pl-4">
                          <Link to="#" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-[var(--silver-gray)] hover:text-white transition-colors">Custom Plush</Link>
                          <Link to="#" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-[var(--silver-gray)] hover:text-white transition-colors">OEM</Link>
                          <Link to="#" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-[var(--silver-gray)] hover:text-white transition-colors">White Label</Link>
                          <Link to="#" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-[var(--silver-gray)] hover:text-white transition-colors">Dropshipping</Link>
                          <Link to="#" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-[var(--silver-gray)] hover:text-white transition-colors">Fulfillment</Link>
                        </div>
                      )}
                      {link.label === 'About' && (
                        <div className="mt-3 ml-4 flex flex-col gap-3 border-l-2 border-[var(--border)] pl-4">
                          <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-[var(--silver-gray)] hover:text-white transition-colors">Pricing</Link>
                          <Link to="/about/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-[var(--silver-gray)] hover:text-white transition-colors">Contact Us</Link>
                          <Link to="/about/terms" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-[var(--silver-gray)] hover:text-white transition-colors">Terms of Service</Link>
                          <Link to="/about/feedback" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-[var(--silver-gray)] hover:text-white transition-colors">Feedback</Link>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Action Buttons Mobile */}
              <div className="mt-8 space-y-4">
                <Link to="/inquiry" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full py-4 rounded-full bg-[var(--primary)] text-white font-bold shadow-[0_0_15px_rgba(139,114,190,0.4)]">
                    Submit Inquiry
                  </button>
                </Link>
                {user && (
                   <button onClick={handleLogout} className="w-full py-4 rounded-full bg-red-500/10 text-red-400 font-bold border border-red-500/20 flex items-center justify-center gap-2">
                     <LogOut className="w-5 h-5" /> Sign Out
                   </button>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}