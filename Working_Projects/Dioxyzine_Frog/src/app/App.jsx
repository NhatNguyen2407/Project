import { BrowserRouter, Routes, Route } from 'react-router';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { QuoteRequestPage } from './pages/QuoteRequestPage';
import { AboutContactPage } from './pages/AboutContactPage';
import { TermsShippingPage } from './pages/TermsShippingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { motion } from 'motion/react';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      
      {/* Hiệu ứng Floating Elements mờ ảo (Ngôi sao/Tim) chạy nền cho toàn web */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20 mix-blend-screen">
        <motion.img 
          src="/src/assets/elements.png" 
          alt=""
          animate={{ y: [0, -30, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 -left-20 w-96 h-auto blur-[1px]"
        />
        <motion.img 
          src="/src/assets/elements.png" 
          alt=""
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
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/quote" element={<QuoteRequestPage />} />
          <Route path="/about" element={<AboutContactPage />} />
          <Route path="/contact" element={<AboutContactPage />} />
          <Route path="/terms" element={<TermsShippingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}