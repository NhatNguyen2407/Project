import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Loader2, Star, MessageSquareQuote, AlertCircle } from 'lucide-react';

// IMPORT SERVICE VÀ TOAST CHUNG
import { api } from '../service/api';
import { ToastNotification } from '../components/common_components/ToastNotification';

export function FeedbackPage() {
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
    
    if (rating === 0) return showToast('Please select a star rating before submitting! ⭐', 'error');
    if (!formData.message.trim()) return showToast('Please fill in your feedback details! 📝', 'error');

    setStatus('loading');
    
    // Gom dữ liệu cần gửi
    const feedbackData = {
      name: formData.name || 'Anonymous',
      email: formData.email || 'not-provided@email.com',
      rating: rating,
      message: `[${formData.topic}] - ${formData.message}`
    };

    try {
      // --- ĐÃ SỬA: Sử dụng Service API tập trung ---
      await api.submitFeedback(feedbackData);
      showToast('Feedback submitted successfully! Thank you 💜', 'success');
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
      
      {/* Gọi Toast Component dùng chung */}
      <ToastNotification toast={toast} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">
            Send Feedback
          </h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            We'd love to hear your thoughts to help us improve our services and products!
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-10 shadow-[0_0_40px_rgba(139,114,190,0.15)] relative overflow-hidden">
          
          <AnimatePresence>
            {status === 'success' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 bg-[var(--card)] flex flex-col items-center justify-center text-center p-8">
                <CheckCircle className="w-20 h-20 text-[var(--primary)] mb-6 drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]" />
                <h2 className="text-3xl font-bold text-white mb-4">Thank you!</h2>
                <p className="text-[var(--silver-gray)] text-lg mb-8 max-w-md">Dioxyzine Frog has received your feedback. Your thoughts mean the world to us! 💜</p>
                <button onClick={resetForm} className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-bold hover:scale-105 transition-transform cursor-pointer">
                  Send another feedback
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="text-center bg-[#1A1528] p-6 rounded-2xl border border-[var(--border)] relative">
              <label className="block text-sm font-semibold text-white mb-4 uppercase tracking-wider">How would you rate your experience? *</label>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="cursor-pointer transition-transform hover:scale-125">
                    <Star className={`w-10 h-10 transition-colors ${star <= (hoverRating || rating) ? 'fill-[var(--primary)] text-[var(--primary)] drop-shadow-[0_0_10px_rgba(139,114,190,0.8)]' : 'text-[#3B2847]'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">What is this regarding? *</label>
              <select name="topic" value={formData.topic} onChange={handleInputChange} className="w-full px-4 py-4 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none cursor-pointer">
                <option>Products / Plushies</option>
                <option>Design & Customization</option>
                <option>Shipping & Delivery</option>
                <option>Website Experience</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Tell us the details *</label>
              <textarea name="message" value={formData.message} onChange={handleInputChange} className="w-full h-32 px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none resize-none" placeholder="Share your thoughts, suggestions, or issues..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--muted-foreground)] mb-2">Your Name (Optional)</label>
                <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--muted-foreground)] mb-2">Email (Optional)</label>
                <input type="email" name="email" placeholder="example@gmail.com" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white outline-none" />
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[var(--cyber-black)] p-4 rounded-xl border border-[var(--border)] mt-6">
              <AlertCircle className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--silver-gray)] leading-relaxed"><span className="font-semibold text-white">Privacy Note:</span> Your feedback is securely processed and strictly used to help us improve Dioxyzine Frog's products and services.</p>
            </div>

            <button type="submit" disabled={status === 'loading'} className={`w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-lg transition-all ${status !== 'loading' ? 'bg-[var(--primary)] text-white hover:shadow-[0_0_20px_rgba(139,114,190,0.5)] cursor-pointer' : 'bg-[#1A1528] text-gray-500 cursor-not-allowed'}`}>
              {status === 'loading' ? <><Loader2 className="w-6 h-6 animate-spin" /> Sending...</> : <><MessageSquareQuote className="w-6 h-6" /> Submit Feedback</>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}