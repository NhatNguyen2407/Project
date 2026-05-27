import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface MarqueeBannerProps {
  text: string;
  variant?: 'primary' | 'secondary';
}

export function MarqueeBanner({ text, variant = 'primary' }: MarqueeBannerProps) {
  const bgClass =
    variant === 'primary'
      ? 'bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)]'
      : 'bg-[var(--pastel-lavender)]/30';
  const textClass = variant === 'primary' ? 'text-white' : 'text-[var(--burgundy)]';

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
          <span className={`${textClass} font-medium flex items-center gap-3 text-sm`}>
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
          <span className={`${textClass} font-medium flex items-center gap-3 text-sm`}>
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
