import React, { useEffect, useRef } from 'react';
import styles from './IconContextMenu.module.css';

const IconContextMenu = ({ x, y, onClose, onOpen, onRename, onProperties }) => {
  const menuRef = useRef(null);

  // Click ra ngoài menu thì tự đóng lại
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button className={styles.menuItem} onClick={onOpen}>
        <span className={styles.icon}>📂</span>
        <span>Open</span>
      </button>
      <button className={styles.menuItem} onClick={onRename}>
        <span className={styles.icon}>✏️</span>
        <span>Rename</span>
      </button>
      <div className={styles.divider} />
      <button className={styles.menuItem} onClick={onProperties}>
        <span className={styles.icon}>ℹ️</span>
        <span>Properties</span>
      </button>
    </div>
  );
};

export default IconContextMenu;