import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Loader2, Star, MessageSquareQuote, AlertCircle } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'; 

import { api } from '../service/api';
import { ToastNotification } from '../components/common_components/ToastNotification';
import { SEO } from '../components/common_components/SEO';

export function FeedbackPage() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [status, setStatus] = useState('idle');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const [formData, setFormData] = useState({
    topic: 'Products / Plushies',
    message: '',
    name: '',
    email: ''
  });

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3500);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) return showToast('Please select a star rating before submitting!', 'error');
    if (!formData.message.trim()) return showToast('Please fill in your feedback details!', 'error');

    if (!executeRecaptcha) {
      return showToast('reCAPTCHA is not ready. Please try again!', 'error');
    }

    setStatus('loading');
    
    try {
      const token = await executeRecaptcha('feedback_submit');
      
      const feedbackData = {
        name: formData.name || 'Anonymous',
        email: formData.email || 'not-provided@email.com',
        rating: rating,
        message: `[${formData.topic}] - ${formData.message}`,
        token: token
      };

      await api.submitFeedback(feedbackData);
      
      showToast('Feedback submitted successfully! Thank you 🐸', 'success');
      setStatus('success');
    } catch (error) {
      console.error('Error:', error);
      showToast('Connection error. Please try again later!', 'error');
      setStatus('idle');
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setRating(0);
    setFormData({ topic: 'Products / Plushies', message: '', name: '', email: '' });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <SEO 
        title="Send Feedback" 
        description="Share your thoughts, suggestions, or workshop experience to help us improve our ecosystem." 
      />
      <ToastNotification toast={toast} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* Tiêu đề tự động dùng font Coiny béo mập và đổi màu tương phản giữa 2 theme */}
          <h1 className="font-heading text-4xl md:text-5xl mb-4 drop-shadow-sm">
            Send Feedback
          </h1>
          <p className="text-lg text-muted-foreground font-semibold">
            We'd love to hear your thoughts to help us improve our services and products!
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
          
          <AnimatePresence>
            {status === 'success' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 bg-card flex flex-col items-center justify-center text-center p-8">
                <CheckCircle className="w-20 h-20 text-[var(--primary)] mb-6 drop-shadow-sm" />
                <h2 className="text-3xl font-heading mb-4">Thank you!</h2>
                <p className="text-foreground text-lg mb-8 max-w-md font-medium">Dioxyzine Frog has received your feedback. Your thoughts mean the world to us! 🐸💚</p>
                <button onClick={resetForm} className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-bold hover:scale-105 transition-transform cursor-pointer shadow-md">
                  Send another feedback
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Box Đánh giá đổi sang dùng bg-muted động */}
            <div className="text-center bg-muted p-6 rounded-2xl border border-border relative">
              <label className="block text-sm font-bold text-primary mb-4 uppercase tracking-wider">How would you rate your experience? *</label>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="cursor-pointer transition-transform hover:scale-125">
                    <Star className={`w-10 h-10 transition-colors ${star <= (hoverRating || rating) ? 'fill-[var(--primary)] text-[var(--primary)] drop-shadow-sm' : 'text-gray-400'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Các ô nhập liệu đổi sang các class ngữ nghĩa, triệt tiêu gán cứng mã màu tối */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">What is this regarding? *</label>
              <select name="topic" value={formData.topic} onChange={handleInputChange} className="w-full px-4 py-4 bg-card border-2 border-border focus:border-primary rounded-xl text-foreground font-medium outline-none cursor-pointer transition-colors shadow-sm">
                <option>Products / Plushies</option>
                <option>Design & Customization</option>
                <option>Shipping & Delivery</option>
                <option>Website Experience</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Tell us the details *</label>
              <textarea name="message" value={formData.message} onChange={handleInputChange} className="w-full h-32 px-4 py-3 bg-card border-2 border-border focus:border-primary rounded-xl text-foreground font-medium outline-none resize-none transition-colors shadow-sm" placeholder="Share your thoughts, suggestions, or issues..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">Your Name (Optional)</label>
                <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border-2 border-border focus:border-primary rounded-xl text-foreground font-medium outline-none transition-colors shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">Email (Optional)</label>
                <input type="email" name="email" placeholder="example@gmail.com" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border-2 border-border focus:border-primary rounded-xl text-foreground font-medium outline-none transition-colors shadow-sm" />
              </div>
            </div>

            {/* Box Note chân trang đổi sang bg-background động */}
            <div className="flex items-start gap-3 bg-background p-4 rounded-xl border border-border mt-6">
              <AlertCircle className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground leading-relaxed font-medium"><span className="font-bold text-[var(--primary)]">Privacy Note:</span> Your feedback is securely processed and strictly used to help us improve Dioxyzine Frog's products and services.</p>
            </div>

            <button type="submit" disabled={status === 'loading'} className={`w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-lg transition-all shadow-md ${status !== 'loading' ? 'bg-[var(--primary)] text-white hover:scale-[1.01] cursor-pointer' : 'bg-muted text-gray-400 cursor-not-allowed'}`}>
              {status === 'loading' ? <><Loader2 className="w-6 h-6 animate-spin" /> Sending...</> : <><MessageSquareQuote className="w-6 h-6" /> Submit Feedback</>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}