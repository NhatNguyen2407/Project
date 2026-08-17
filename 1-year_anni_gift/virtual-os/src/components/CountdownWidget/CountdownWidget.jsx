import React, { useState, useEffect } from 'react';
import styles from './CountdownWidget.module.css';
import { useDraggable } from '../../hooks/useDraggable';

const START_DATE = new Date(2025, 9, 24, 14, 0, 0);

const getElapsed = (start, now) => {
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();

  if (seconds < 0) { seconds += 60; minutes -= 1; }
  if (minutes < 0) { minutes += 60; hours -= 1; }
  if (hours < 0) { hours += 24; days -= 1; }
  if (days < 0) {
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthLastDay;
    months -= 1;
  }
  if (months < 0) { months += 12; years -= 1; }

  return { years, months, days, hours, minutes, seconds };
};

const pad2 = (n) => n.toString().padStart(2, '0');

// Vị trí ban đầu
const getInitialPosition = () => ({
  x: 20,
  y: Math.max(20, window.innerHeight - 170),
});

const CountdownWidget = () => {
  const [elapsed, setElapsed] = useState(() => getElapsed(START_DATE, new Date()));
  const { position, onDragMouseDown } = useDraggable(getInitialPosition);

  useEffect(() => {
    const tick = () => setElapsed(getElapsed(START_DATE, new Date()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const { years, months, days, hours, minutes, seconds } = elapsed;

  return (
    <div
      className={styles.widget}
      style={{ left: position.x, top: position.y }}
      onMouseDown={onDragMouseDown}
    >
      <p className={styles.label}>💜 Bên nhau được</p>
      <p className={styles.mainLine}>
        {years} năm {months} tháng {days} ngày
      </p>
      <p className={styles.timeLine}>
        {pad2(hours)}<span className={styles.blink}>:</span>{pad2(minutes)}<span className={styles.blink}>:</span>{pad2(seconds)}
      </p>
    </div>
  );
};

export default CountdownWidget;