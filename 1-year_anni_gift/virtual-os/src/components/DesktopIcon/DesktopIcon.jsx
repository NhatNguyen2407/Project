import React from 'react';
import styles from './DesktopIcon.module.css';

const DesktopIcon = ({ iconSrc, label, onDoubleClick }) => {
  return (
    <div className={styles.iconContainer} onDoubleClick={onDoubleClick}>
      <div className={styles.imageWrapper}>
        <img src={iconSrc} alt={label} className={styles.iconImage} />
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  );
};

export default DesktopIcon;