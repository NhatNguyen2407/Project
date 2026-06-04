import { Link } from 'react-router';
import { useLanguage } from '../../context/LanguageContext';

//import image
import Logo from '../../../assets/Logo.png';

export function Footer() {
  const { lang } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#040406] border-t border-[var(--border)] relative z-10 text-[var(--silver-gray)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Brand & Logo */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3 group w-fit">
              <div className="relative">
                <img 
                  src={Logo} 
                  alt="Dioxyzine Frog" 
                  className="w-12 h-12 rounded-full border-2 border-[var(--primary)] object-cover shadow-[0_0_15px_rgba(139,114,190,0.5)] group-hover:scale-105 transition-transform" 
                />
              </div>
              <span className="text-2xl tracking-wide" style={{ fontFamily: "'Coiny', cursive", color: "var(--primary)", WebkitTextStroke: "1px white" }}>
                Dioxyzine Frog
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-[var(--muted-foreground)] mt-2">
              {lang === 'vi'
                ? 'Hiện thực hóa mọi ý tưởng thiết kế của bạn thành những sản phẩm nhồi bông thủ công chất lượng cao nhất do chúng tôi tận tâm gia công.'
                : 'Transforming all your creative layouts and art concepts into premium high-quality handmade plush items.'}
            </p>
          </div>

          {/* Dịch vụ (Services) */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              {lang === 'vi' ? 'Dịch vụ của chúng tôi' : 'Our Services'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="text-[var(--muted-foreground)] hover:text-white transition-colors cursor-pointer">
                {lang === 'vi' ? 'Gấu bông custom' : 'Custom made plushies'}
              </li>
              <li className="text-[var(--muted-foreground)] hover:text-white transition-colors cursor-pointer">
                {lang === 'vi' ? 'Merch fanmade' : 'Fan merchandise'}
              </li>
              <li className="text-[var(--muted-foreground)] hover:text-white transition-colors cursor-pointer">
                {lang === 'vi' ? 'Sản xuất số lượng lớn' : 'Bulk orders'}
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              {lang === 'vi' ? 'Liên Kết Nhanh' : 'Quick Links'}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link to="/products" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                {lang === 'vi' ? 'Sản Phẩm' : 'Products'}
              </Link>
              <Link to="/pricing" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                {lang === 'vi' ? 'Bảng Giá' : 'Pricing'}
              </Link>
              <Link to="/gallery" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                {lang === 'vi' ? 'Thư Viện' : 'Gallery'}
              </Link>
              <Link to="/terms" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                {lang === 'vi' ? 'Điều Khoản' : 'Terms'}
              </Link>
              <Link to="/inquiry" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                {lang === 'vi' ? 'Báo Giá' : 'Inquiry'}
              </Link>
              <Link to="/about" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                {lang === 'vi' ? 'Liên Hệ' : 'Contact'}
              </Link>
            </div>
          </div>

        </div>

        {/* Bản Quyền */}
        <div className="mt-12 pt-8 border-t border-[var(--border)]/30 text-center text-xs text-[var(--muted-foreground)]">
          <p>&copy; {/*currentYear*/}2023 Dioxyzine Frog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}