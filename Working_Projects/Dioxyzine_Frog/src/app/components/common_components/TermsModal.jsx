import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export function TermsModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
          />
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-[var(--card)] border border-[var(--border)] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 flex flex-col"
          >
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[#1A1528]">
              <h3 className="text-xl font-bold text-white font-heading">Store Policies & Terms</h3>
              <button type="button" onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 text-[var(--silver-gray)] text-sm leading-relaxed">
              <p><span className="text-white font-semibold">1. Processing Cycles & MOQ:</span> Orders ship within 3 business days. Custom bulk productions require a minimum of 11-30 pieces depending on complexity.</p>
              <p><span className="text-white font-semibold">2. Customs & Import Tariffs:</span> International shipments may be subject to localized customs taxation. The buyer retains complete accountability over these fees.</p>
              <p><span className="text-white font-semibold">3. Cancellation Window:</span> Order adjustments or cancellations remain open until logistics assignment triggers dispatch tracking codes.</p>
              <p><span className="text-white font-semibold">4. Data Security:</span> Any data submitted via our architecture is structurally guarded and deployed solely for quotation and shipping communications.</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}