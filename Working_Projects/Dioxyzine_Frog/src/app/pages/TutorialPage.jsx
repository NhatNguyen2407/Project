// src/app/pages/TutorialPage.jsx
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Paintbrush, Scissors, Palette, Wrench } from 'lucide-react';

// ĐÃ SỬA LỖI: Import chính xác từ react-router
import { useParams, useNavigate } from 'react-router';

// Cấu hình danh sách bài học
const TUTORIAL_NAV = [
  { id: 'how-to-draw-2piece-plushie', label: '2-Piece Plushie Guide', icon: <Scissors className="w-4 h-4" /> },
  { id: 'how-to-draw-3piece-plushie', label: '3-Piece Plushie Guide', icon: <Scissors className="w-4 h-4" /> },
  { id: 'how-to-draw-printed-2ddoll', label: 'Printed 2D Doll Guide', icon: <Palette className="w-4 h-4" /> },
  { id: 'how-to-draw-embroidered-2ddoll', label: 'Embroidered 2D Doll Guide', icon: <Paintbrush className="w-4 h-4" /> },
];

export function TutorialPage() {
  const { tutorialSlug } = useParams();
  const navigate = useNavigate();

  // Nếu khách truy cập /tutorial rỗng, tự động đẩy vào bài đầu tiên
  const activeSlug = tutorialSlug || 'how-to-draw-2piece-plushie';

  // Lấy tên bài học hiện tại để hiển thị ra màn hình chờ
  const currentTutorial = TUTORIAL_NAV.find(t => t.id === activeSlug);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TIÊU ĐỀ CHÍNH */}
        <div className="text-center mb-12 border-b border-[var(--border)] pb-6">
          <h1 className="font-heading text-4xl md:text-5xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)] flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10 text-[var(--primary)]" /> Creator Tutorial
          </h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            Step-by-step design blueprints and specifications for our workshop assets
          </p>
        </div>

        {/* BỐ CỤC HAI CỘT */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* CỘT TRÁI: SIDEBAR ĐIỀU HƯỚNG BÀI HỌC */}
          <div className="w-full lg:w-1/4 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-xl flex-shrink-0">
            <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider px-3 mb-4">Tutorials</p>
            <div className="space-y-2">
              {TUTORIAL_NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/tutorial/${item.id}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer text-left
                    ${activeSlug === item.id 
                      ? 'bg-[var(--primary)] text-white shadow-[0_0_15px_rgba(139,114,190,0.3)] font-bold' 
                      : 'text-[var(--silver-gray)] hover:text-white hover:bg-white/5'}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: KHUNG CHỨA NỘI DUNG "ĐANG CẬP NHẬT" */}
          <div className="w-full lg:w-3/4">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeSlug}
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-[#1A1528] border border-[var(--border)] rounded-3xl p-10 md:p-16 shadow-[0_0_30px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center text-center min-h-[400px]"
              >
                <div className="w-24 h-24 mb-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] shadow-[0_0_20px_rgba(139,114,190,0.3)]">
                  <Wrench className="w-12 h-12" />
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-4 font-heading">
                  {currentTutorial?.label}
                </h2>
                <h3 className="text-xl font-semibold text-[var(--primary)] mb-4">
                  Documentation Under Construction.
                </h3>
                
                <p className="text-[var(--silver-gray)] text-lg max-w-lg leading-relaxed">
                  Our team is actively compiling the technical blueprints and canvas specifications for this asset. Comprehensive documentation will be deployed shortly. Thank you for your patience! 🐸💜
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}