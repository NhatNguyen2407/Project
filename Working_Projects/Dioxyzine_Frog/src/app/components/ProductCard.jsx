import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function ProductCard({ id, title, image, basePrice, moq, category, isPopular, isNew }) {
  const { lang } = useLanguage();

  // An toàn xử lý song ngữ, lỡ data cũ là string thì vẫn không sập
  const displayTitle = title?.[lang] || title || '';

  // Hàm chuyển đổi tiền tệ
  const formatCurrency = (priceInK) => {
    if (!priceInK) return lang === 'vi' ? '0 VND' : '$0.00 USD';
    const priceInVND = priceInK * 1000;
    if (lang === 'en') {
      const priceInUSD = priceInVND / 26300;
      return `$${priceInUSD.toFixed(2)}`;
    }
    return new Intl.NumberFormat('vi-VN').format(priceInVND) + 'đ';
  };

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(139,114,190,0.3)] transition-all duration-300 group flex flex-col h-full"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#1A1528]">
        {image ? (
          <img
            src={image}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
        )}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isPopular && (
            <span className="px-3 py-1 bg-[var(--primary)] text-white text-xs font-bold rounded-full shadow-[0_0_10px_rgba(139,114,190,0.5)]">
              {lang === 'vi' ? 'Phổ biến' : 'Popular'}
            </span>
          )}
          {isNew && (
            <span className="px-3 py-1 bg-[#FFFFFF] text-[#08080C] text-xs font-bold rounded-full shadow-md">
              {lang === 'vi' ? 'Mới' : 'New'}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-block px-3 py-1 rounded-full bg-[#1A1528] text-xs font-medium text-[var(--primary)] border border-[var(--border)]">
            {category}
          </span>
        </div>

        <h3 className="font-heading text-xl text-white mb-2 line-clamp-2">
          {displayTitle}
        </h3>

        <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-end justify-between">
          <div>
            <p className="text-xs text-[var(--muted-foreground)] mb-1">
              {lang === 'vi' ? 'Giá chỉ từ' : 'Starts at'}
            </p>
            <p className="text-xl font-bold text-[var(--primary)]">
              {formatCurrency(basePrice)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--muted-foreground)] mb-1">MOQ</p>
            <p className="text-sm font-medium text-white">
              {moq} {lang === 'vi' ? 'cái' : 'pcs'}
            </p>
          </div>
        </div>

        <Link to={`/product/${id}`} className="mt-6">
          <button className="w-full py-3 rounded-xl bg-[var(--cyber-black)] border border-[var(--border)] text-white font-semibold flex items-center justify-center gap-2 group-hover:bg-[var(--primary)] group-hover:border-[var(--primary)] transition-all">
            {lang === 'vi' ? 'Xem Chi Tiết' : 'View Details'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}