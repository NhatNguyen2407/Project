import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// API
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyH0YC_0k5BqYHW1gvftYAjvxmu3CNoBLzHmDur9-s92EIUcePQpSU43tfXgpLs-CiA/exec';

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
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // đủ thông tin chưa
    if (!formData.subject || !formData.customerName || !formData.customerEmail || !formData.contactInfo || !formData.productName || !formData.imageLink || !formData.quantity) {
      setErrorMsg('Please fill in all required fields!');
      return; 
    }

    // mail
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.customerEmail)) {
      setErrorMsg('Invalid email address! Please check again.');
      return;
    }

    // link
    const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6})(\/.*)?$/i;
    if (!urlPattern.test(formData.imageLink)) {
      setErrorMsg('Invalid sketch link! Please enter a valid URL (E.g., https://...)');
      return;
    }

    // minimum qty
    const minQty = (formData.productName || '').toLowerCase().includes('custom') ? 30 : 11;
    if (Number(formData.quantity) < minQty) {
      setErrorMsg(`Minimum quantity for this product is ${minQty}!`);
      return;
    }

    // check for errors b4 submit
    setStatus('loading');
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      setStatus('success');
      setIsSubjectEdited(false);
      setFormData({
        subject: '', customerName: '', customerEmail: '', contactInfo: '', productName: '', quantity: '', size: '', accessoryQty: '0', imageLink: '', note: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
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
                  <input required type="number" min={formData.productName.toLowerCase().includes('custom') ? 30 : 11} name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" />
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

            {status === 'error' && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex items-center gap-3 text-red-500">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">An error occurred. Please try again later!</span>
              </div>
            )}

            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-[#2C1A29] border border-red-500/50 flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{errorMsg}</span>
              </motion.div>
            )}

            <button type="submit" disabled={status === 'loading'} className="w-full py-4 rounded-xl bg-[var(--primary)] text-white font-bold text-lg shadow-[0_0_20px_rgba(139,114,190,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer">
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