import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle, Loader2, Lock, Calculator, Layers } from 'lucide-react'; // 🚀 Thêm icon Layers
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import { api } from '../service/api';
import { ToastNotification } from '../components/common_components/ToastNotification';
import { TermsOfServiceModal } from '../components/common_components/TermsOfServiceModal';
import { SEO } from '../components/common_components/SEO';
import { useAuth } from '../context/AuthContext';

import { pricingMatrix } from '../data/pricingMatrix';

export function InquiryPage() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const location = useLocation();
  const state = location.state || {}; // 🚀 State chứa passedProduct và prototypeImage

  const { user } = useAuth();

  const [formData, setFormData] = useState({
    subject: '', customerName: '', customerEmail: '', contactInfo: '', 
    productType: '2-piece-margin', 
    quantity: state.passedQty || '50', 
    size: state.passedSize || '10', 
    accessoryQty: state.passedAccQty || '0', 
    imageLink: '', note: ''
  });

  const [isSubjectEdited, setIsSubjectEdited] = useState(false);
  const [status, setStatus] = useState('idle');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsOfServiceModal, setShowTermsOfServiceModal] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const currentProduct = pricingMatrix[formData.productType];
  const availableSizes = currentProduct?.sizes || [];

  useEffect(() => {
    if (currentProduct && currentProduct.sizes.length > 0) {
      const sizeExists = currentProduct.sizes.find(s => s.key === formData.size);
      if (!sizeExists) {
        setFormData(prev => ({ ...prev, size: currentProduct.sizes[0].key }));
      }
    }
  }, [formData.productType, currentProduct]);

  const estimatedQuote = useMemo(() => {
    if (!currentProduct || currentProduct.name === 'Custom Requirements') return null;
    
    const qty = parseInt(formData.quantity) || 0;
    if (qty < 1) return null;

    const bracket = currentProduct.priceBrackets.find(b => qty >= b.min && qty <= b.max);
    if (!bracket) return null;

    const sizeIndex = currentProduct.sizes.findIndex(s => s.key === formData.size);
    if (sizeIndex === -1) return null;

    const basePrice = bracket.prices[sizeIndex];
    const addonPrice = currentProduct.addons?.phuKien?.[sizeIndex] || 0;
    const accQty = parseInt(formData.accessoryQty) || 0;

    const totalPerItem = basePrice + (addonPrice * accQty);
    return (totalPerItem * qty).toFixed(2);
  }, [formData.productType, formData.quantity, formData.size, formData.accessoryQty, currentProduct]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.user_metadata?.full_name || prev.customerName,
        customerEmail: user.email || prev.customerEmail
      }));
    }
  }, [user]);

  // 🚀 Tự động set tiêu đề từ trang Prototype truyền sang
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
    if (!formData.subject || !formData.customerName || !formData.customerEmail || !formData.contactInfo || !formData.imageLink || !formData.quantity) {
      return showToast('Please fill in all required fields!', 'error');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      return showToast('Invalid email address! Please check again.', 'error');
    }
    if (!acceptedTerms) return showToast('Please agree to the Terms of Service before submitting!', 'error');

    if (!executeRecaptcha) {
      return showToast('reCAPTCHA is not ready. Please refresh the page!', 'error');
    }

    setStatus('loading');
    
    try {
      const payload = {
        ...formData,
        productName: currentProduct?.name || 'Custom Requirements'
      };
      
      await api.submitInquiry(payload);
      
      showToast('Inquiry Sent Successfully!', 'success');
      setStatus('success');
      setAcceptedTerms(false);
      
      setFormData({ 
        subject: '', 
        customerName: user ? user.user_metadata?.full_name : '', 
        customerEmail: user ? user.email : '', 
        contactInfo: '', productType: '2-piece-margin', quantity: '50', size: '10', accessoryQty: '0', imageLink: '', note: '' 
      });
    } catch (error) {
      console.error('Error:', error);
      showToast('Connection error. Please try again later!', 'error');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <SEO 
        title="Submit Inquiry | Dioxyzine Frog" 
        description="Fill in the details for us to provide the most accurate consultation and custom quote for your project." 
      />
      
      <ToastNotification toast={toast} />
      <TermsOfServiceModal isOpen={showTermsOfServiceModal} onClose={() => setShowTermsOfServiceModal(false)} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">Submit Inquiry</h1>
          <p className="text-lg text-[var(--muted-foreground)]">Fill in the details for us to provide the most accurate consultation and quote</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN (Giữ nguyên) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-10 shadow-[0_0_40px_rgba(139,114,190,0.15)] relative overflow-hidden">
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
                  <label className="text-sm font-semibold text-white">Inquiry Subject *</label>
                  <input required type="text" name="subject" value={formData.subject} onChange={(e) => { setIsSubjectEdited(true); handleChange(e); }} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--primary)]/50 rounded-xl text-white font-medium outline-none" />
                </div>
                
                <div className="space-y-2 relative">
                  <label className="text-sm font-semibold text-white">Email Address *</label>
                  <input 
                    required type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} readOnly={!!user}
                    className={`w-full px-4 py-3 rounded-xl text-white outline-none border ${user ? 'bg-[#130F1D] border-transparent text-gray-400 cursor-not-allowed' : 'bg-[#1A1528] border-[var(--border)] focus:border-[var(--primary)]'}`} 
                  />
                  {user && <Lock className="absolute right-4 top-[38px] w-4 h-4 text-gray-500" />}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white flex items-center justify-between">
                    Your Name * {user && <span className="text-xs text-[var(--primary)] font-normal">Editable</span>}
                  </label>
                  <input required type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none focus:border-[var(--primary)]" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-white">Social Media Link (Facebook / Instagram) *</label>
                  <input required type="text" name="contactInfo" value={formData.contactInfo} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none focus:border-[var(--primary)]" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-[var(--primary)]">Product Type *</label>
                  <div className="relative">
                    <select name="productType" value={formData.productType} onChange={handleChange} className="w-full bg-[#1A1528] border border-[var(--primary)]/50 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer focus:border-[var(--primary)] outline-none font-bold">
                      {Object.keys(pricingMatrix).map(key => (
                        <option key={key} value={key}>{pricingMatrix[key].name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white"><Lock className="w-4 h-4 opacity-50" /></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Size</label>
                  <div className="relative">
                    <select name="size" value={formData.size} onChange={handleChange} disabled={availableSizes.length === 0} className="w-full bg-[#1A1528] border border-[var(--border)] rounded-xl px-4 py-3 text-white appearance-none cursor-pointer focus:border-[var(--primary)] outline-none disabled:opacity-50">
                      {availableSizes.length > 0 ? (
                        availableSizes.map(s => <option key={s.key} value={s.key}>{s.label}</option>)
                      ) : <option value="">N/A</option>}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Quantity * (Min 1)</label>
                  <input required type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none focus:border-[var(--primary)]" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-white">Number of Custom Accessories (Per Unit)</label>
                  <input type="number" min="0" name="accessoryQty" value={formData.accessoryQty} onChange={handleChange} placeholder="E.g., 1 Hat + 1 Shirt = 2" className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none focus:border-[var(--primary)]" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-white">Design Link (Google Drive...) *</label>
                  <input required type="url" name="imageLink" value={formData.imageLink} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none focus:border-[var(--primary)]" placeholder="https://..." />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-white">Additional Notes</label>
                  <textarea name="note" value={formData.note} onChange={handleChange} rows="3" className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none resize-none focus:border-[var(--primary)]"></textarea>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[var(--cyber-black)] p-4 rounded-xl border border-[var(--border)] mt-4">
                <input type="checkbox" id="termsCheck" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="w-5 h-5 accent-[var(--primary)] cursor-pointer flex-shrink-0" />
                <label htmlFor="termsCheck" className="text-sm text-[var(--silver-gray)] cursor-pointer select-none">
                  I agree to the <span onClick={(e) => { e.preventDefault(); setShowTermsOfServiceModal(true); }} className="text-[var(--primary)] font-bold underline hover:text-white transition-colors ml-1 cursor-pointer">Terms of Service</span> *
                </label>
              </div>

              <button type="submit" disabled={status === 'loading'} className="w-full py-4 rounded-full bg-[var(--primary)] text-white font-bold text-lg shadow-[0_0_20px_rgba(139,114,190,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
                {status === 'loading' ? <><Loader2 className="w-6 h-6 animate-spin" /> Sending...</> : <><Send className="w-6 h-6" /> Confirm & Submit Inquiry</>}
              </button>
            </form>
          </motion.div>

          {/* CỘT PHẢI: XEM TRƯỚC VÀ BÁO GIÁ */}
          <div className="w-full lg:w-1/3 space-y-8">
            
            {/* 🚀 KHUNG SHOW ẢNH PROTOTYPE ĐƯỢC TRUYỀN SANG */}
            {state.prototypeImage && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1A1528] border border-[var(--primary)]/40 rounded-3xl p-6 shadow-[0_0_30px_rgba(139,114,190,0.2)]">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <Layers className="w-5 h-5 text-[var(--primary)]" /> 
                  Your Prototype
                </h3>
                
                <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--cyber-black)]">
                  <img src={state.prototypeImage} alt="Your 2D Prototype" className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500" />
                </div>
                
                {/* 🚀 HIỂN THỊ THÔNG SỐ CMYK XƯỞNG CẦN NHÌN THẤY Ở ĐÂY */}
                <div className="mt-4 p-3 bg-[var(--cyber-black)] border border-[var(--border)] rounded-xl flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-bold uppercase">Fabric Color:</span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{state.passedColorName || 'Default White'}</p>
                    <p className="text-xs font-mono text-[var(--primary)]">{state.passedCmyk || 'CMYK: N/A'}</p>
                  </div>
                </div>

                <p className="text-xs text-[var(--silver-gray)] mt-4 leading-relaxed bg-white/5 p-3 rounded-xl border border-[var(--border)]">
                  <span className="font-bold text-white">Note:</span> This preview is attached to your form visually. Please still provide the <span className="text-[var(--primary)]">Google Drive link</span> to your original high-res design files so our tailors can work accurately!
                </p>
              </motion.div>
            )}

            {/* KHUNG BÁO GIÁ DỰ KIẾN */}
            <div className="sticky top-28 bg-[#1A1528] border border-[var(--primary)]/30 rounded-3xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-[var(--border)] pb-4">
                <Calculator className="w-5 h-5 text-[var(--primary)]" /> 
                Estimate Quote
              </h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs text-[var(--silver-gray)] uppercase tracking-wider mb-1">Product</p>
                  <p className="text-sm font-bold text-white">{currentProduct?.name || 'Custom'}</p>
                </div>
                {availableSizes.length > 0 && (
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-[var(--silver-gray)] uppercase tracking-wider">Size</p>
                    <p className="text-sm font-bold text-white">{currentProduct?.sizes.find(s => s.key === formData.size)?.label || formData.size}</p>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <p className="text-xs text-[var(--silver-gray)] uppercase tracking-wider">Quantity</p>
                  <p className="text-sm font-bold text-white">{formData.quantity} units</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-[var(--silver-gray)] uppercase tracking-wider">Accessories</p>
                  <p className="text-sm font-bold text-white">{formData.accessoryQty} per unit</p>
                </div>
              </div>

              <div className="bg-[var(--cyber-black)] p-4 rounded-2xl border border-[var(--border)] mb-4">
                <p className="text-xs text-[var(--silver-gray)] uppercase tracking-wider mb-2 text-center">Estimated Total</p>
                {estimatedQuote ? (
                  <div className="text-center">
                    <span className="text-3xl font-bold text-green-400">${estimatedQuote}</span>
                    <p className="text-xs text-green-400/70 mt-1">~ ${(estimatedQuote / formData.quantity).toFixed(2)} / unit</p>
                  </div>
                ) : (
                  <div className="text-center text-yellow-500 font-bold text-sm">
                    {parseInt(formData.quantity) < 1 ? 'Minimum order is 1 units' : 'Please contact us for quote'}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed italic text-center">
                * This is a roughly estimated price. Final price may vary slightly depending on the complexity of your design and shipping costs. 
                If you want a more accurate quote, kindly reach us.
              </p>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}