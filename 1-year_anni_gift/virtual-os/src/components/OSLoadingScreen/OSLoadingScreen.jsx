import React, { useState, useEffect } from 'react';
import styles from './OSLoadingScreen.module.css';
import PixelProgressBar from '../PixelProgressBar/PixelProgressBar';

const LOAD_DURATION_MS = 1800;
const STEP_MS = 40;
const HOLD_AFTER_FULL_MS = 300; 

const OSLoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalSteps = LOAD_DURATION_MS / STEP_MS;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const pct = Math.min(100, (step / totalSteps) * 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, HOLD_AFTER_FULL_MS);
      }
    }, STEP_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const skip = () => onComplete();
    window.addEventListener('keydown', skip);
    window.addEventListener('click', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('click', skip);
    };
  }, [onComplete]);

  return (
    <div className={styles.screen}>
      <div className={styles.logo}>💜</div>
      <p className={styles.title}>BiBi-OS</p>
      <div className={styles.progressWrap}>
        <PixelProgressBar progress={progress} segments={16} />
      </div>
      <p className={styles.caption}>Đang khởi động...</p>
    </div>
  );
};

export default OSLoadingScreen;