import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, ShoppingCart, X, ChevronDown, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '../../../assets/Avatar.jpeg';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../service/supabase';
import { useCart } from '../../context/CartContext';
import { ThemeToggle } from '../common_components/ThemeToggle';

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
    { path: '/tools', label: 'Tools' },
    { path: '/gallery', label: 'Gallery' }, 
    { path: '/blog', label: 'Blog' }, 
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
          isScrolled ? 'bg-background/90 backdrop-blur-md shadow-md border-b border-border' : 'bg-transparent'
        }`}
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <img src={Logo} alt="Dioxyzine Frog" className="w-12 h-12 object-contain scale-125 rounded-full border border-border shadow-sm" />
              </motion.div>
              <span className="text-2xl sm:text-3xl tracking-wide ml-2 font-heading animate-in fade-in" style={{ color: "var(--primary)" }}>
                Dioxyzine Frog
              </span>
            </Link>

            {/* Desktop Menu Links */}
            <div className="hidden xl:flex items-center space-x-6"> 
              {navLinks.map((link) => {
                const isActive = (location.pathname.startsWith(link.path) && link.path !== '/' && link.path !== '#') || location.pathname === link.path;
                
                if (['Products', 'About', 'Services', 'Tools'].includes(link.label)) {
                  const basePath = link.label === 'Products' ? '/products' : (link.label === 'Tools' ? '/tools/prototype-generator' : '/about/contact');

                  return (
                    <div key={link.label} className="relative group py-6">
                      <Link to={basePath} className={`flex items-center gap-1 transition-colors font-bold ${isActive ? 'text-[var(--primary)]' : 'text-foreground hover:text-[var(--primary)]'}`}>
                        {link.label}
                        <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                        <span className={`absolute bottom-5 left-0 h-0.5 bg-[var(--primary)] transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                      </Link>
                      
                      {/* Dropdown Desktop */}
                      <div className="absolute left-0 top-full -mt-2 w-56 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                        {link.label === 'Products' && (
                          <>
                            <Link to="/products/custom" className="block px-5 py-4 hover:bg-secondary/40 text-foreground text-sm font-bold transition-colors">Custom Orders</Link>
                            <Link to="/products/readyuse" className="block px-5 py-4 hover:bg-secondary/40 text-foreground text-sm font-bold border-t border-border transition-colors">Ready-made</Link>
                          </>
                        )}
                        {link.label === 'Tools' && (
                          <>
                            <Link to="/tools/prototype-generator" className="block px-5 py-4 hover:bg-secondary/40 text-foreground text-sm font-bold transition-colors">Prototype Generator</Link>
                            <Link to="/tools/pricing-calculator" className="block px-5 py-4 hover:bg-secondary/40 text-foreground text-sm font-bold border-t border-border transition-colors">Pricing & Size Guide</Link>
                            <Link to="/tools/color-matcher" className="block px-5 py-4 hover:bg-secondary/40 text-foreground text-sm font-bold border-t border-border transition-colors">Color Matcher</Link>
                          </>
                        )}
                        {link.label === 'About' && (
                          <>
                            <Link to="/about/contact" className="block px-5 py-4 hover:bg-secondary/40 text-foreground text-sm font-bold transition-colors">Contact Us</Link>
                            <Link to="/about/terms" className="block px-5 py-4 hover:bg-secondary/40 text-foreground text-sm font-bold border-t border-border transition-colors">Terms of Service</Link>
                            <Link to="/about/feedback" className="block px-5 py-4 hover:bg-secondary/40 text-foreground text-sm font-bold border-t border-border transition-colors">Feedback</Link>
                          </>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link key={link.label} to={link.path} className={`relative group transition-colors py-6 font-bold ${isActive ? 'text-[var(--primary)]' : 'text-foreground hover:text-[var(--primary)]'}`}>
                    {link.label}
                    <span className={`absolute bottom-5 left-0 h-0.5 bg-[var(--primary)] transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                  </Link>
                );
              })}
            </div>

            {/* User Auth & Actions */}
            <div className="hidden xl:flex items-center space-x-4">
              <ThemeToggle /> 

              <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-foreground hover:text-[var(--primary)] transition-colors cursor-pointer">
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white {theme === 'light' ? 'bg-purple-500' : ''} text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-md">{totalItems}</span>}
              </button>

              {user ? (
                <div className="relative group py-6 cursor-pointer z-50">
                  <div className="flex items-center gap-2 bg-muted border border-border px-3 py-1.5 rounded-full hover:border-primary transition-colors">
                    <div className="w-7 h-7 bg-[var(--primary)] rounded-full flex items-center justify-center shadow-sm">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-foreground max-w-[100px] truncate">{user.user_metadata?.full_name?.split(' ')[0] || 'User'}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:rotate-180 transition-transform" />
                  </div>

                  <div className="absolute right-0 top-full -mt-2 w-48 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                    {role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 text-foreground text-sm font-bold transition-colors border-b border-border">
                        <Shield className="w-4 h-4 text-[var(--primary)]" /> Admin Control
                      </Link>
                    )}
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 text-foreground text-sm font-bold transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-[var(--primary)]" /> My Dashboard
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 text-sm font-bold border-t border-border transition-colors text-left cursor-pointer">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="text-foreground hover:text-[var(--primary)] font-bold transition-colors whitespace-nowrap">Sign In</Link>
              )}

              <Link to="/inquiry">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-2.5 rounded-full bg-[var(--primary)] text-white font-bold shadow-md cursor-pointer">
                  Inquiry
                </motion.button>
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="xl:hidden flex items-center gap-4 z-50 relative">
              <ThemeToggle />
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-foreground hover:text-[var(--primary)] transition-colors cursor-pointer">
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-md">{totalItems}</span>}
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
          <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-card border-l border-border shadow-2xl xl:hidden">
            <div className="flex flex-col h-full pt-24 pb-8 px-6 overflow-y-auto">
              
              <div className="mb-8 pb-8 border-b border-border">
                {user ? (
                   <div className="space-y-4">
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center shadow-sm">
                          <User className="w-6 h-6 text-white" />
                       </div>
                       <div>
                         <p className="text-foreground font-bold">{user.user_metadata?.full_name || 'Froggy Member'}</p>
                         <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                       </div>
                     </div>
                     {role === 'admin' && (
                       <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 bg-secondary text-secondary-foreground font-bold rounded-xl transition-colors">
                         <Shield className="w-4 h-4" /> Admin Control
                       </Link>
                     )}
                     <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 bg-card text-foreground font-bold border-2 border-border rounded-xl hover:border-primary transition-colors">
                       <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                     </Link>
                   </div>
                ) : (
                  <div className="flex gap-3">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 py-3 text-center bg-card text-foreground font-bold border-2 border-border rounded-xl hover:border-primary">Sign In</Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 py-3 text-center bg-[var(--primary)] text-white font-bold rounded-xl shadow-md">Sign Up</Link>
                  </div>
                )}
              </div>

              {/* Link Menu Mobile */}
              <div className="space-y-6 flex-1">
                {navLinks.map((link, index) => {
                  const isActive = (location.pathname.startsWith(link.path) && link.path !== '/' && link.path !== '#') || location.pathname === link.path;
                  let targetPath = link.path;
                  if (link.label === 'Products') targetPath = '/products/custom';
                  if (link.label === 'About') targetPath = '/about/contact';
                  if (link.label === 'Tools') targetPath = '/tools/prototype-generator';

                  return (
                    <motion.div key={link.label} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                      <Link to={targetPath} onClick={() => { if (!['Products', 'About', 'Tools'].includes(link.label)) setIsMobileMenuOpen(false) }} className={`block text-2xl font-bold transition-colors ${isActive ? 'text-[var(--primary)]' : 'text-foreground hover:text-[var(--primary)]'}`}>
                        {link.label}
                      </Link>
                      
                      {['Products', 'Tools', 'About'].includes(link.label) && (
                        <div className="mt-3 ml-4 flex flex-col gap-3 border-l-2 border-border pl-4">
                          {link.label === 'Products' && (
                            <>
                              <Link to="/products/custom" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-muted-foreground font-semibold hover:text-[var(--primary)]">Custom Orders</Link>
                              <Link to="/products/readyuse" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-muted-foreground font-semibold hover:text-[var(--primary)]">Ready-made</Link>
                            </>
                          )}
                          {link.label === 'Tools' && (
                            <>
                              <Link to="/tools/prototype-generator" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-muted-foreground font-semibold hover:text-[var(--primary)]">Prototype Generator</Link>
                              <Link to="/tools/pricing-calculator" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-muted-foreground font-semibold hover:text-[var(--primary)]">Pricing & Size Guide</Link>
                              <Link to="/tools/color-matcher" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-muted-foreground font-semibold hover:text-[var(--primary)]">Color Matcher</Link>
                            </>
                          )}
                          {link.label === 'About' && (
                            <>
                              <Link to="/about/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-muted-foreground font-semibold hover:text-[var(--primary)]">Contact Us</Link>
                              <Link to="/about/terms" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-muted-foreground font-semibold hover:text-[var(--primary)]">Terms of Service</Link>
                              <Link to="/about/feedback" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-muted-foreground font-semibold hover:text-[var(--primary)]">Feedback</Link>
                            </>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-8 space-y-4">
                <Link to="/inquiry" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full py-4 rounded-full bg-[var(--primary)] text-white font-bold shadow-md">
                    Submit Inquiry
                  </button>
                </Link>
                {user && (
                   <button onClick={handleLogout} className="w-full py-4 rounded-full bg-red-50 text-red-500 font-bold border border-destructive/20 flex items-center justify-center gap-2">
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