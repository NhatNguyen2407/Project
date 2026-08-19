import React, { useState, useEffect } from 'react';
import styles from './CountdownWidget.module.css';
import { useDraggable } from '../../hooks/useDraggable';

// Mốc bắt đầu: 14:00:00 ngày 24/10/2025 - đổi ở đây nếu cần chỉnh lại
// Lưu ý: tháng trong JS Date bắt đầu từ 0, nên tháng 10 (October) là index 9
const START_DATE = new Date(2025, 9, 24, 14, 0, 0);

// Tính khoảng cách theo đúng lịch thật (năm/tháng/ngày/giờ/phút/giây),
// không dùng phép chia trung bình (kiểu "1 tháng = 30 ngày") vì sẽ bị lệch dần theo thời gian
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
    // "Mượn" số ngày của tháng liền trước tháng hiện tại (dùng ngày 0 = ngày cuối tháng trước)
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthLastDay;
    months -= 1;
  }
  if (months < 0) { months += 12; years -= 1; }

  return { years, months, days, hours, minutes, seconds };
};

const pad2 = (n) => n.toString().padStart(2, '0');

// Vị trí ban đầu: góc dưới-trái, phía trên taskbar (ước lượng theo chiều cao cửa sổ lúc mount)
const getInitialPosition = () => ({
  x: 20,
  y: Math.max(20, window.innerHeight - 170),
});

const CountdownWidget = () => {
  const [elapsed, setElapsed] = useState(() => getElapsed(START_DATE, new Date()));
  const { position, onDragMouseDown } = useDraggable(getInitialPosition, 'countdown-widget-pos');

  useEffect(() => {
    const tick = () => setElapsed(getElapsed(START_DATE, new Date()));
    tick(); // Tính ngay lần đầu, không đợi 1s mới hiện
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