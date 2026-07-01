// src/app/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { PricingPage } from './pages/PricingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { InquiryPage } from './pages/InquiryPage';
import { QuoteRequestPage } from './pages/QuoteRequestPage';
import { AboutContactPage } from './pages/AboutContactPage';
import { TermsShippingPage } from './pages/TermsShippingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { motion } from 'motion/react';
import { ProductProvider } from './context/ProductContext';
import { FeedbackPage } from './pages/FeedbackPage';
import { CartProvider } from './context/CartContext';
import { CheckoutPage } from './pages/CheckoutPage';
import { TutorialPage } from './pages/TutorialPage';

import elements from '../assets/Elements.PNG'

export default function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <BrowserRouter>
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
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/inquiry" element={<InquiryPage />} />
              <Route path="/quote" element={<QuoteRequestPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />

              {/* --- ĐÃ ĐỔI THÀNH URL PATHS PHÂN CẤP CHO ABOUT --- */}
              <Route path="/about" element={<Navigate to="/about/contact" replace />} />
              <Route path="/about/contact" element={<AboutContactPage />} />
              <Route path="/about/terms" element={<TermsShippingPage />} />
              <Route path="/about/feedback" element={<FeedbackPage />} />

              {/* --- ĐÃ THÊM TUYẾN ĐƯỜNG CHO HỌC VIỆN TUTORIAL CHUẨN SEO --- */}
              <Route path="/tutorial" element={<TutorialPage />} />
              <Route path="/tutorial/:tutorialSlug" element={<TutorialPage />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </ProductProvider>
  );
}