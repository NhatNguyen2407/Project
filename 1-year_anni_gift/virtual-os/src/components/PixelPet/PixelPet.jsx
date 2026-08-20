import React, { useEffect, useRef, useState } from 'react';
import styles from './PixelPet.module.css';
import { useSound } from '../../hooks/useSound';

const WALK_SPEED = 1.1; // px di chuyển mỗi tick
const TICK_MS = 40;
const EDGE_MARGIN = 24; // Khoảng cách né 2 bên mép màn hình
const AFFECTION_KEY = 'pet-affection';

const PixelPet = () => {
  const [x, setX] = useState(100);
  const [direction, setDirection] = useState(1); // 1 = quay phải, -1 = quay trái
  const [mode, setMode] = useState('walk'); // 'walk' | 'blink' | 'meow' | 'petted' | 'waiting' | 'eating'
  const [hasTreat, setHasTreat] = useState(false);
  const [hearts, setHearts] = useState([]); // { id, dx }
  const [affection, setAffection] = useState(() => {
    const saved = parseInt(localStorage.getItem(AFFECTION_KEY), 10);
    return Number.isFinite(saved) ? saved : 0;
  });
  const [showCounter, setShowCounter] = useState(false);

  const { playMeow, playClick, playMatch } = useSound();
  const idleTimeoutRef = useRef(null);
  const treatSpawnTimeoutRef = useRef(null);
  const treatDismissTimeoutRef = useRef(null);
  const counterTimeoutRef = useRef(null);
  const heartIdRef = useRef(0);
  const modeRef = useRef(mode); // Theo dõi mode mới nhất để dùng trong các closure setTimeout

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

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

  // Cứ sau một khoảng ngẫu nhiên thì dừng lại, hoặc nháy mắt hoặc "meo" -
  // bỏ qua nếu pet đang bận tương tác với người dùng (petted/waiting/eating)
  useEffect(() => {
    const scheduleNextIdle = () => {
      const delay = 5000 + Math.random() * 7000;
      idleTimeoutRef.current = setTimeout(() => {
        if (modeRef.current !== 'walk') {
          scheduleNextIdle();
          return;
        }
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

  // Cứ sau 15-30s thì có 1 con cá xuất hiện để cho pet ăn - pet đứng yên chờ trong lúc này
  useEffect(() => {
    const scheduleTreatSpawn = () => {
      treatSpawnTimeoutRef.current = setTimeout(() => {
        if (modeRef.current !== 'walk') {
          scheduleTreatSpawn(); // Đang bận việc khác thì thử lại sau, không chồng lấn
          return;
        }
        setMode('waiting');
        setHasTreat(true);
        treatDismissTimeoutRef.current = setTimeout(() => {
          setHasTreat(false);
          setMode('walk');
          scheduleTreatSpawn();
        }, 7000); // Không bấm trong 7s thì cá tự biến mất, pet đi tiếp
      }, 15000 + Math.random() * 15000);
    };
    scheduleTreatSpawn();
    return () => {
      clearTimeout(treatSpawnTimeoutRef.current);
      clearTimeout(treatDismissTimeoutRef.current);
    };
  }, []);

  const gainAffection = (amount) => {
    setAffection((prev) => {
      const next = prev + amount;
      try {
        localStorage.setItem(AFFECTION_KEY, String(next));
      } catch (e) {
        // Bỏ qua nếu localStorage bị chặn/đầy
      }
      return next;
    });
    setShowCounter(true);
    clearTimeout(counterTimeoutRef.current);
    counterTimeoutRef.current = setTimeout(() => setShowCounter(false), 1600);
  };

  const spawnHearts = (count) => {
    const newHearts = Array.from({ length: count }).map(() => ({
      id: heartIdRef.current++,
      dx: (Math.random() - 0.5) * 34,
    }));
    setHearts((prev) => [...prev, ...newHearts]);
    newHearts.forEach((h) => {
      setTimeout(() => {
        setHearts((prev) => prev.filter((item) => item.id !== h.id));
      }, 900);
    });
  };

  // Vuốt ve: click trực tiếp vào pet lúc đang đi bộ hoặc đứng chờ
  const handlePet = () => {
    if (mode === 'eating' || mode === 'petted') return;
    playClick();
    playMeow();
    spawnHearts(2);
    gainAffection(1);
    if (mode === 'walk') {
      setMode('petted');
      setTimeout(() => setMode('walk'), 800);
    }
  };

  // Cho ăn: click vào con cá xuất hiện cạnh pet
  const handleFeed = (e) => {
    e.stopPropagation(); // Không cho sự kiện lan ra pet (tránh trigger luôn cả handlePet)
    clearTimeout(treatDismissTimeoutRef.current);
    setHasTreat(false);
    playMatch();
    spawnHearts(4);
    gainAffection(5);
    setMode('eating');
    setTimeout(() => setMode('walk'), 1000);
  };

  return (
    <div className={styles.petWrapper} style={{ left: `${x}px` }}>
      {mode === 'meow' && <div className={styles.speechBubble}>meo~</div>}

      {showCounter && (
        <div className={styles.affectionCounter}>💜 x{affection}</div>
      )}

      {hearts.map((h) => (
        <span key={h.id} className={styles.heartParticle} style={{ '--dx': `${h.dx}px` }}>
          💜
        </span>
      ))}

      {hasTreat && (
        <button className={styles.treat} onClick={handleFeed} title="Cho ăn" aria-label="Cho pet ăn">
          🐟
        </button>
      )}

      <div
        className={`${styles.cat} ${mode === 'walk' ? styles.walking : ''} ${mode === 'petted' ? styles.petted : ''} ${mode === 'eating' ? styles.eating : ''}`}
        style={{ transform: `scaleX(${direction})`, '--dir': direction }}
        onClick={handlePet}
        role="button"
        aria-label="Vuốt ve pet"
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