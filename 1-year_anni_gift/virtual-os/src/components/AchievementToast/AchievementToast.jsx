import React, { useEffect, useRef } from 'react';
import styles from '../../apps/Achievements/Achievements.module.css';
import { useAchievements } from '../../context/AchievementsContext';
import { useSound } from '../../hooks/useSound';

const AchievementToast = () => {
  const { toasts } = useAchievements();
  const { playAchievement } = useSound();
  const prevCountRef = useRef(0);

  // Phát tiếng "ting~" mỗi khi có toast
  useEffect(() => {
    if (toasts.length > prevCountRef.current) {
      playAchievement();
    }
    prevCountRef.current = toasts.length;
  }, [toasts.length, playAchievement]);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.wrapper} aria-hidden="true">
      {toasts.map((t) => (
        <div key={t.toastId} className={styles.toast}>
          <span className={styles.trophy}>{t.icon || '🏆'}</span>
          <div>
            <p className={styles.unlockLabel}>Đã mở khoá thành tích</p>
            <p className={styles.title}>{t.title}</p>
            <p className={styles.description}>{t.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AchievementToast;