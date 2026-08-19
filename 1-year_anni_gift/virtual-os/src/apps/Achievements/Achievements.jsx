import React from 'react';
import styles from './Achievements.module.css';
import { useAchievements } from '../../context/AchievementsContext';
import { ACHIEVEMENTS } from '../../constants/achievement';

const Achievements = () => {
  const { isUnlocked, unlockedCount, totalCount } = useAchievements();
  const entries = Object.entries(ACHIEVEMENTS);
  const percent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.statusBar}>
        <span>🏆 Đã mở khoá: {unlockedCount}/{totalCount}</span>
        <span>{percent}%</span>
      </div>

      <div className={styles.list}>
        {entries.map(([id, meta]) => {
          const unlocked = isUnlocked(id);
          return (
            <div key={id} className={`${styles.card} ${unlocked ? styles.unlocked : styles.locked}`}>
              <span className={styles.icon}>{unlocked ? meta.icon : '❓'}</span>
              <div className={styles.textGroup}>
                <p className={styles.title}>{unlocked ? meta.title : '???'}</p>
                <p className={styles.description}>
                  {unlocked ? meta.description : 'Khám phá thêm để mở khoá điều bí mật này...'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;