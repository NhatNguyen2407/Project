import React, { useState, useEffect, useRef } from 'react';
import styles from './StickyNote.module.css';
import { useDraggable } from '../../hooks/useDraggable';

// Kho câu ngọt ngào - bro có thể tự thêm/sửa câu tuỳ ý, mỗi lần load lại trang sẽ random 1 câu
const QUOTES = [
  'Hôm nay cũng yêu em nhiều như hôm qua vậy đó 💜',
  'Cảm ơn vì đã đồng ý đi cùng tui suốt 1 năm qua nha.',
  'Mỗi ngày có em là một ngày đáng để mong chờ.',
  'Em là lý do tui cười ngu ngơ một mình giữa đường.',
  'Chúc mừng 1 năm của tụi mình, còn dài lắm đó nha!',
  'Nhớ em nhiều, dù mới nhắn tin lúc nãy thôi.',
  'Có em rồi, mấy ngày mệt cũng thấy nhẹ hẳn.',
  'あなたは私の世界です. Em luôn là thế giới của tui.',
  'Đi chậm lại chút cũng được, miễn là đi cùng em.',
  'Nắm tay tui đi, mình còn nhiều chặng đường phải đi nữa.',
];

// Vị trí ban đầu: góc trên-phải màn hình (ước lượng theo chiều rộng cửa sổ lúc mount)
const getInitialPosition = () => ({
  x: Math.max(20, window.innerWidth - 220),
  y: 24,
});

const StickyNote = () => {
  // Chọn 1 câu ngẫu nhiên mỗi lần component mount (tức mỗi lần load/reload trang)
  const quoteRef = useRef(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [isVisible, setIsVisible] = useState(true);
  const [isPeeking, setIsPeeking] = useState(false);
  const { position, onDragMouseDown, justDraggedRef } = useDraggable(getInitialPosition, 'sticky-note-pos');

  return (
    <div
      className={`${styles.wrapper} ${!isVisible ? styles.hidden : ''}`}
      style={{ left: position.x, top: position.y }}
    >
      <div
        className={`${styles.note} ${isPeeking ? styles.peek : ''}`}
        onMouseDown={onDragMouseDown}
        onMouseEnter={() => setIsPeeking(true)}
        onMouseLeave={() => setIsPeeking(false)}
      >
        <button
          className={styles.closeBtn}
          onMouseDown={(e) => e.stopPropagation()} // Không cho khởi động kéo khi bấm nút đóng
          onClick={() => { if (!justDraggedRef.current) setIsVisible(false); }}
          aria-label="Đóng sticky note"
          title="Đóng"
        >
          ×
        </button>
        <div className={styles.pin}></div>
        <p className={styles.quoteText}>{quoteRef.current}</p>
      </div>
    </div>
  );
};

export default StickyNote;