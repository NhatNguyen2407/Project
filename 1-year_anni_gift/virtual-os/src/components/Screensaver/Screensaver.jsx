import React, { useState, useEffect, useRef } from 'react';
import styles from './Screensaver.module.css';

const IDLE_TIMEOUT_MS = 90 * 1000; // Không thao tác 90s thì tự bật screensaver
const SPEED = 2.2; // px mỗi frame
const LOGO_SIZE = 48;
const COLORS = ['#f48fb1', '#ce93d8', '#b39ddb', '#81d4fa', '#ffd54f', '#a5d6a7'];

const Screensaver = () => {
  const [isActive, setIsActive] = useState(false);
  const [pos, setPos] = useState({ x: 100, y: 100 });
  const [color, setColor] = useState(COLORS[0]);

  const idleTimerRef = useRef(null);
  const animFrameRef = useRef(null);
  const motionRef = useRef({ x: 100, y: 100, vx: SPEED, vy: SPEED });

  // Theo dõi hoạt động chuột/bàn phím để bật/tắt screensaver
  useEffect(() => {
    const resetIdleTimer = () => {
      setIsActive((wasActive) => (wasActive ? false : wasActive));
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => setIsActive(true), IDLE_TIMEOUT_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, resetIdleTimer));
    resetIdleTimer(); // Khởi động bộ đếm ngay khi component mount

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetIdleTimer));
      clearTimeout(idleTimerRef.current);
    };
  }, []);

  // Animation "bay nảy" kiểu DVD logo cổ điển, chỉ chạy khi đang active
  useEffect(() => {
    if (!isActive) return;

    // Vị trí + hướng bay ngẫu nhiên mỗi lần screensaver bật lên
    motionRef.current = {
      x: Math.random() * (window.innerWidth - LOGO_SIZE),
      y: Math.random() * (window.innerHeight - LOGO_SIZE),
      vx: SPEED * (Math.random() < 0.5 ? 1 : -1),
      vy: SPEED * (Math.random() < 0.5 ? 1 : -1),
    };

    const tick = () => {
      const m = motionRef.current;
      let { x, y, vx, vy } = m;
      x += vx;
      y += vy;

      const maxX = window.innerWidth - LOGO_SIZE;
      const maxY = window.innerHeight - LOGO_SIZE;
      let bounced = false;

      if (x <= 0 || x >= maxX) {
        vx = -vx;
        x = Math.max(0, Math.min(x, maxX));
        bounced = true;
      }
      if (y <= 0 || y >= maxY) {
        vy = -vy;
        y = Math.max(0, Math.min(y, maxY));
        bounced = true;
      }

      motionRef.current = { x, y, vx, vy };
      setPos({ x, y });
      if (bounced) {
        setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className={styles.overlay}>
      <div
        className={styles.heart}
        style={{ left: `${pos.x}px`, top: `${pos.y}px`, color }}
      >
        💜
      </div>
      <p className={styles.hint}>Di chuột hoặc bấm phím bất kỳ để quay lại</p>
    </div>
  );
};

export default Screensaver;