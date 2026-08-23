import React, { useState } from 'react';
import styles from './StartMenu.module.css';
import AboutDialog from '../AboutDialog/AboutDialog';

const StartMenu = ({ APPS, onOpenApp, onLock }) => {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className={styles.startMenu}>
      {/*Header của Menu*/}
      <button className={styles.header} onClick={() => setShowAbout(true)} title="About BiBi-OS">
        <div className={styles.avatar}>💜</div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>Bibi</div>
          <div className={styles.userStatus}>Administrator</div>
        </div>
      </button>

      {/* Ứng dụng */}
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

      {/* Nút Nguồn + About */}
      <div className={styles.footer}>
        <button className={styles.aboutBtn} onClick={() => setShowAbout(true)} title="About BiBi-OS">
          <span>ℹ️</span>
          <span>About</span>
        </button>
        <button className={styles.powerBtn} onClick={onLock} title="Lock OS">
          <span className={styles.powerIcon}>⏻</span> 
          <span>Lock</span>
        </button>
      </div>

      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
    </div>
  );
};

export default StartMenu;