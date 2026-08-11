import React from 'react';
import Draggable from 'react-draggable';
import styles from './WindowFrame.module.css';

const WindowFrame = ({ title = 'WINDOW', children, onClose }) => {
  return (
    <Draggable handle=".window-header" bounds="parent">
      <div className={styles.windowContainer}>
        {/* Thanh Header */}
        <div className={`window-header ${styles.windowHeader}`}>
          <div className={styles.title}>{title}</div>
          <div className={styles.controls}>
            <button className={styles.controlBtn} title="Minimize">
              <span className={styles.icon}>−</span>
            </button>
            <button className={styles.controlBtn} title="Maximize">
              <span className={styles.icon}>◻</span>
            </button>
            <button className={`${styles.controlBtn} ${styles.closeBtn}`} onClick={onClose} title="Close">
              <span className={styles.icon}>✕</span>
            </button>
          </div>
        </div>

        {/* Nội dung bên trong cửa sổ */}
        <div className={styles.windowBody}>
          {children}
        </div>
      </div>
    </Draggable>
  );
};

export default WindowFrame;