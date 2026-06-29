import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle, AlertCircle, Loader2, X, CheckCircle2 } from 'lucide-react';

export function InquiryPage() {
  const location = useLocation();
  const state = location.state || {};

  const [formData, setFormData] = useState({
    subject: '',
    customerName: '',
    customerEmail: '',
    contactInfo: '',
    productName: state.passedProduct || '',
    quantity: state.passedQty || '',
    size: state.passedSize || '',
    accessoryQty: state.passedAccQty || '0',
    imageLink: '',
    note: ''
  });

  const [isSubjectEdited, setIsSubjectEdited] = useState(false);
  const [status, setStatus] = useState('idle');
  
  // state
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  useEffect(() => {
    if (!isSubjectEdited) {
      const dynamicSubject = state.passedProduct 
        ? `[Inquiry] Quote Request: ${state.passedProduct}` 
        : '[Inquiry] Product Quote Request';
      
      setFormData(prev => ({ ...prev, subject: dynamicSubject }));
    }
  }, [isSubjectEdited, state.passedProduct]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // toast disappear after 3.5s
  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ID verify
    if (!formData.subject || !formData.customerName || !formData.customerEmail || !formData.contactInfo || !formData.productName || !formData.imageLink || !formData.quantity) {
      showToast('Please fill in all required fields!', 'error');
      return; 
    }

    // verify Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.customerEmail)) {
      showToast('Invalid email address! Please check again.', 'error');
      return;
    }

    // verify sketch link
    const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6})(\/.*)?$/i;
    if (!urlPattern.test(formData.imageLink)) {
      showToast('Invalid sketch link! Please enter a valid URL.', 'error');
      return;
    }

    // verify MOQ
    const minQty = (formData.productName || '').toLowerCase().includes('custom') ? 30 : 11;
    if (Number(formData.quantity) < minQty) {
      showToast(`Minimum quantity for this product is ${minQty}!`, 'error');
      return;
    }

    // verify checkbox
    if (!acceptedTerms) {
      showToast('Please agree to the Terms of Service before submitting!', 'error');
      return;
    }

    setStatus('loading');
    
    // payload sending to google sheets
    const payload = {
      type: 'inquiry',
      ...formData
    };

    try {
      await fetch('https://script.google.com/macros/s/AKfycbwuex1g0XqvFfM1lf79CqmZ_oBzRGTGBTt27pjduIw7ZeIROJmU6AA2oRfVXGW3JD-P/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      
      showToast('Inquiry Sent Successfully!', 'success');
      setStatus('success');
      setIsSubjectEdited(false);
      setAcceptedTerms(false);
      setFormData({
        subject: '', customerName: '', customerEmail: '', contactInfo: '', productName: '', quantity: '', size: '', accessoryQty: '0', imageLink: '', note: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('Connection error. Please try again later!', 'error');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      
      {/* Toast popup */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-24 left-1/2 z-[200] flex items-center gap-3 border px-6 py-3 rounded-full shadow-2xl font-semibold backdrop-blur-md whitespace-nowrap
              ${toast.type === 'error' 
                ? 'bg-[#2A1116] border-[#ff4d4d] text-[#ff4d4d] shadow-[0_0_20px_rgba(255,77,77,0.3)]' 
                : 'bg-[#0f291e] border-[#10b981] text-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
          >
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup Modal terms */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTermsModal(false)}
            className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--card)] border border-[var(--border)] rounded-3xl max-w-lg w-full max-h-[70vh] flex flex-col overflow-hidden shadow-2xl cursor-default"
            >
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[#1A1528]">
                <h3 className="text-xl font-bold text-white font-heading">Terms of Service</h3>
                <button type="button" onClick={() => setShowTermsModal(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 text-[var(--silver-gray)] text-sm leading-relaxed">
                <p className="font-semibold text-white">1. Minimum Order Quantity (MOQ)</p>
                <p>Our standard manufacturing process requires a minimum of 11 pieces for listed products, and 30 pieces/model for completely custom layouts to optimize design setup and production metrics.</p>
                <p className="font-semibold text-white">2. Custom Design & References</p>
                <p>Clients must supply precise blueprint files or stable Google Drive reference links. Dioxyzine Frog claims zero liability over inaccurate manufacturing caused by corrupted asset URLs.</p>
                <p className="font-semibold text-white">3. Processing & Timelines</p>
                <p>Production cycles initiate exclusively after deposit verification. Standard operations span 7-14 business days, fluctuating based on current queue volumes.</p>
                <p className="font-semibold text-white">4. Data Security</p>
                <p>Any data submitted via our inquiry architecture is structurally guarded and deployed solely for quotation communications.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">
            Submit Inquiry
          </h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            Fill in the details for us to provide the most accurate consultation and quote
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-10 shadow-[0_0_40px_rgba(139,114,190,0.15)] relative overflow-hidden">
          
          <AnimatePresence>
            {status === 'success' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 bg-[var(--card)] flex flex-col items-center justify-center text-center p-8">
                <CheckCircle className="w-20 h-20 text-green-500 mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                <h2 className="text-3xl font-bold text-white mb-4">Submitted Successfully!</h2>
                <p className="text-[var(--silver-gray)] text-lg mb-8 max-w-md">
                  Dioxyzine has received your inquiry. We will review it and get back to you as soon as possible!
                </p>
                <button onClick={() => setStatus('idle')} className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-bold hover:scale-105 transition-transform cursor-pointer">
                  Submit another inquiry
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white">Inquiry Subject / Email Subject *</label>
                <input required type="text" name="subject" value={formData.subject} onChange={(e) => { setIsSubjectEdited(true); handleChange(e); }} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--primary)]/50 rounded-xl text-white font-medium focus:outline-none focus:border-[var(--primary)] transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Your Name *</label>
                <input required type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" placeholder="John Doe" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Email Address *</label>
                <input required type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" placeholder="example@gmail.com" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white">Facebook / Instagram *</label>
                <input required type="text" name="contactInfo" value={formData.contactInfo} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" placeholder="Enter Facebook/Instagram Link..." />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white">Desired Product *</label>
                <input required type="text" name="productName" value={formData.productName} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" placeholder="E.g., 2D Doll, Plushie..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Expected Size</label>
                <input type="text" name="size" value={formData.size} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" placeholder="10cm, 20cm..." />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">
                    Quantity * <span className="text-[var(--primary)] ml-1 text-xs font-normal">
                      (Min: {formData.productName.toLowerCase().includes('custom') ? '30' : '11'})
                    </span>
                  </label>
                  <input required type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Accessories</label>
                  <input type="number" min="0" name="accessoryQty" value={formData.accessoryQty} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white">Design/Sketch Link (Google Drive...) *</label>
                <input required type="url" name="imageLink" value={formData.imageLink} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" placeholder="https://..." />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white">Additional Notes</label>
                <textarea name="note" value={formData.note} onChange={handleChange} rows="4" className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors resize-none" placeholder="Special requirements for materials, stitching..."></textarea>
              </div>
            </div>

            {/* terms checkbox */}
            <div className="flex items-center gap-3 bg-[var(--cyber-black)] p-4 rounded-xl border border-[var(--border)] mt-4">
              <input 
                type="checkbox" 
                id="termsCheck" 
                checked={acceptedTerms} 
                onChange={(e) => setAcceptedTerms(e.target.checked)} 
                className="w-5 h-5 accent-[var(--primary)] cursor-pointer flex-shrink-0" 
              />
              <label htmlFor="termsCheck" className="text-sm text-[var(--silver-gray)] cursor-pointer select-none">
                I agree to the 
                <span 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTermsModal(true);
                  }} 
                  className="text-[var(--primary)] font-bold underline hover:text-white transition-colors ml-1 cursor-pointer"
                >
                  Terms of Service
                </span> *
              </label>
            </div>

            {/* button */}
            <button 
              type="submit" 
              disabled={status === 'loading'} 
              className="w-full py-4 rounded-full bg-[var(--primary)] text-white font-bold text-lg shadow-[0_0_20px_rgba(139,114,190,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
            >
              {status === 'loading' ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-6 h-6" /> Confirm & Submit Inquiry</>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}