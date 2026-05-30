import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Facebook, Instagram, Mail, Zap, ArrowLeft } from 'lucide-react';
import { InquiryForm } from '../components/InquiryForm';
import { useLanguage } from '../context/LanguageContext';

export function InquiryPage() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // mode: 'select' | 'quick' | 'standard'
  const [mode, setMode] = useState('select');

  // Điền link MXH của shop vào đây nhé bro
  const facebookLink = "https://facebook.com/dioxyzinefrog";
  const instagramLink = "https://www.instagram.com/dioxyzinefrog.print/";

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Nút Back */}
        <button 
          onClick={() => mode === 'select' ? navigate(-1) : setMode('select')}
          className="flex items-center gap-2 text-[var(--silver-gray)] hover:text-[var(--primary)] transition-colors mb-8 font-medium cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          {lang === 'vi' ? 'Quay lại' : 'Go Back'}
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)] mb-4">
            {lang === 'vi' ? 'Nhận Báo Giá' : 'Get a Quote'}
          </h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            {lang === 'vi' 
              ? 'Chọn phương thức liên hệ phù hợp với bạn nhất' 
              : 'Choose the inquiry method that works best for you'}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === 'select' && (
            <motion.div 
              key="select"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Quick Inquiry */}
              <button 
                onClick={() => setMode('quick')}
                className="bg-[var(--card)] border border-[var(--primary)]/50 rounded-3xl p-10 text-center hover:bg-[var(--primary)]/10 hover:shadow-[0_0_30px_rgba(139,114,190,0.3)] transition-all cursor-pointer group"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">{lang === 'vi' ? 'Báo Giá Nhanh' : 'Quick Inquiry'}</h2>
                <p className="text-[var(--silver-gray)] leading-relaxed">
                  {lang === 'vi' ? 'Nhắn tin trực tiếp qua mạng xã hội. Phản hồi siêu tốc, trao đổi dễ dàng.' : 'Direct message via social media. Lightning fast response and easy chat.'}
                </p>
              </button>

              {/* Standard Inquiry */}
              <button 
                onClick={() => setMode('standard')}
                className="bg-[var(--cyber-black)] border border-[var(--border)] rounded-3xl p-10 text-center hover:border-[var(--primary)] hover:shadow-[0_0_30px_rgba(139,114,190,0.2)] transition-all cursor-pointer group"
              >
                <div className="w-20 h-20 rounded-full bg-[#1A1528] border border-[var(--border)] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Mail className="w-10 h-10 text-[var(--primary)]" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">{lang === 'vi' ? 'Báo Giá qua Email' : 'Standard Inquiry'}</h2>
                <p className="text-[var(--silver-gray)] leading-relaxed">
                  {lang === 'vi' ? 'Điền form chi tiết để nhận email báo giá chính thức và chuyên nghiệp.' : 'Fill out a detailed form to receive a professional email quote.'}
                </p>
              </button>
            </motion.div>
          )}

          {mode === 'quick' && (
            <motion.div 
              key="quick"
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
              className="max-w-2xl mx-auto bg-[var(--card)] border border-[var(--border)] rounded-3xl p-12 text-center shadow-xl"
            >
              <h2 className="text-3xl font-heading text-white mb-8">
                {lang === 'vi' ? 'Nhắn tin ngay cho sốp tại:' : 'Direct Message us on:'}
              </h2>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 px-8 py-5 rounded-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-lg transition-colors shadow-lg">
                  <Facebook className="w-6 h-6" /> Facebook
                </a>
                <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 px-8 py-5 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90 text-white font-bold text-lg transition-opacity shadow-lg">
                  <Instagram className="w-6 h-6" /> Instagram
                </a>
              </div>
            </motion.div>
          )}

          {mode === 'standard' && (
            <motion.div 
              key="standard"
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            >
              {/* Form cũ được gọi thẳng ra đây */}
              <InquiryForm /> 
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}