import React from 'react';
import styles from './StartMenu.module.css';

const StartMenu = ({ APPS, onOpenApp, onLock }) => {
  return (
    <div className={styles.startMenu}>
      {/* Phần Header của Menu */}
      <div className={styles.header}>
        <div className={styles.avatar}>💜</div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>Bibi</div>
          <div className={styles.userStatus}>Administrator</div>
        </div>
      </div>

      {/* Danh sách Ứng dụng */}
      <div className={styles.body}>
        <div className={styles.sectionTitle}>Pinned Apps</div>
        <div className={styles.appList}>
          {APPS.map(app => (
            <button 
              key={app.id} 
              className={styles.appItem} 
              onClick={() => onOpenApp(app.id)}
            >
              <img src={app.icon} alt={app.title} className={styles.appIcon} />
              <span className={styles.appTitle}>{app.title.split('.')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Phần Footer (Nút Nguồn) */}
      <div className={styles.footer}>
        <button className={styles.powerBtn} onClick={onLock} title="Lock OS">
          <span className={styles.powerIcon}>⏻</span> 
          <span>Lock</span>
        </button>
      </div>
    </div>
  );
};

export default StartMenu;