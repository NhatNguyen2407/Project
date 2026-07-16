import { useState } from 'react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router';
import { CheckCircle, User, MessageSquare, Package, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { supabase } from '../service/supabase';

export function QuoteRequestPage() {
  const location = useLocation();
  const prefillData = location.state;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    productType: prefillData?.product?.title || '',
    quantity: prefillData?.configuration?.quantity || '',
    budgetRange: '',
    deadline: '',
    description: '',
  });

  const steps = [
    { number: 1, title: 'Contact Info', icon: <User className="w-5 h-5" /> },
    { number: 2, title: 'Project Details', icon: <Package className="w-5 h-5" /> },
    { number: 3, title: 'Requirements', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  const handleSubmit = (e) => {
    const [toast, setToast] = useState({ show: false, msg: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!executeRecaptcha) {
      showToast('Hệ thống bảo mật chưa tải xong. Vui lòng tải lại trang!', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = await executeRecaptcha('quote_submit');
      
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token }
      });

      if (verifyError || !verifyData?.success) {
        console.error("Spam detected:", verifyError || verifyData?.message);
        showToast("Phát hiện truy cập bất thường (Spam). Từ chối gửi!", "error");
        setIsLoading(false);
        return; 
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Lỗi:", error);
      showToast("Lỗi hệ thống, vui lòng thử lại sau.", "error");
    } finally {
      setIsLoading(false);
    }
  };
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-background flex items-center justify-center px-4 relative z-10">
        <ToastNotification toast={toast} />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="max-w-2xl w-full bg-[#130D1E] border border-[var(--border)] rounded-3xl p-12 shadow-[0_0_30px_rgba(157,101,255,0.2)] text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-4xl font-bold mb-4 text-white">Quote Request Received!</h2>
          <a href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold shadow-lg"
            >
              Back to Home
            </motion.button>
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 text-white">Request a Quote</h1>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit}
          className="bg-[#130D1E] border border-[var(--border)] rounded-3xl p-8 shadow-[0_0_30px_rgba(157,101,255,0.15)]"
        >
          {currentStep === 1 && (
            <motion.div className="space-y-6">
              <div>
                <label className="block mb-2 font-medium flex items-center gap-2 text-white">
                  <User className="w-4 h-4 text-[var(--primary)]" /> Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-2xl bg-[#09090B] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div className="space-y-6">
              <div>
                <label className="block mb-2 font-medium flex items-center gap-2 text-white">
                  <Package className="w-4 h-4 text-[var(--primary)]" /> Product Type *
                </label>
                <input
                  type="text"
                  name="productType"
                  required
                  value={formData.productType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-2xl bg-[#09090B] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div className="space-y-6">
              <div>
                <label className="block mb-2 font-medium flex items-center gap-2 text-white">
                  <MessageSquare className="w-4 h-4 text-[var(--primary)]" /> Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-2xl bg-[#09090B] border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all resize-none"
                />
              </div>
            </motion.div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-[var(--border)]">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 rounded-full border border-[var(--primary)] text-white hover:bg-[var(--primary)]/20"
              >
                Previous
              </button>
            )}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="ml-auto px-6 py-3 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                className="ml-auto px-8 py-3 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-[0_0_15px_rgba(157,101,255,0.5)]"
              >
                Submit Quote Request
              </button>
            )}
          </div>
        </motion.form>
      </div>
    </div>
  );
}