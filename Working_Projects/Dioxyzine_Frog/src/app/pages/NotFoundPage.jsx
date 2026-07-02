import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Home, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent flex items-center justify-center px-4 relative z-10">
      
      {/* Hiệu ứng mờ ảo phía sau */}
      <div className="absolute top-[20%] right-[20%] w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="mb-8"
        >
          <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[var(--primary)] leading-none drop-shadow-[0_0_15px_rgba(139,114,190,0.3)]">
            404
          </h1>
        </motion.div>

        {/* Floating Decorative Elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="relative mb-8"
        >
          <div className="w-32 h-32 mx-auto rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shadow-[0_0_30px_rgba(139,114,190,0.15)]">
            <Search className="w-16 h-16 text-[var(--primary)]" />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
            Oops! Looks like this page wandered off into the craft studio. Let's get you back on track.
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
              className="px-8 py-4 rounded-full bg-[var(--primary)] text-white font-bold shadow-[0_0_20px_rgba(139,114,190,0.4)] flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Home className="w-5 h-5" />
              Go Home
            </motion.button>
          </Link>

          <Link to="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full bg-transparent border-2 border-[var(--primary)] text-[var(--primary)] font-bold hover:bg-[var(--primary)] hover:text-white transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
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
          className="mt-16 pt-8 border-t border-[var(--border)]"
        >
          <p className="text-sm text-[var(--muted-foreground)] mb-4">Popular pages:</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { path: '/gallery', label: 'Gallery' },
              { path: '/about', label: 'About / Contact' },
              { path: '/terms', label: 'Terms & Shipping' },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-[var(--silver-gray)] hover:text-white hover:underline transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}