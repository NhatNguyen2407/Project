import React, { useEffect, useRef } from 'react';
import styles from './AchievementToast.module.css';
import { useAchievements } from '../../context/AchievementsContext';
import { useSound } from '../../hooks/useSound';

const DISPLAY_DURATION_MS = 3500;

const AchievementToast = () => {
  const { toasts, dismissCurrentToast } = useAchievements();
  const { playAchievement } = useSound();
  const current = toasts[0] || null;
  const lastPlayedIdRef = useRef(null);

  useEffect(() => {
    if (!current) return;

    if (lastPlayedIdRef.current !== current.toastId) {
      playAchievement();
      lastPlayedIdRef.current = current.toastId;
    }

    const timer = setTimeout(dismissCurrentToast, DISPLAY_DURATION_MS);
    return () => clearTimeout(timer);
  }, [current, dismissCurrentToast, playAchievement]);

  if (!current) return null;

  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div key={current.toastId} className={styles.popup}>
        <p className={styles.header}>🏆 ACHIEVEMENT UNLOCKED</p>
        <div className={styles.body}>
          <span className={styles.icon}>{current.icon || '🏆'}</span>
          <div className={styles.textGroup}>
            <p className={styles.title}>{current.title}</p>
            <p className={styles.description}>{current.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementToast;