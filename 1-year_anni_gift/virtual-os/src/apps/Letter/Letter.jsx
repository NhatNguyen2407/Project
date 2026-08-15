import React, { useState, useEffect } from 'react';
import styles from './Letter.module.css';
import { useSound } from '../../hooks/useSound';

const Letter = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const { playType } = useSound();

  // Nội dung bức thư gốc 
  const fullText = `Gửi NhiNhi,

Mới ngày nào vẫn còn ngồi ở trên lớp GC mà giờ mìn đã đi cùng nhau được 1 năm rồi cơ đấy. Thời gian qua thật sự rất vui và ý nghĩa khi được học và trải nghiệm nhiều thứ mới cùng em.

Tui có vài điều mún nhắc nhở nè:
- Cái đồ ngủ muộn kìa, khôm dậy sớm chơi ví tui kìa. Hứ!
- Tui muốn cậu phải tự tin hơn, phải vui hơn nữa, khôm đượt tự ti vì đó là việc của tui!
- Tui cũn biết tự ái đấy nhá. Nên là đừn nói gì đó sát thương chuẩn quá nhá. 
- あなたは私の世界です。(∀｀*ゞ)ｴﾍﾍ

Hai đứa mìn sẽ cùng đi lâu hơn nữa nhe,
Đến lúc cưới xong ở ví nhau lun nhe!

Yêu em,
Bibii 💜`;

  useEffect(() => {
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        const nextChar = fullText[currentIndex];
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        // Chỉ phát tiếng "tạch" cho ký tự thật, bỏ qua khoảng trắng/xuống dòng cho đỡ ồn
        if (nextChar.trim() !== '') {
          playType();
        }
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 50); // Tốc độ gõ: 50ms/chữ

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.notepad}>
        <span className={styles.text}>{displayedText}</span>
        <span className={`${styles.cursor} ${!isTyping ? styles.blink : ''}`}>|</span>
      </div>
    </div>
  );
};

export default Letter;