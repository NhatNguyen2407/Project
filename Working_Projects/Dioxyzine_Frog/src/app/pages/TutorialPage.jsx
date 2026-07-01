// src/app/pages/TutorialPage.jsx
import { useParams, useNavigate, Link } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Paintbrush, ShieldAlert, CheckCircle } from 'lucide-react';

// Cấu hình danh sách bài học và slug URL như sếp yêu cầu
const TUTORIAL_NAV = [
  { id: 'how-to-draw-2piece-plushie', label: 'Plushie 2 mảnh', icon: <Paintbrush className="w-4 h-4" /> },
  { id: 'how-to-draw-3piece-plushie', label: 'Plushie 3 mảnh', icon: <Paintbrush className="w-4 h-4" /> },
  { id: 'how-to-draw-printed-2ddoll', label: 'Doll 2D In', icon: <Paintbrush className="w-4 h-4" /> },
  { id: 'how-to-draw-embroidered-2ddoll', label: 'Doll 2D Thêu', icon: <Paintbrush className="w-4 h-4" /> },
];

export function TutorialPage() {
  const { tutorialSlug } = useParams();
  const navigate = useNavigate();

  // Nếu khách truy cập /tutorial rỗng, tự động đẩy vào bài đầu tiên
  const activeSlug = tutorialSlug || 'how-to-draw-2piece-plushie';

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TIÊU ĐỀ CHÍNH */}
        <div className="text-center mb-12 border-b border-[var(--border)] pb-6">
          <h1 className="font-heading text-4xl md:text-5xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)] flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10 text-[var(--primary)]" /> Creator Academy
          </h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            Step-by-step design blueprints and specifications for our workshop assets
          </p>
        </div>

        {/* BỐ CỤC HAI CỘT (SIDEBAR + NỘI DUNG) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* CỘT TRÁI: SIDEBAR ĐIỀU HƯỚNG BÀI HỌC */}
          <div className="w-full lg:w-1/4 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 space-y-2 flex-shrink-0">
            <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider px-3 mb-3">Danh sách bài học</p>
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

          {/* CỘT PHẢI: KHUNG CHỨA NỘI DUNG CHI TIẾT BÀI VIẾT (MOCKUP ĐỂ SẾP ĐIỀN CHỮ SAU) */}
          <div className="w-full lg:w-3/4">
            <motion.div 
              key={activeSlug}
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.3 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 md:p-10 shadow-xl space-y-6"
            >
              {activeSlug === 'how-to-draw-2piece-plushie' && (
                <>
                  <h2 className="text-3xl font-bold text-white font-heading">Hướng dẫn vẽ Plushie 2 mảnh</h2>
                  <p className="text-[var(--silver-gray)] leading-relaxed">Đây là tài liệu đặc tả kỹ thuật dành cho phôi gấu bông 2 mặt phẳng cơ bản tại Dioxyzine Frog...</p>
                  <div className="bg-[#1A1528] p-4 rounded-xl border border-[var(--border)] text-sm text-[var(--primary)] font-medium">💡 Lưu ý: Biên an toàn của đường may là 5mm.</div>
                </>
              )}

              {activeSlug === 'how-to-draw-3piece-plushie' && (
                <>
                  <h2 className="text-3xl font-bold text-white font-heading">Hướng dẫn vẽ Plushie 3 mảnh</h2>
                  <p className="text-[var(--silver-gray)] leading-relaxed">Hướng dẫn bóc tách phôi đa chiều cho gấu bông có khối đầu tròn hoặc thân dày dặn...</p>
                </>
              )}

              {activeSlug === 'how-to-draw-printed-2ddoll' && (
                <>
                  <h2 className="text-3xl font-bold text-white font-heading">Hướng dẫn vẽ Doll 2D In</h2>
                  <p className="text-[var(--silver-gray)] leading-relaxed">Yêu cầu hệ màu CMYK và độ phân giải tối thiểu 300 DPI khi xuất file in vải Velboa...</p>
                </>
              )}

              {activeSlug === 'how-to-draw-embroidered-2ddoll' && (
                <>
                  <h2 className="text-3xl font-bold text-white font-heading">Hướng dẫn vẽ Doll 2D Thêu</h2>
                  <p className="text-[var(--silver-gray)] leading-relaxed">Quy định về độ dày nét vẽ vector để máy thêu kỹ thuật số có thể đi chỉ mượt mà nhất...</p>
                </>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}