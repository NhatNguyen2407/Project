import React from 'react';
import styles from './PixelProgressBar.module.css';

// Thanh tiến trình kiểu pixel: chia thành N khối vuông rời rạc, khối nào "tới lượt" thì tô đầy,
// thay vì 1 thanh liền mạch mượt như progress bar thông thường.
const PixelProgressBar = ({ progress = 0, segments = 12 }) => {
  const clamped = Math.min(100, Math.max(0, progress));
  const filledCount = Math.round((clamped / 100) * segments);

  return (
    <div className={styles.track} role="progressbar" aria-valuenow={Math.round(clamped)} aria-valuemin={0} aria-valuemax={100}>
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={`${styles.block} ${i < filledCount ? styles.filled : ''}`}
        />
      ))}
    </div>
  );
};

export default PixelProgressBar;