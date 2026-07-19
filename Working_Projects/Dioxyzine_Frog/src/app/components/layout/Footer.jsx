import React from 'react';
import { Link } from 'react-router';
import { Facebook, Instagram, Clock, Heart } from 'lucide-react';
import Logo from '../../../assets/Avatar.jpeg';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { label: 'Custom Orders', path: '/products/custom' },
      { label: 'Ready-made Merch', path: '/products/readyuse' },
      { label: 'Product Gallery', path: '/gallery' },
    ],
    tools: [
      { label: '2D Prototype Generator', path: '/tools/prototype-generator' },
      { label: 'Pricing & Size Guide', path: '/tools/pricing-calculator' },
      { label: 'AI Color Matcher', path: '/tools/color-matcher' },
    ],
    support: [
      { label: 'Terms & Conditions', path: '/about/terms/printing' },
      { label: 'Send Feedback', path: '/about/feedback' },
      { label: 'Contact Us', path: '/about/contact' },
    ]
  };

  return (
    <footer className="bg-card border-t border-border relative z-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        
        {/* PHẦN 1: LOGO VÀ CÁC CỘT MENU */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-12">
          
          {/* CỘT THƯƠNG HIỆU (Chiếm 4/12 cột) */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center space-x-3 group w-fit">
              <img 
                src={Logo} 
                alt="Dioxyzine Frog" 
                className="w-12 h-12 object-contain rounded-full border border-border shadow-sm transition-transform group-hover:scale-105" 
              />
              <span className="text-2xl font-heading tracking-wide" style={{ color: 'var(--primary)' }}>
                Dioxyzine Frog
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium max-w-sm">
              Transforming all your creative layouts and art concepts into premium high-quality handmade plush items and custom anime merchandise.
            </p>
          </div>

          {/* CỘT DANH MỤC SHOP (Chiếm 2/12 cột) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--heading-color)]">Shop Merch</h4>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-sm font-semibold text-muted-foreground hover:text-[var(--primary)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT CÔNG CỤ TOOLS (Chiếm 3/12 cột) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--heading-color)]">Creator Tools</h4>
            <ul className="space-y-2.5">
              {footerLinks.tools.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-sm font-semibold text-muted-foreground hover:text-[var(--primary)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT HỖ TRỢ (Chiếm 3/12 cột) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--heading-color)]">Support & Policy</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-sm font-semibold text-muted-foreground hover:text-[var(--primary)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* PHẦN 2: THANH NGANG THÔNG TIN LIÊN HỆ & MẠNG XÃ HỘI (ĐÃ ĐẢO VỊ TRÍ THEO YÊU CẦU) */}
        <div className="py-6 border-t border-border flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* 👈 BÊN TRÁI: Nút Mạng xã hội */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-foreground">Connect with us:</span>
            <div className="flex gap-3">
              <a 
                href="https://facebook.com/dioxyzinefrog" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-muted border border-border hover:bg-[var(--primary)] hover:text-white flex items-center justify-center transition-all shadow-sm cursor-pointer text-muted-foreground"
                title="Follow our Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/dioxyzinefrog.print" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-muted border border-border hover:bg-[var(--primary)] hover:text-white flex items-center justify-center transition-all shadow-sm cursor-pointer text-muted-foreground"
                title="Follow our Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* 👉 BÊN PHẢI: Lịch hoạt động nằm ngang gọn gàng */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--primary)]" />
              <span className="font-bold text-foreground">Business Hours:</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-2.5">
              <span className="bg-muted px-4 py-1.5 rounded-full text-muted-foreground font-semibold border border-border shadow-sm text-center">
                Mon - Sat: 10:00 AM - 10:00 PM (GMT+7)
              </span>
              <span className="bg-[var(--primary)]/10 px-4 py-1.5 rounded-full text-[var(--primary)] font-bold border border-[var(--primary)]/20 shadow-sm text-center">
                Sun: Flexible
              </span>
            </div>
          </div>

        </div>

        {/* PHẦN 3: BẢN QUYỀN CHÂN TRANG */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-muted-foreground">
            &copy; {currentYear} Dioxyzine Frog. All rights reserved.
          </p>
          <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 animate-pulse" /> for the Artist Community
          </p>
        </div>

      </div>
    </footer>
  );
}