import { Link } from 'react-router';
import { Mail, Heart, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-[#09090B] via-[#130D1E] to-[#09090B] border-t border-[var(--border)]">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Logo */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <img 
                src="/src/assets/logo.png" 
                alt="Dioxyzine Frog Logo" 
                className="w-48 h-auto drop-shadow-[0_0_10px_rgba(157,101,255,0.4)]" 
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Custom handmade merchandise and plushie manufacturing studio creating unique, personalized creations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { path: '/', label: 'Home' },
                { path: '/products', label: 'Products' },
                { path: '/pricing', label: 'Pricing'},
                { path: '/gallery', label: 'Gallery' },
                { path: '/about', label: 'About / Contact' },
                { path: '/terms', label: 'Terms & Shipping' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-[var(--primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Services</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">Custom Plushies</li>
              <li className="text-sm text-muted-foreground">Doll 2D</li>
              <li className="text-sm text-muted-foreground">Fan Merchandise</li>
              <li className="text-sm text-muted-foreground">Bulk Orders</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Get in Touch</h3>
            <div className="space-y-3">
              <a
                href="mailto:dioxyzine.frog@gmail.com"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-[var(--primary)] transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>dioxyzine.frog@gmail.com</span>
              </a>
              <div className="flex items-center space-x-3 pt-2">
                <a
                  href="https://www.facebook.com/dioxyzine.frog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#1A102B] border border-[var(--border)] flex items-center justify-center text-foreground hover:text-white hover:bg-[var(--primary)] hover:shadow-[0_0_10px_rgba(157,101,255,0.5)] transition-all"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            © 2024 Dioxyzine Frog. Made with <Heart className="w-4 h-4 text-[var(--primary)] fill-current animate-pulse" /> for creatives.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-[var(--primary)] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[var(--primary)] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}