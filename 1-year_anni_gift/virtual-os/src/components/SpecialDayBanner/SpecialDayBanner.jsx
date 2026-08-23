import React, { useState, useEffect, useMemo } from 'react';
import styles from './SpecialDayBanner.module.css';
import { useSpecialDay } from '../../hooks/useSpecialDay';

const CONFETTI_COUNT = 40;
const COLORS = ['#f48fb1', '#ce93d8', '#b39ddb', '#ffd54f', '#81d4fa', '#a5d6a7'];
const BANNER_VISIBLE_MS = 8000; // Banner tự ẩn sau 8s, nhưng confetti vẫn tiếp tục suốt cả ngày

const SpecialDayBanner = () => {
  const specialDay = useSpecialDay();
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    if (!specialDay) return;
    const timer = setTimeout(() => setShowBanner(false), BANNER_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [specialDay]);

  // Random hoá thuộc tính từng mảnh confetti 1 lần duy nhất (khi biết hôm nay là ngày đặc biệt)
  const confettiPieces = useMemo(() => {
    if (!specialDay) return [];
    return Array.from({ length: CONFETTI_COUNT }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3.5 + Math.random() * 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 6,
    }));
  }, [specialDay]);

  if (!specialDay) return null; // Ngày thường: không render gì cả, không ảnh hưởng hiệu năng

  return (
    <>
      <div className={styles.confettiLayer} aria-hidden="true">
        {confettiPieces.map((c) => (
          <span
            key={c.id}
            className={styles.confettiPiece}
            style={{
              left: `${c.left}%`,
              backgroundColor: c.color,
              width: `${c.size}px`,
              height: `${c.size}px`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
            }}
          />
        ))}
      </div>

      {showBanner && (
        <div className={styles.banner}>
          {specialDay.message}
        </div>
      )}
    </>
  );
};

export default SpecialDayBanner;