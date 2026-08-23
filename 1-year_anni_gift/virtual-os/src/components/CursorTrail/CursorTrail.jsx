import React, { useEffect, useRef, useState } from 'react';
import styles from './CursorTrail.module.css';

const ICONS = ['💜', '✨'];
const MIN_DISTANCE = 24; // px - chỉ sinh hạt mới khi chuột đã di chuyển đủ xa, tránh spawn dày đặc
const PARTICLE_LIFETIME_MS = 650;

const CursorTrail = () => {
  const [particles, setParticles] = useState([]);
  const idRef = useRef(0);
  const lastPosRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < MIN_DISTANCE) return; // Chuột di chuyển chưa đủ xa, bỏ qua để đỡ dày hạt

      lastPosRef.current = { x: e.clientX, y: e.clientY };

      const id = idRef.current++;
      const icon = ICONS[Math.floor(Math.random() * ICONS.length)];
      const drift = (Math.random() - 0.5) * 24; // Lệch ngang nhẹ lúc bay lên, cho tự nhiên hơn

      setParticles((prev) => [...prev, { id, x: e.clientX, y: e.clientY, icon, drift }]);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      }, PARTICLE_LIFETIME_MS);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={styles.layer} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={styles.particle}
          style={{ left: p.x, top: p.y, '--drift': `${p.drift}px` }}
        >
          {p.icon}
        </span>
      ))}
    </div>
  );
};

export default CursorTrail;