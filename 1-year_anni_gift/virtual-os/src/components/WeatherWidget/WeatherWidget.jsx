import React, { useState, useEffect, useRef } from 'react';
import styles from './WeatherWidget.module.css';
import { useDraggable } from '../../hooks/useDraggable';

// Kho "bản tin thời tiết" - random 1 cái mỗi lần load trang, bro tự thêm/sửa tuỳ ý
const WEATHER_REPORTS = [
  { icon: '☀️', condition: 'Nắng đẹp, có mây hình trái tim', lovePercent: 100 },
  { icon: '🌈', condition: 'Sau cơn giận dỗi là cầu vồng làm hoà', lovePercent: 98 },
  { icon: '💜', condition: 'Trời trong, gió nhẹ, rất hợp đi chơi với người yêu', lovePercent: 100 },
  { icon: '🌦️', condition: 'Có chút mưa nhỏ nhưng vẫn ấm vì có em ở đây', lovePercent: 95 },
  { icon: '✨', condition: 'Trời đầy sao, giống y hệt mắt em lúc cười', lovePercent: 100 },
  { icon: '🌸', condition: 'Gió mang theo mùi hoa, hôm nay yêu đời ghê', lovePercent: 99 },
];

const getInitialPosition = () => ({
  x: Math.max(20, window.innerWidth / 2 - 90),
  y: 24,
});

const formatTime = (date) =>
  `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

const WeatherWidget = () => {
  // Chọn 1 bản tin ngẫu nhiên mỗi lần component mount (mỗi lần load/reload trang)
  const reportRef = useRef(WEATHER_REPORTS[Math.floor(Math.random() * WEATHER_REPORTS.length)]);
  const [updatedAt, setUpdatedAt] = useState(new Date());
  const { position, onDragMouseDown } = useDraggable(getInitialPosition, 'weather-widget-pos');

  // "Cập nhật lúc" tự tăng mỗi phút cho có cảm giác thật, dù nội dung dự báo không đổi
  useEffect(() => {
    const interval = setInterval(() => setUpdatedAt(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const report = reportRef.current;

  return (
    <div
      className={styles.widget}
      style={{ left: position.x, top: position.y }}
      onMouseDown={onDragMouseDown}
    >
      <p className={styles.header}>Thời tiết hôm nay</p>
      <div className={styles.mainRow}>
        <span className={styles.icon}>{report.icon}</span>
        <span className={styles.temp}>36.5°C</span>
      </div>
      <p className={styles.condition}>{report.condition}</p>
      <p className={styles.lovePercent}>{report.lovePercent}% khả năng được yêu hôm nay</p>
      <p className={styles.updated}>Cập nhật lúc {formatTime(updatedAt)}</p>
    </div>
  );
};

export default WeatherWidget;