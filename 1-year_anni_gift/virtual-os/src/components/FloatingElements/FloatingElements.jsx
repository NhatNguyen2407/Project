import React, { useMemo } from 'react';
import styles from './FloatingElements.module.css';
import { useSpecialDay } from '../../hooks/useSpecialDay';

// 3 icon pixel nhỏ vẽ bằng SVG rect (không cần file ảnh), dùng currentColor để dễ đổi màu qua CSS
const PixelHeart = () => (
  <svg viewBox="0 0 16 14" width="100%" height="100%" shapeRendering="crispEdges">
    <g fill="currentColor">
      <rect x="2" y="0" width="4" height="2" />
      <rect x="10" y="0" width="4" height="2" />
      <rect x="0" y="2" width="14" height="2" />
      <rect x="0" y="4" width="16" height="2" />
      <rect x="0" y="6" width="16" height="2" />
      <rect x="2" y="8" width="12" height="2" />
      <rect x="4" y="10" width="8" height="2" />
      <rect x="6" y="12" width="4" height="2" />
    </g>
  </svg>
);

const PixelSparkle = () => (
  <svg viewBox="0 0 10 14" width="100%" height="100%" shapeRendering="crispEdges">
    <g fill="currentColor">
      <rect x="4" y="0" width="2" height="2" />
      <rect x="4" y="2" width="2" height="2" />
      <rect x="0" y="4" width="2" height="2" />
      <rect x="4" y="4" width="2" height="2" />
      <rect x="8" y="4" width="2" height="2" />
      <rect x="2" y="6" width="6" height="2" />
      <rect x="0" y="8" width="2" height="2" />
      <rect x="4" y="8" width="2" height="2" />
      <rect x="8" y="8" width="2" height="2" />
      <rect x="4" y="10" width="2" height="2" />
      <rect x="4" y="12" width="2" height="2" />
    </g>
  </svg>
);

const PixelNote = () => (
  <svg viewBox="0 0 12 16" width="100%" height="100%" shapeRendering="crispEdges">
    <g fill="currentColor">
      <rect x="8" y="0" width="2" height="2" />
      <rect x="8" y="2" width="2" height="2" />
      <rect x="8" y="4" width="2" height="2" />
      <rect x="8" y="6" width="2" height="2" />
      <rect x="4" y="8" width="6" height="2" />
      <rect x="2" y="10" width="10" height="2" />
      <rect x="0" y="12" width="12" height="2" />
      <rect x="2" y="14" width="8" height="2" />
    </g>
  </svg>
);

const ICONS = [PixelHeart, PixelSparkle, PixelNote];
const COLORS = ['#f48fb1', '#ce93d8', '#b39ddb', '#f8bbd0', '#ffd54f'];

// Chỉ vài element nho nhỏ trôi nền, không phải cả background động - giữ số lượng thấp cho nhẹ mắt
const ELEMENT_COUNT = 7;
const MIN_DURATION = 20; // giây
const MAX_DURATION = 34;

const FloatingElements = () => {
  const specialDay = useSpecialDay();
  // Ngày đặc biệt: tăng gấp ~2.5 lần số lượng cho desktop trông "sống động" hẳn khác ngày thường
  const elementCount = specialDay ? ELEMENT_COUNT * 2.5 : ELEMENT_COUNT;

  // Random hoá 1 lần duy nhất lúc mount, giữ nguyên trong suốt vòng đời component
  const elements = useMemo(() => {
    return Array.from({ length: Math.round(elementCount) }).map((_, i) => {
      const duration = MIN_DURATION + Math.random() * (MAX_DURATION - MIN_DURATION);
      return {
        id: i,
        Icon: ICONS[Math.floor(Math.random() * ICONS.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        left: 4 + Math.random() * 92, // % ngang, né sát 2 mép
        size: 12 + Math.random() * 10, // px
        duration,
        delay: -Math.random() * duration, // Số âm: bắt đầu ngay giữa chu kỳ, tránh mọi icon xuất hiện đồng loạt lúc load
        driftX: (Math.random() - 0.5) * 60, // Lệch ngang nhẹ trong lúc bay lên, -30px đến 30px
        opacity: 0.15 + Math.random() * 0.2, // Mờ nhẹ, chỉ là điểm nhấn nền chứ không nổi bật
      };
    });
  }, [elementCount]);

  return (
    <div className={styles.wrapper} aria-hidden="true">
      {elements.map(({ id, Icon, color, left, size, duration, delay, driftX, opacity }) => (
        <div
          key={id}
          className={styles.floatItem}
          style={{
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            color,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            '--drift-x': `${driftX}px`,
            '--peak-opacity': opacity,
          }}
        >
          <Icon />
        </div>
      ))}
    </div>
  );
};

export default FloatingElements;