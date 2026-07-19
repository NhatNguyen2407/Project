import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2.5 rounded-full bg-muted border border-border text-primary cursor-pointer flex items-center justify-center transition-all shadow-sm"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400 animate-pulse" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600" />
      )}
    </motion.button>
  );
}