import React, { useState, useEffect } from 'react';
import styles from './MemoryMatch.module.css';
import { useSound } from '../../hooks/useSound';

import us1 from '../../assets/images/us1.jpg';
import us2 from '../../assets/images/us2.jpg';
import us3 from '../../assets/images/us3.jpg';
import us4 from '../../assets/images/us4.jpg';
import her1 from '../../assets/images/her1.jpg';
import her2 from '../../assets/images/her2.jpg';
import her3 from '../../assets/images/her3.jpg';
import her4 from '../../assets/images/her4.jpg';

// Dùng lại đúng bộ ảnh kỷ niệm đang có trong Gallery - mỗi ảnh xuất hiện 2 lần để ghép cặp
const PHOTOS = [
  { id: 'u1', src: us1 },
  { id: 'u2', src: us2 },
  { id: 'u3', src: us3 },
  { id: 'u4', src: us4 },
  { id: 'h1', src: her1 },
  { id: 'h2', src: her2 },
  { id: 'h3', src: her3 },
  { id: 'h4', src: her4 },
];

const WIN_MESSAGE = 'Trí nhớ đỉnh vậy?? Chắc là vì mỗi khoảnh khắc với tui đều đáng nhớ hết trơn á 💜';

// Xáo bài kiểu Fisher-Yates
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildDeck = () => {
  const doubled = [...PHOTOS, ...PHOTOS].map((p, idx) => ({
    key: `${p.id}-${idx}`,
    photoId: p.id,
    src: p.src,
  }));
  return shuffle(doubled);
};

const MemoryMatch = () => {
  const [deck, setDeck] = useState(buildDeck);
  const [flipped, setFlipped] = useState([]); // Index các lá đang lật (tối đa 2)
  const [matched, setMatched] = useState(new Set()); // key các lá đã ghép đúng
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false); // Khoá click tạm khi đang so 2 lá
  const { playMatch, playWin } = useSound();

  const isWon = matched.size === deck.length;

  const handleCardClick = (index) => {
    if (isLocked || flipped.includes(index) || matched.has(deck[index].key) || flipped.length === 2) {
      return;
    }

    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setIsLocked(true);
      setMoves((m) => m + 1);
      const [a, b] = nextFlipped;

      if (deck[a].photoId === deck[b].photoId) {
        // Ghép đúng: giữ ngửa, khoá lại vào danh sách matched
        setTimeout(() => {
          setMatched((prev) => new Set(prev).add(deck[a].key).add(deck[b].key));
          setFlipped([]);
          setIsLocked(false);
          playMatch();
        }, 350);
      } else {
        // Ghép sai: cho người chơi nhìn 1 nhịp rồi úp lại
        setTimeout(() => {
          setFlipped([]);
          setIsLocked(false);
        }, 800);
      }
    }
  };

  useEffect(() => {
    if (isWon) playWin();
  }, [isWon, playWin]);

  const handleRestart = () => {
    setDeck(buildDeck());
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setIsLocked(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.statusBar}>
        <span>Lượt lật: {moves}</span>
        <span>Đã ghép: {matched.size / 2}/{PHOTOS.length}</span>
        <button className={styles.restartBtn} onClick={handleRestart}>↻ Chơi lại</button>
      </div>

      {isWon ? (
        <div className={styles.winScreen}>
          <p className={styles.winTitle}>🎉 Hoàn thành! 🎉</p>
          <p className={styles.winMessage}>{WIN_MESSAGE}</p>
          <p className={styles.winStats}>Ghép xong trong {moves} lượt lật</p>
          <button className={styles.restartBtn} onClick={handleRestart}>Chơi lại từ đầu</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {deck.map((card, index) => {
            const isFaceUp = flipped.includes(index) || matched.has(card.key);
            return (
              <button
                key={card.key}
                className={`${styles.card} ${isFaceUp ? styles.faceUp : ''}`}
                onClick={() => handleCardClick(index)}
                disabled={isFaceUp}
                aria-label="Lá bài kỷ niệm"
              >
                <div className={styles.cardInner}>
                  <div className={styles.cardBack}>💜</div>
                  <div className={styles.cardFront}>
                    <img src={card.src} alt="" className={styles.cardImg} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemoryMatch;