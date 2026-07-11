import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export function PrivacyPolicyModal({ isOpen, onClose }) {
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
              <h3 className="text-2xl font-bold text-white font-heading">Privacy Policy</h3>
              <button type="button" onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5 text-[var(--silver-gray)] text-sm leading-relaxed custom-scrollbar">
              <p>Dioxyzine Frog highly values your privacy. This policy outlines how we handle your data.</p>
              
              <h4 className="font-bold text-white text-base">1. Data Collection</h4>
              <p>We collect essential information required to fulfill your orders, including your name, email address, shipping address, and phone number. If you use third-party logins (like Google or Facebook), we only access the basic profile information granted by those platforms.</p>
              
              <h4 className="font-bold text-white text-base">2. Data Usage & White Labeling</h4>
              <p>Your data is used strictly for order processing, shipping, and sending vital updates. For our B2B Dropshipping clients, we guarantee strict confidentiality; your end-customers' data will never be marketed to or contacted directly by Dioxyzine Frog.</p>
              
              <h4 className="font-bold text-white text-base">3. Security</h4>
              <p>We use industry-standard encryption (via Supabase) to protect your account details. We do not store your raw credit card information on our servers; all payments are processed through secure third-party gateways.</p>
            </div>

            <div className="p-6 border-t border-[var(--border)] shrink-0 bg-black/20 rounded-b-3xl">
              <button onClick={onClose} className="w-full py-4 bg-[var(--primary)] hover:bg-purple-600 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}