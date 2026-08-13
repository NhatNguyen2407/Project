import React from 'react';
import styles from './CRTOverlay.module.css';

// Lớp phủ hiệu ứng màn hình CRT retro: scanline ngang + flicker nhẹ + vignette tối 4 góc.
// Đặt component này ở tầng trên cùng, pointerEvents 'none' để không chặn click chuột.
const CRTOverlay = () => {
  return (
    <div className={styles.crtWrapper} aria-hidden="true">
      <div className={styles.scanlines}></div>
      <div className={styles.vignette}></div>
      <div className={styles.flicker}></div>
    </div>
  );
};

export default CRTOverlay;