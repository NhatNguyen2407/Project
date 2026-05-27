import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Home, Search, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-white via-[var(--cream)] to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="mb-8"
        >
          <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-[var(--burgundy)] via-[var(--dusty-pink)] to-[var(--pastel-lavender)] bg-clip-text text-transparent leading-none">
            404
          </h1>
        </motion.div>

        {/* Floating Decorative Elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="relative mb-8"
        >
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[var(--dusty-pink)]/20 to-[var(--pastel-lavender)]/20 backdrop-blur-sm flex items-center justify-center">
            <Search className="w-16 h-16 text-[var(--burgundy)]" />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Page Not Found</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Oops! Looks like this page wandered off into the craft studio. Let's get you back on
            track.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] text-white font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 mx-auto sm:mx-0"
            >
              <Home className="w-5 h-5" />
              Go Home
            </motion.button>
          </Link>

          <Link to="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full bg-white border-2 border-[var(--burgundy)] text-[var(--burgundy)] font-semibold hover:bg-[var(--burgundy)] hover:text-white transition-colors flex items-center gap-2 mx-auto sm:mx-0"
            >
              Browse Products
            </motion.button>
          </Link>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 pt-8 border-t border-border"
        >
          <p className="text-sm text-muted-foreground mb-4">Popular pages:</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { path: '/gallery', label: 'Gallery' },
              { path: '/about', label: 'About / Contact' },
              { path: '/terms', label: 'Terms & Shipping' },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm text-[var(--burgundy)] hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-[var(--pastel-mint)]/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[var(--dusty-pink)]/20 rounded-full blur-3xl -z-10"></div>
      </div>
    </div>
  );
}
