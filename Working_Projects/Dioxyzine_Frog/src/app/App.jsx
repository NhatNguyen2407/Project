//import react
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { motion } from 'motion/react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { ThemeProvider } from 'next-themes';

//import pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
// Đã xóa PricingPage cũ
import { PricingCalculatorPage } from './pages/PricingCalculatorPage'; // MỚI
import { ColorMatcherPage } from './pages/ColorMatcherPage'; // MỚI: Dành cho Tool hút màu
import { ProductDetailPage } from './pages/ProductDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { InquiryPage } from './pages/InquiryPage';
import { QuoteRequestPage } from './pages/QuoteRequestPage';
import { AboutContactPage } from './pages/AboutContactPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BlogPage } from './pages/BlogPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { PrototypeGeneratorPage } from './pages/PrototypeGeneratorPage';

//import componenets
import { ScrollToTop } from './components/ScrollToTop';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PixelTracker } from './components/common_components/PixelTracker';
import { AnalyticsTracker } from '../app/components/common_components/AnalyticsTracker';
import { CartDrawer } from './components/store/CartDrawer';

//import context
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { useAuth } from './context/AuthContext';

import elements from '../assets/Elements.PNG'

//ROUTES
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />; 
  
  return children;
};

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">

      <HelmetProvider>
        <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
          <ProductProvider>
            <CartProvider>
              <BrowserRouter>
                <AnalyticsTracker />
                <PixelTracker />
                <ScrollToTop />
                
                {/* floating elements */}
                <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20 mix-blend-screen">
                  <motion.img 
                    src={elements} alt="Elements"
                    animate={{ y: [0, -30, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 -left-20 w-96 h-auto blur-[1px]"
                  />
                  <motion.img 
                    src={elements} alt="Elements"
                    animate={{ y: [0, 40, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-10 -right-10 w-[500px] h-auto blur-[1px]"
                  />
                </div>

                <div className="min-h-screen relative z-10 bg-transparent text-foreground">
                  <Navbar />

                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:activeTab" element={<ProductsPage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    
                    {/* 🚀 ĐÃ CHUYỂN HƯỚNG PRICING VÀ ĐĂNG KÝ TOOLS MỚI */}
                    <Route path="/pricing" element={<Navigate to="/tools/pricing-calculator" replace />} />
                    <Route path="/tools/pricing-calculator" element={<PricingCalculatorPage />} />
                    <Route path="/tools/prototype-generator" element={<PrototypeGeneratorPage />} />
                    <Route path="/tools/color-matcher" element={<ColorMatcherPage />} />

                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/inquiry" element={<InquiryPage />} />
                    <Route path="/tracking" element={<OrderTrackingPage />} />
                    <Route path="/quote" element={<QuoteRequestPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/admin" element={<AdminPage />} />

                    {/* PublicRoute for Login and Register */}
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

                    {/* ProtectedRoute for Profile */}
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    
                    {/*about and sub-about*/}
                    <Route path="/about" element={<Navigate to="/about/contact" replace />} />
                    <Route path="/about/contact" element={<AboutContactPage />} />
                    <Route path="/about/feedback" element={<FeedbackPage />} />
                      
                      {/* sub-terms */} 
                    <Route path="/about/terms" element={<TermsPage />}>
                      <Route index element={<Navigate to="printing" replace />} />
                      <Route path="printing" element={null} />
                      <Route path="shipping" element={null} />
                      <Route path="refund" element={null} />
                      <Route path="membership" element={null} />
                    </Route>

                    {/*blog and sub-blog*/}
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:blogSlug" element={<BlogPage />} />

                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                  
                  <CartDrawer />
                  <Footer />
                </div>
              </BrowserRouter>
            </CartProvider>
          </ProductProvider>
        </GoogleReCaptchaProvider>
      </HelmetProvider>
    </ThemeProvider>
  );
}