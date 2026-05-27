import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export function MarqueeBanner({ text, variant = 'primary' }) {
  const bgClass =
    variant === 'primary'
      ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]'
      : 'bg-[#1A102B] border-y border-[var(--border)]';
  const textClass = variant === 'primary' ? 'text-white' : 'text-[var(--primary)]';

  const repeatedText = Array(10).fill(text).join(' • ');

  return (
    <div className={`${bgClass} py-3 overflow-hidden relative`}>
      <div className="relative flex">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="flex whitespace-nowrap"
        >
          <span className={`${textClass} font-medium flex items-center gap-3 text-sm tracking-widest`}>
            {repeatedText.split(' • ').map((item, index) => (
              <span key={index} className="flex items-center gap-3">
                {item}
                <Sparkles className="w-4 h-4" />
              </span>
            ))}
          </span>
        </motion.div>
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="flex whitespace-nowrap absolute left-[1000px]"
        >
          <span className={`${textClass} font-medium flex items-center gap-3 text-sm tracking-widest`}>
            {repeatedText.split(' • ').map((item, index) => (
              <span key={index} className="flex items-center gap-3">
                {item}
                <Sparkles className="w-4 h-4" />
              </span>
            ))}
          </span>
        </motion.div>
      </div>
    </div>
  );
}