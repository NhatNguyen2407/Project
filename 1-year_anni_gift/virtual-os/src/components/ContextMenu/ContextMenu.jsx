import React, { useEffect } from 'react';
import styles from './ContextMenu.module.css';

const ContextMenu = ({ x, y, onClose, onChangeWallpaper, onLock, onShutdown }) => {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      className={styles.contextMenu} 
      style={{ top: `${y}px`, left: `${x}px` }}
      onClick={(e) => e.stopPropagation()} 
      onContextMenu={(e) => e.preventDefault()} /* Ngăn click chuột phải vào menu này sinh lỗi */
    >
      <button className={styles.menuItem} onClick={() => { window.location.reload(); }}>
        <span className={styles.icon}>🔄</span>
        <span>Refresh Desktop</span>
      </button>

      <div className={styles.divider} />

      <div className={styles.menuLabel}>Change Wallpaper:</div>
      <div className={styles.themeGroup}>
        <button 
          className={`${styles.colorDot} ${styles.purple}`} 
          title="Tím Pastel" 
          onClick={() => onChangeWallpaper('purple')} 
        />
        <button 
          className={`${styles.colorDot} ${styles.pink}`} 
          title="Hồng Phấn" 
          onClick={() => onChangeWallpaper('pink')} 
        />
        <button 
          className={`${styles.colorDot} ${styles.mint}`} 
          title="Xanh Mint" 
          onClick={() => onChangeWallpaper('mint')} 
        />
      </div>

      <div className={styles.divider} />

      <button className={styles.menuItem} onClick={onLock}>
        <span className={styles.icon}>🔒</span>
        <span>Lock System</span>
      </button>

      <button className={styles.menuItem} onClick={onShutdown}>
        <span className={styles.icon}>⏻</span>
        <span>Shut Down</span>
      </button>
    </div>
  );
};

export default ContextMenu;