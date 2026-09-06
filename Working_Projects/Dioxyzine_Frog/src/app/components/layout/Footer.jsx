import React from 'react';
import { Link } from 'react-router';
import { Facebook, Instagram, Clock, Heart } from 'lucide-react';
import Logo from '../../../assets/Avatar.jpeg';

export function Footer() {
  const footerLinks = {
    shop: [
      { label: 'Custom Orders', path: '/products/custom' },
      { label: 'Ready-made Merch', path: '/products/readyuse' },
      { label: 'Product Gallery', path: '/gallery' },
    ],

    support: [
      { label: 'Terms & Conditions', path: '/about/terms/printing' },
      { label: 'Send Feedback', path: '/about/feedback' },
      { label: 'Contact Us', path: '/about/contact' },
    ],
  };

  return (
    <footer className="bg-card border-t border-border relative z-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14 lg:pt-16 pb-6 sm:pb-8">

        {/*BRAND + FOOTER LINKS*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-y-10 gap-x-8 lg:gap-x-10 mb-10 lg:mb-12">

          {/* BRAND*/}
          <div className="sm:col-span-2 md:col-span-1 lg:col-span-5 space-y-5">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <img src={Logo} alt="Dioxyzine Frog" className="w-12 -12 object-contain rounded-full border border-border shadow-sm transition-transform group-hover:scale-105"/>

              <span className="=text-2xl font-heading tracking-wide" style={{ color: 'var(--primary)' }}>
                Dioxyzine Frog
              </span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed font-medium max-w-md">
              Transforming all your creative layouts and art concepts
              into premium high-quality handmade plush items and custom
              anime merchandise.
            </p>
          </div>


          {/*SHOP MERCH*/}
          <div className="md:col-span-1 lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--heading-color)]">
              Shop Merch
            </h4>

            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm font-semibold text-muted-foreground hover:text-[var(--primary)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          {/*SUPPORT & POLICY*/}
          <div className="md:col-span-1 lg:col-span-4 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--heading-color)]">
              Support & Policy
            </h4>

            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm font-semibold text-muted-foreground hover:text-[var(--primary)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>


        {/*SOCIAL + BUSINESS HOURS*/}
        <div className="py-6 border-t border-border flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

          {/*SOCIAL MEDIA*/}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <span className="text-sm font-bold text-foreground">
              Connect with us:
            </span>
            <div className="flex gap-3">

              {/* Facebook */}
              <a href="https://facebook.com/dioxyzinefrog" target="_blank" rel="noopener noreferrer" aria-label="Follow our Facebook" title="Follow our Facebook"
                className="w-10 h-10 rounded-full bg-muted border border-border hover:bg-[var(--primary)] hover:text-white flex items-center justify-center transition-all shadow-sm cursor-pointer text-muted-foreground">
                <Facebook className="w-5 h-5" />
              </a>


              {/* Instagram */}
              <a href="https://instagram.com/dioxyzinefrog.print" target="_blank" rel="noopener noreferrer" aria-label="Follow our Instagram" title="Follow our Instagram"
                className="w-10 h-10 rounded-full bg-muted border border-border hover:bg-[var(--primary)] hover:text-white  flex items-center justify-center transition-all shadow-sm cursor-pointer text-muted-foreground">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>


          {/*BUSINESS HOURS*/}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm xl:justify-end" >

            {/* Business Hours Label */}
            <div className="flex items-center gap-2 shrink-0">
              <Clock className="w-5 h-5 text-[var(--primary)]"/>

              <span className="font-bold text-foreground">
                Business Hours:
              </span>
            </div>


            {/* Hours Badges */}
            <div className="flex flex-wrap gap-2.5">

              {/* Monday - Saturday */}
              <span className="bg-muted px-4 py-1.5 rounded-full text-muted-foreground font-semibold border border-border shadow-sm text-center">
                Mon - Sat: 10:00 AM - 10:00 PM (GMT+7)
              </span>

              {/* Sunday */}
              <span className="bg-[var(--primary)]/10 px-4 py-1.5 rounded-full text-[var(--primary)] font-bold border border-[var(--primary)]/20 shadow-sm text-center">
                Sun: Flexible
              </span>
            </div>
          </div>
        </div>


        {/*COPYRIGHT*/}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-center sm:text-left">

          {/* Copyright */}
          <p className="text-xs font-bold text-muted-foreground">
            &copy; 2023 Dioxyzine Frog. All rights reserved.
          </p>


          {/* Made with Heart */}
          <p className="text-xs font-bold text-muted-foreground flex items-center justify-center sm:justify-end gap-1">
            Made with
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 animate-pulse"/>
            for the Artist Community
          </p>
        </div>
      </div>
    </footer>
  );
}