import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Loader2, Star, MessageSquareQuote, AlertCircle, CheckCircle2 } from 'lucide-react';

export function FeedbackPage() {
  const [status, setStatus] = useState('idle');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  // Floating Toast
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // alert
    if (rating === 0) {
      showToast('Please select a star rating before submitting!', 'error');
      return;
    }
    
    if (!formData.message.trim()) {
      showToast('Please fill in your feedback details!', 'error');
      return;
    }

    setStatus('loading');
    
    const payload = {
      type: 'feedback',
      name: formData.name,
      email: formData.email,
      rating: rating,
      message: `[${formData.topic}] - ${formData.message}`
    };

    try {
      await fetch('https://script.google.com/macros/s/AKfycbwuex1g0XqvFfM1lf79CqmZ_oBzRGTGBTt27pjduIw7ZeIROJmU6AA2oRfVXGW3JD-P/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });
      showToast('Feedback submitted successfully! Thank you!', 'success');
      setStatus('success');
    } catch (error) {
      console.error('Error sending feedback:', error);
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
      
      {/* Toast */}
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 bg-[var(--card)] flex flex-col items-center justify-center text-center p-8">
                <CheckCircle className="w-20 h-20 text-[var(--primary)] mb-6 drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]" />
                <h2 className="text-3xl font-bold text-white mb-4">Thank you!</h2>
                <p className="text-[var(--silver-gray)] text-lg mb-8 max-w-md">
                  Dioxyzine Frog has received your feedback. Your thoughts mean the world to us! 💜
                </p>
                <button onClick={resetForm} className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-bold hover:scale-105 transition-transform cursor-pointer shadow-[0_0_15px_rgba(139,114,190,0.4)]">
                  Send another feedback
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Rating */}
            <div className="text-center bg-[#1A1528] p-6 rounded-2xl border border-[var(--border)] relative">
              <label className="block text-sm font-semibold text-white mb-4 uppercase tracking-wider">How would you rate your experience? *</label>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star} type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="cursor-pointer transition-transform hover:scale-125"
                  >
                    <Star className={`w-10 h-10 transition-colors ${star <= (hoverRating || rating) ? 'fill-[var(--primary)] text-[var(--primary)] drop-shadow-[0_0_10px_rgba(139,114,190,0.8)]' : 'text-[#3B2847]'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">What is this regarding? *</label>
              <select 
                value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})}
                className="w-full px-4 py-4 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors appearance-none cursor-pointer"
              >
                <option>Products / Plushies</option>
                <option>Design & Customization</option>
                <option>Shipping & Delivery</option>
                <option>Website Experience</option>
                <option>Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Tell us the details *</label>
              <textarea 
                value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full h-32 px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors resize-none" 
                placeholder="Share your thoughts, suggestions, or issues..."
              ></textarea>
            </div>

            {/* Optional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--muted-foreground)] mb-2">Your Name (Optional)</label>
                <input 
                  type="text" placeholder="John Doe" 
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--muted-foreground)] mb-2">Email (Optional)</label>
                <input 
                  type="email" placeholder="example@gmail.com" 
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" 
                />
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[var(--cyber-black)] p-4 rounded-xl border border-[var(--border)] mt-6">
              <AlertCircle className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--silver-gray)] leading-relaxed">
                <span className="font-semibold text-white">Privacy Note:</span> Your feedback is securely processed and strictly used to help us improve Dioxyzine Frog's products and services.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={status === 'loading'} 
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-lg transition-all ${status !== 'loading' ? 'bg-[var(--primary)] text-white hover:shadow-[0_0_20px_rgba(139,114,190,0.5)] cursor-pointer' : 'bg-[#1A1528] text-gray-500 cursor-not-allowed'}`}
            >
              {status === 'loading' ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Sending...</>
              ) : (
                <><MessageSquareQuote className="w-6 h-6" /> Submit Feedback</>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}