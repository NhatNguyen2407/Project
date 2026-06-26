import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Star, Loader2 } from 'lucide-react';

export function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [formData, setFormData] = useState({
    topic: 'Products / Plushies',
    message: '',
    name: '',
    email: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    
    // Giả lập thời gian gửi API (Sau này bro nối API Google Sheets vào đây)
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  const resetForm = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStatus('idle');
      setRating(0);
      setFormData({ topic: 'Products / Plushies', message: '', name: '', email: '' });
    }, 300); // Chờ animation đóng xong mới reset
  };

  return (
    <>
      {/* FLOATING BUTTON: Nút góc dưới bên phải */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-gradient-to-tr from-emerald-500 to-green-400 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center text-white border-2 border-[var(--cyber-black)] cursor-pointer group"
      >
        <MessageSquare className="w-6 h-6 absolute transition-transform group-hover:scale-0" />
        <span className="text-2xl absolute scale-0 transition-transform group-hover:scale-100">🐸</span>
      </motion.button>

      {/* POPUP MODAL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[var(--card)] w-full max-w-md rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.15)] border border-[var(--border)] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()} // Chặn click xuyên thấu
            >
              {/* Nút X đóng */}
              <button onClick={resetForm} className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-[var(--silver-gray)] hover:text-white hover:bg-black/40 transition-colors z-10 cursor-pointer">
                <X className="w-5 h-5" />
              </button>

              {status === 'success' ? (
                /* MÀN HÌNH CẢM ƠN DỄ THƯƠNG */
                <div className="p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="text-7xl mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                    🐸💚
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-3">Thank you!</h2>
                  <p className="text-[var(--silver-gray)] mb-8 leading-relaxed">
                    Frog has received your feedback. <br/> Your thoughts help us grow! 🥹
                  </p>
                  <button onClick={resetForm} className="px-8 py-3 rounded-full bg-[#1A1528] border border-[var(--border)] text-white font-medium hover:bg-emerald-500/20 hover:border-emerald-500 transition-colors cursor-pointer">
                    Close
                  </button>
                </div>
              ) : (
                /* FORM NHẬP GÓP Ý */
                <>
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#143627] to-[#0A1F16] p-6 text-center relative border-b border-emerald-500/20">
                    <div className="text-4xl mb-2 drop-shadow-md">🐸</div>
                    <h2 className="text-xl font-bold text-emerald-400 mb-1">Frog wants to hear from you!</h2>
                    <p className="text-sm text-emerald-100/70">Help us make Dioxyzine Frog even better 💚</p>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* 1. Rating Sao */}
                    <div className="text-center">
                      <label className="block text-sm font-semibold text-[var(--silver-gray)] mb-3">How would you rate your experience?</label>
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star} type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="cursor-pointer transition-transform hover:scale-110"
                          >
                            <Star className={`w-8 h-8 ${star <= (hoverRating || rating) ? 'fill-emerald-400 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'text-[#2C1A29]'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Chủ đề */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Topic *</label>
                      <select 
                        value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})}
                        className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                      >
                        <option>Products / Plushies</option>
                        <option>Design & Customization</option>
                        <option>Shipping & Delivery</option>
                        <option>Website Experience</option>
                        <option>Other</option>
                      </select>
                    </div>

                    {/* 3. Nội dung */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Tell us the details 🐸</label>
                      <textarea 
                        required
                        value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full h-24 px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none" 
                        placeholder="I really love this frog but..."
                      ></textarea>
                    </div>

                    {/* 4. Thông tin (Optional) */}
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" placeholder="Your Name (Optional)" 
                        value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors" 
                      />
                      <input 
                        type="email" placeholder="Email (Optional)" 
                        value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors" 
                      />
                    </div>

                    {/* Submit Btn */}
                    <button 
                      type="submit" disabled={status === 'loading'}
                      className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl text-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100 cursor-pointer"
                    >
                      {status === 'loading' ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : <>🐸 Send to Frog!</>}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}