import React, { useEffect, useRef, useState } from 'react';
import styles from './PixelPet.module.css';
import { useSound } from '../../hooks/useSound';

const WALK_SPEED = 1.1; // px di chuyển mỗi tick
const TICK_MS = 40;
const EDGE_MARGIN = 24; // Khoảng cách né 2 bên mép màn hình

const PixelPet = () => {
  const [x, setX] = useState(100);
  const [direction, setDirection] = useState(1); // 1 = quay phải, -1 = quay trái
  const [mode, setMode] = useState('walk'); // 'walk' | 'blink' | 'meow'
  const { playMeow } = useSound();
  const idleTimeoutRef = useRef(null);

  // Di chuyển liên tục khi đang ở chế độ đi bộ
  useEffect(() => {
    if (mode !== 'walk') return;
    const interval = setInterval(() => {
      setX((prevX) => {
        const maxX = window.innerWidth - EDGE_MARGIN - 40;
        let next = prevX + direction * WALK_SPEED;
        if (next >= maxX) {
          next = maxX;
          setDirection(-1);
        } else if (next <= EDGE_MARGIN) {
          next = EDGE_MARGIN;
          setDirection(1);
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [mode, direction]);

  // Cứ sau một khoảng ngẫu nhiên thì dừng lại, hoặc nháy mắt hoặc "meo"
  useEffect(() => {
    const scheduleNextIdle = () => {
      const delay = 5000 + Math.random() * 7000; // Đi bộ 5-12s rồi nghỉ 1 lần
      idleTimeoutRef.current = setTimeout(() => {
        const willMeow = Math.random() < 0.4;
        if (willMeow) {
          setMode('meow');
          playMeow();
          setTimeout(() => {
            setMode('walk');
            scheduleNextIdle();
          }, 1800);
        } else {
          setMode('blink');
          setTimeout(() => {
            setMode('walk');
            scheduleNextIdle();
          }, 450);
        }
      }, delay);
    };
    scheduleNextIdle();
    return () => clearTimeout(idleTimeoutRef.current);
  }, [playMeow]);

  return (
    <div className={styles.petWrapper} style={{ left: `${x}px` }} aria-hidden="true">
      {mode === 'meow' && <div className={styles.speechBubble}>meo~</div>}
      <div
        className={`${styles.cat} ${mode === 'walk' ? styles.walking : ''}`}
        style={{ transform: `scaleX(${direction})` }}
      >
        <div className={styles.ear} data-ear="1"></div>
        <div className={styles.ear} data-ear="2"></div>
        <div className={styles.head}>
          <div className={`${styles.eye} ${mode === 'blink' ? styles.blinking : ''}`} data-eye="1"></div>
          <div className={`${styles.eye} ${mode === 'blink' ? styles.blinking : ''}`} data-eye="2"></div>
        </div>
        <div className={styles.body}></div>
        <div className={styles.tail}></div>
        <div className={styles.legFront}></div>
        <div className={styles.legBack}></div>
      </div>
    </div>
  );
};

export default PixelPet;