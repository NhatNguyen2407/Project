import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function ToastNotification({ toast }) {
  return (
    <AnimatePresence>
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }} 
          animate={{ opacity: 1, y: 0, x: '-50%' }} 
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className={`fixed top-24 left-1/2 z-[999999] flex flex-row items-center gap-3 border px-4 sm:px-6 py-3 rounded-2xl sm:rounded-full shadow-2xl font-semibold backdrop-blur-md max-w-[90vw] sm:max-w-md w-max sm:w-auto break-words text-sm sm:text-base
            ${toast.type === 'error' 
              ? 'bg-[#2A1116] border-[#ff4d4d] text-[#ff4d4d] shadow-[0_0_20px_rgba(255,77,77,0.3)]' 
              : 'bg-[#0f291e] border-[#10b981] text-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-6 h-6 flex-shrink-0" /> : <CheckCircle2 className="w-6 h-6 flex-shrink-0" />}
          <span className="leading-snug">{toast.msg}</span>
          
        </motion.div>
      )}
    </AnimatePresence>
  );
}