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
          className={`fixed top-24 left-1/2 z-[999999] flex items-center gap-3 border px-6 py-3 rounded-full shadow-2xl font-semibold backdrop-blur-md whitespace-nowrap
            ${toast.type === 'error' 
              ? 'bg-[#2A1116] border-[#ff4d4d] text-[#ff4d4d] shadow-[0_0_20px_rgba(255,77,77,0.3)]' 
              : 'bg-[#0f291e] border-[#10b981] text-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}