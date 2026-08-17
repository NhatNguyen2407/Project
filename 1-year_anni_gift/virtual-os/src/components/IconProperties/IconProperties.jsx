import React from 'react';
import styles from './IconProperties.module.css';

const IconProperties = ({ iconSrc, label, fileType, onClose }) => {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span>Properties</span>
          <button className={styles.closeBtn} onClick={onClose}>X</button>
        </div>

        <div className={styles.body}>
          <img src={iconSrc} alt={label} className={styles.previewIcon} />

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Tên:</span>
              <span className={styles.fieldValue}>{label}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Loại:</span>
              <span className={styles.fieldValue}>{fileType}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Ngày tạo:</span>
              <span className={styles.fieldValue}>24/10/2025</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Kích thước:</span>
              <span className={styles.fieldValue}>Không đo được - tình cảm là vô giá 💜</span>
            </div>
          </div>
        </div>

        <button className={styles.okBtn} onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default IconProperties;