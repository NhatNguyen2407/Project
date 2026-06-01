import { useState } from 'react';
import { useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// API
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPdjfVw18jsrTB2nyW6D68ZkfHX1MokS_1zC9Qa3uVqPJ4uu4wDW62CH56XXrw3QpU/exec';

export function InquiryPage() {
  const { lang } = useLanguage();
  const location = useLocation();
  const state = location.state || {};

  const defaultSubject = state.passedProduct 
    ? (lang === 'vi' ? `[Inquiry] Yêu cầu báo giá: ${state.passedProduct}` : `[Inquiry] Quote Request: ${state.passedProduct}`) 
    : (lang === 'vi' ? '[Inquiry] Yêu cầu báo giá sản phẩm' : '[Inquiry] Product Quote Request');

  const [formData, setFormData] = useState({
    subject: defaultSubject,
    customerName: '',
    customerEmail: '', // State lưu trữ email khách hàng
    contactInfo: '',
    productName: state.passedProduct || '',
    quantity: state.passedQty || '',
    size: state.passedSize || '',
    accessoryQty: state.passedAccQty || '0',
    imageLink: '',
    note: ''
  });

  const [status, setStatus] = useState('idle');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      setStatus('success');
      setFormData({
        subject: defaultSubject, customerName: '', customerEmail: '', contactInfo: '', productName: '', quantity: '', size: '', accessoryQty: '0', imageLink: '', note: ''
      });
    } catch (error) {
      console.error('Lỗi khi gửi form:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">
            {lang === 'vi' ? 'Gửi Yêu Cầu Báo Giá' : 'Submit Inquiry'}
          </h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            {lang === 'vi' ? 'Điền thông tin chi tiết để chúng tôi tư vấn và báo giá chính xác nhất cho bạn' : 'Fill in the details for us to provide the most accurate consultation and quote'}
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-10 shadow-[0_0_40px_rgba(139,114,190,0.15)] relative overflow-hidden">
          
          <AnimatePresence>
            {status === 'success' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 bg-[var(--card)] flex flex-col items-center justify-center text-center p-8">
                <CheckCircle className="w-20 h-20 text-green-500 mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                <h2 className="text-3xl font-bold text-white mb-4">{lang === 'vi' ? 'Gửi Thành Công!' : 'Submitted Successfully!'}</h2>
                <p className="text-[var(--silver-gray)] text-lg mb-8 max-w-md">
                  {lang === 'vi' ? 'Dioxyzine đã nhận được yêu cầu của bạn. Chúng tôi sẽ kiểm tra và phản hồi lại cho bạn sớm nhất có thể!' : 'Dioxyzine has received your inquiry. We will review it and get back to you as soon as possible!'}
                </p>
                <button onClick={() => setStatus('idle')} className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-bold hover:scale-105 transition-transform cursor-pointer">
                  {lang === 'vi' ? 'Gửi yêu cầu khác' : 'Submit another inquiry'}
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white">{lang === 'vi' ? 'Tiêu đề yêu cầu / Email Subject *' : 'Inquiry Subject / Email Subject *'}</label>
                <input required type="text" name="subject" value={formData.subject} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--primary)]/50 rounded-xl text-white font-medium focus:outline-none focus:border-[var(--primary)] transition-colors" placeholder="[Inquiry]..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">{lang === 'vi' ? 'Tên của bạn *' : 'Your Name *'}</label>
                <input required type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" placeholder={lang === 'vi' ? 'Nguyễn Văn A' : 'John Doe'} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">{lang === 'vi' ? 'Địa chỉ Email *' : 'Email Address *'}</label>
                <input required type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" placeholder="example@gmail.com" />
              </div>

              {/* THAY ĐỔI Ô LIÊN HỆ THEO NGÔN NGỮ */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white">
                  {lang === 'vi' ? 'Số điện thoại / Link Facebook / Zalo *' : 'Facebook / Instagram Link *'}
                </label>
                <input 
                  required 
                  type="text" 
                  name="contactInfo" 
                  value={formData.contactInfo} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" 
                  placeholder={lang === 'vi' ? 'Nhập SDT/Link Facebook...' : 'Enter your Facebook/Instagram Link...'} 
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white">{lang === 'vi' ? 'Sản phẩm muốn làm *' : 'Desired Product *'}</label>
                <input required type="text" name="productName" value={formData.productName} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" placeholder={lang === 'vi' ? 'Ví dụ: Doll 2D, Plushie 2 Mảnh...' : 'E.g., 2D Doll, Plushie...'} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">{lang === 'vi' ? 'Kích thước dự kiến' : 'Expected Size'}</label>
                <input type="text" name="size" value={formData.size} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" placeholder={lang === 'vi' ? '10cm, 20cm...' : '10cm, 20cm...'} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">{lang === 'vi' ? 'Số lượng *' : 'Quantity *'}</label>
                  <input required type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">{lang === 'vi' ? 'Phụ kiện' : 'Accessories'}</label>
                  <input type="number" min="0" name="accessoryQty" value={formData.accessoryQty} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white">{lang === 'vi' ? 'Link ảnh phác thảo/thiết kế (Google Drive, Imgur...)' : 'Design/Sketch Link (Google Drive, Imgur...)'}</label>
                <input type="url" name="imageLink" value={formData.imageLink} onChange={handleChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors" placeholder="https://..." />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white">{lang === 'vi' ? 'Ghi chú thêm cho xưởng' : 'Additional Notes for Workshop'}</label>
                <textarea name="note" value={formData.note} onChange={handleChange} rows="4" className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)] transition-colors resize-none" placeholder={lang === 'vi' ? 'Yêu cầu đặc biệt về chất liệu, đường may...' : 'Special requirements for materials, stitching...'}></textarea>
              </div>
            </div>

            {status === 'error' && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex items-center gap-3 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{lang === 'vi' ? 'Có lỗi xảy ra. Vui lòng thử lại sau!' : 'An error occurred. Please try again later!'}</span>
              </div>
            )}

            <button type="submit" disabled={status === 'loading'} className="w-full py-4 rounded-xl bg-[var(--primary)] text-white font-bold text-lg shadow-[0_0_20px_rgba(139,114,190,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer">
              {status === 'loading' ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> {lang === 'vi' ? 'Đang gửi...' : 'Sending...'}</>
              ) : (
                <><Send className="w-6 h-6" /> {lang === 'vi' ? 'Xác Nhận & Gửi Yêu Cầu' : 'Confirm & Submit Inquiry'}</>
              )}
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  );
}