import React from 'react';
import styles from './AboutDialog.module.css';

const CREATOR_NAME = 'Bibi'; // Tên
const START_CODING_DATE = 'một đêm không ngủ được'; // Có thể đổi thành ngày cụ thể, VD '15/09/2025'
const PERSONAL_MESSAGE = `Anh không giỏi nói mấy lời ngọt ngào, nên anh code hẳn 1 cái máy tính
để nói thay anh vậy đó. Mỗi dòng code trong này đều có ít nhất 1% là
nghĩ về em. Cảm ơn vì đã ở đây, đã đọc tới tận dòng cuối cùng này.
Yêu em nhiều 💜`;

const AboutDialog = ({ onClose }) => {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span>About BiBi-OS</span>
          <button className={styles.closeBtn} onClick={onClose}>X</button>
        </div>

        <div className={styles.body}>
          <div className={styles.logo}>💜</div>
          <p className={styles.osName}>BiBi-OS</p>
          <p className={styles.version}>Version 1.0.0 — "Nhi Edition"</p>

          <div className={styles.specsBox}>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>RAM:</span>
              <span className={styles.specValue}>999GB kỷ niệm</span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>CPU:</span>
              <span className={styles.specValue}>Trái tim @ 100% tình yêu</span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Uptime:</span>
              <span className={styles.specValue}>1 năm và vẫn đang chạy ổn định</span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Khởi tạo lúc:</span>
              <span className={styles.specValue}>{START_CODING_DATE}</span>
            </div>
          </div>

          <p className={styles.personalMessage}>{PERSONAL_MESSAGE}</p>

          <p className={styles.signature}>— {CREATOR_NAME}, người viết ra cái OS ngớ ngẩn này 💜</p>
        </div>

        <button className={styles.okBtn} onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
};

export default AboutDialog;