import { Link } from 'react-router';
import Logo from '../../../assets/Avatar.jpeg';

export function Footer() {
  return (
    <footer className="bg-[#040406] border-t border-[var(--border)] relative z-10 text-[var(--silver-gray)] pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/*Brand, Logo & Copyright*/}
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
              Transforming all your creative layouts and art concepts into premium high-quality handmade plush items.
            </p>
            
            <div className="pt-8">
              <p className="text-xs text-[var(--muted-foreground)]">
                &copy; 2023 Dioxyzine Frog. All rights reserved.
              </p>
            </div>
          </div>

          {/*Our Services & Business Hours*/}
          <div className="space-y-8">
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
                Our Services
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="text-[var(--muted-foreground)] hover:text-white transition-colors cursor-pointer">
                  Custom made plushies
                </li>
                <li className="text-[var(--muted-foreground)] hover:text-white transition-colors cursor-pointer">
                  Fan merchandise
                </li>
                <li className="text-[var(--muted-foreground)] hover:text-white transition-colors cursor-pointer">
                  Bulk orders
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
                Business Hours
              </h4>
              <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
                <li className="flex justify-between items-center border-b border-[var(--border)]/50 pb-2">
                  <span>Mon - Sat:</span>
                  <span className="text-white font-medium">10:00 AM - 10:00 PM (GMT+7)</span>
                </li>
                <li className="flex justify-between items-center pt-1">
                  <span>Sunday:</span>
                  <span className="text-white font-medium">Flexible</span>
                </li>
              </ul>
            </div>
          </div>

          {/*Quick Links*/}
          <div className="space-y-8">
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
                Quick Links
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Link to="/products" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Products</Link>
                <Link to="/pricing" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Pricing</Link>
                <Link to="/gallery" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Gallery</Link>
                <Link to="/tutorial" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Tutorials</Link>
                <Link to="/about/terms" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Terms</Link>
                <Link to="/about/contact" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Contact</Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
                Media
              </h4>
              <div className="flex flex-col gap-3">
                <a href="https://facebook.com/dioxyzinefrog" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center py-2.5 px-4 rounded-full bg-[#1877F2] text-white font-bold text-sm hover:scale-105 transition-transform shadow-md w-36">
                  Facebook
                </a>
                <a href="https://instagram.com/dioxyzinefrog.print" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center py-2.5 px-4 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white font-bold text-sm hover:scale-105 transition-transform shadow-md w-36">
                  Instagram
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}