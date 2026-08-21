import React, { useState, useEffect } from 'react';
import styles from './BootScreen.module.css';
import { useSound } from '../../hooks/useSound';

// Danh sách dòng log khởi động - bro tự chỉnh nội dung/tên nếu muốn, thứ tự hiển thị từ trên xuống
const BOOT_LINES = [
  'BIBI-OS BIOS v1.0.0',
  'Copyright (C) 2025. All hearts reserved.',
  '',
  'Memory Test: 1,048,576 KB OK',
  'Detecting Drives... LOVE_DRIVE (C:) OK',
  'Initializing Heart Module......... OK',
  'Loading Emotional Drivers.......... OK',
  'Checking relationship status....... STABLE (1+ năm)',
  'Mounting GALLERY.EXE, MUSIC_PLAYER.EXE, LOVE_LETTER.TXT... OK',
  '',
  'Press any key to continue',
];

const LINE_DELAY_MS = 220; // Khoảng cách giữa mỗi dòng hiện ra
const AUTO_CONTINUE_MS = 1400; // Đợi thêm sau khi hiện hết dòng cuối rồi mới tự chuyển màn

const BootScreen = ({ onComplete }) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const { playOpen } = useSound();

  // Hiện từng dòng log theo nhịp, rồi tự động chuyển sang Login sau khi xong
  useEffect(() => {
    playOpen(); // Tiếng "bíp" khởi động, giống tiếng lên nguồn máy tính cổ điển

    const timers = BOOT_LINES.map((_, index) =>
      setTimeout(() => setVisibleCount(index + 1), index * LINE_DELAY_MS)
    );

    const totalDuration = BOOT_LINES.length * LINE_DELAY_MS + AUTO_CONTINUE_MS;
    const finishTimer = setTimeout(onComplete, totalDuration);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finishTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bấm phím hoặc click bất kỳ đều bỏ qua ngay, không bắt người dùng chờ hết animation
  // mỗi lần họ mở lại trang
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
      <div className={styles.log}>
        {BOOT_LINES.slice(0, visibleCount).map((line, index) => (
          <p key={index} className={styles.line}>
            {line}
            {index === visibleCount - 1 && index === BOOT_LINES.length - 1 && (
              <span className={styles.cursorBlink}>_</span>
            )}
          </p>
        ))}
      </div>
    </div>
  );
};

export default BootScreen;