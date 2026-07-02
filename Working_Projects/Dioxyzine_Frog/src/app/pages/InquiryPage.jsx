import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import { api } from '../service/api';
import { ToastNotification } from '../components/common_components/ToastNotification';
import { TermsModal } from '../components/common_components/TermsModal';
import { SEO } from '../components/common_components/SEO';

export function InquiryPage() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const location = useLocation();
  const state = location.state || {};

  const [formData, setFormData] = useState({
    subject: '', customerName: '', customerEmail: '', contactInfo: '', 
    productName: state.passedProduct || '', quantity: state.passedQty || '', 
    size: state.passedSize || '', accessoryQty: state.passedAccQty || '0', 
    imageLink: '', note: ''
  });

  const [isSubjectEdited, setIsSubjectEdited] = useState(false);
  const [status, setStatus] = useState('idle');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  useEffect(() => {
    if (!isSubjectEdited) {
      const dynamicSubject = state.passedProduct ? `[Inquiry] Quote Request: ${state.passedProduct}` : '[Inquiry] Product Quote Request';
      setFormData(prev => ({ ...prev, subject: dynamicSubject }));
    }
  }, [isSubjectEdited, state.passedProduct]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    if (!formData.subject || !formData.customerName || !formData.customerEmail || !formData.contactInfo || !formData.productName || !formData.imageLink || !formData.quantity) {
      return showToast('Please fill in all required fields!', 'error');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      return showToast('Invalid email address! Please check again.', 'error');
    }
    if (!acceptedTerms) return showToast('Please agree to the Terms of Service before submitting!', 'error');

    // Kiểm tra xem reCAPTCHA đã tải xong chưa
    if (!executeRecaptcha) {
      return showToast('reCAPTCHA is not ready. Please try again!', 'error');
    }

    setStatus('loading');
    
    try {
      const token = await executeRecaptcha('inquiry_submit');
      
      const finalData = { 
        ...formData, 
        token: token 
      };

      //Service API
      await api.submitInquiry(finalData);
      
      showToast('Inquiry Sent Successfully!', 'success');
      setStatus('success');
      // Reset form
      setAcceptedTerms(false);
      setFormData({ subject: '', customerName: '', customerEmail: '', contactInfo: '', productName: '', quantity: '', size: '', accessoryQty: '0', imageLink: '', note: '' });
    } catch (error) {
      console.error('Error:', error);
      showToast('Connection error. Please try again later!', 'error');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <SEO 
        title="Submit Inquiry" 
        description="Fill in the details for us to provide the most accurate consultation and custom quote for your project." 
      />
      
      {/*Components*/}
      <ToastNotification toast={toast} />
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">Submit Inquiry</h1>
          <p className="text-lg text-[var(--muted-foreground)]">Fill in the details for us to provide the most accurate consultation and quote</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-10 shadow-[0_0_40px_rgba(139,114,190,0.15)] relative overflow-hidden">
          
          <AnimatePresence>
            {status === 'success' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 bg-[var(--card)] flex flex-col items-center justify-center text-center p-8">
                <CheckCircle className="w-20 h-20 text-green-500 mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                <h2 className="text-3xl font-bold text-white mb-4">Submitted Successfully!</h2>
                <p className="text-[var(--silver-gray)] text-lg mb-8 max-w-md">Dioxyzine has received your inquiry. We will review it and get back to you as soon as possible!</p>
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
                <input required type="text" name="subject" value={formData.subject} onChange={(e) => { setIsSubjectEdited(true); handleChange(e); }} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--primary)]/50 rounded-xl text-white font-medium outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Your Name *</label>
                <input required type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Email Address *</label>
                <input required type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none" placeholder="example@gmail.com" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white">Facebook / Instagram *</label>
                <input required type="text" name="contactInfo" value={formData.contactInfo} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none" placeholder="Enter Link..." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white">Desired Product *</label>
                <input required type="text" name="productName" value={formData.productName} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none" placeholder="E.g., 2D Doll, Plushie..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Expected Size</label>
                <input type="text" name="size" value={formData.size} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none" placeholder="10cm, 20cm..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Quantity *</label>
                  <input required type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Accessories</label>
                  <input type="number" min="0" name="accessoryQty" value={formData.accessoryQty} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white">Design Link (Google Drive...) *</label>
                <input required type="url" name="imageLink" value={formData.imageLink} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none" placeholder="https://..." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white">Additional Notes</label>
                <textarea name="note" value={formData.note} onChange={handleChange} rows="4" className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none resize-none"></textarea>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[var(--cyber-black)] p-4 rounded-xl border border-[var(--border)] mt-4">
              <input type="checkbox" id="termsCheck" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="w-5 h-5 accent-[var(--primary)] cursor-pointer flex-shrink-0" />
              <label htmlFor="termsCheck" className="text-sm text-[var(--silver-gray)] cursor-pointer select-none">
                I agree to the <span onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} className="text-[var(--primary)] font-bold underline hover:text-white transition-colors ml-1 cursor-pointer">Terms of Service</span> *
              </label>
            </div>

            <button type="submit" disabled={status === 'loading'} className="w-full py-4 rounded-full bg-[var(--primary)] text-white font-bold text-lg shadow-[0_0_20px_rgba(139,114,190,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
              {status === 'loading' ? <><Loader2 className="w-6 h-6 animate-spin" /> Sending...</> : <><Send className="w-6 h-6" /> Confirm & Submit Inquiry</>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}