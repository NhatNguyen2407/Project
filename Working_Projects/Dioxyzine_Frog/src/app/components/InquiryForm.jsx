import { useState } from 'react';
import { useLocation, Link } from 'react-router';
import { useLanguage } from '../context/LanguageContext';

export function InquiryForm() {
  const { lang } = useLanguage();
  const location = useLocation();
  const stateData = location.state || {}; 

  const [formData, setFormData] = useState({
    name: '', 
    email: '',
    product: stateData.passedProduct || '',
    quantity: stateData.passedQty || '',
    size: stateData.passedSize || '',
    accQty: stateData.passedAccQty || '',
    message: ''
  });
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert(lang === 'vi' ? 'Vui lòng đồng ý với Điều khoản dịch vụ!' : 'Please agree to the Terms of Service!');
      return;
    }
    alert(lang === 'vi' ? 'Đã gửi yêu cầu thành công!' : 'Inquiry Sent Successfully!');
    // Ở đây sẽ tích hợp API gửi email sau
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] shadow-xl relative z-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-white mb-2">{lang === 'vi' ? 'Tên của bạn' : 'Your Name'}</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Email</label>
          <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)]" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-[var(--silver-gray)] mb-2">{lang === 'vi' ? 'Sản phẩm' : 'Product'}</label>
          <input type="text" value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} placeholder={lang === 'vi' ? 'Loại sản phẩm...' : 'Product type...'} className="w-full px-4 py-3 bg-[#08080C] border border-[var(--border)] rounded-xl text-[var(--primary)] font-semibold" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--silver-gray)] mb-2">{lang === 'vi' ? 'Số lượng' : 'Quantity'}</label>
          <input type="text" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} placeholder={lang === 'vi' ? 'VD: 50' : 'E.g: 50'} className="w-full px-4 py-3 bg-[#08080C] border border-[var(--border)] rounded-xl text-[var(--primary)] font-semibold" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--silver-gray)] mb-2">{lang === 'vi' ? 'Kích thước' : 'Size'}</label>
          <input type="text" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} placeholder={lang === 'vi' ? 'VD: 20cm' : 'E.g: 20cm'} className="w-full px-4 py-3 bg-[#08080C] border border-[var(--border)] rounded-xl text-[var(--primary)] font-semibold" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white mb-2">{lang === 'vi' ? 'Chi tiết yêu cầu & Link tải ảnh' : 'Message & Reference Links'}</label>
        <textarea required rows="4" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder={lang === 'vi' ? 'Hãy mô tả ý tưởng của bạn và đính kèm link Google Drive chứa file hình ảnh nhé...' : 'Describe your vision and include a Google Drive link to your reference images...'} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-[var(--primary)]"></textarea>
      </div>

      {/* Checkbox Chấp nhận điều khoản */}
      <div className="flex items-center gap-3 bg-[var(--cyber-black)] p-4 rounded-xl border border-[var(--border)]">
        <input type="checkbox" id="termsCheck" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="w-5 h-5 accent-[var(--primary)] cursor-pointer flex-shrink-0" />
        <label htmlFor="termsCheck" className="text-sm text-[var(--silver-gray)] cursor-pointer">
          {lang === 'vi' ? 'Tôi đã đọc và đồng ý với ' : 'I have read and agree to the '}
          <Link to="/terms" className="text-[var(--primary)] underline font-semibold hover:text-white transition-colors" target="_blank">
            {lang === 'vi' ? 'Điều khoản dịch vụ & Lưu ý kỹ thuật' : 'Terms of Service & Technical Notes'}
          </Link>
        </label>
      </div>

      <button type="submit" disabled={!acceptedTerms} className={`w-full py-4 rounded-full font-bold text-lg transition-all ${acceptedTerms ? 'bg-[var(--primary)] text-white hover:shadow-[0_0_20px_rgba(139,114,190,0.5)] cursor-pointer' : 'bg-[#1A1528] text-gray-500 cursor-not-allowed'}`}>
        {lang === 'vi' ? 'Gửi Yêu Cầu Báo Giá' : 'Submit Inquiry'}
      </button>
    </form>
  );
}