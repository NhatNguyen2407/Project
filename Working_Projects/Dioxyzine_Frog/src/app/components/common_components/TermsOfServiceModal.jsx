import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export function TermsOfServiceModal({ isOpen, onClose }) {
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
            className="bg-[var(--card)] border border-[var(--border)] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col"
          >
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[#1A1528] shrink-0">
              <h3 className="text-2xl font-bold text-white font-heading">Terms of Service</h3>
              <button type="button" onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5 text-[var(--silver-gray)] text-sm leading-relaxed custom-scrollbar">
              <p>Welcome to Dioxyzine Frog. By creating an account or placing an order, you agree to the following terms:</p>
              
              <h4 className="font-bold text-white text-base">1. Custom Manufacturing & Intellectual Property</h4>
              <p>You confirm that you own the rights to the artwork submitted for custom plushies or merchandise. Dioxyzine Frog will not reproduce, sell, or distribute your custom designs to third parties without your explicit consent. We act solely as your manufacturing partner.</p>
              
              <h4 className="font-bold text-white text-base">2. Production Tolerances</h4>
              <p>Handmade products may have a 1-5% variance in size, color, or shape compared to 2D digital proofs. Color shifts between RGB screens and CMYK fabric printing are normal. Small loose threads or minor asymmetrical details (under 5mm) are considered standard industry tolerances.</p>
              
              <h4 className="font-bold text-white text-base">3. Order Modifications & Cancellations</h4>
              <p>Once mass production begins after sample approval, orders cannot be canceled or heavily modified. Major alterations during the prototyping phase may incur additional fees.</p>
            </div>

            <div className="p-6 border-t border-[var(--border)] shrink-0 bg-black/20 rounded-b-3xl">
              <button onClick={onClose} className="w-full py-4 bg-[var(--primary)] hover:bg-purple-600 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer">
                I Understand & Agree
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}