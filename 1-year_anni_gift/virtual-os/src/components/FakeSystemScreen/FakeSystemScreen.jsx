import React, { useEffect, useState } from 'react';
import styles from './FakeSystemScreen.module.css';

// variant: 'shutdown' | 'bsod'
const FakeSystemScreen = ({ variant, onDismiss }) => {
  // Delay nhỏ để hiện dòng "chú thích cách thoát" sau khi màn hình đã kịp gây bất ngờ trước đã
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const hintTimer = setTimeout(() => setShowHint(true), variant === 'shutdown' ? 1800 : 2500);

    const handleKeyDown = () => onDismiss();
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(hintTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [variant, onDismiss]);

  if (variant === 'bsod') {
    return (
      <div className={styles.bsodScreen} onClick={onDismiss}>
        <div className={styles.bsodFace}>:(</div>
        <p className={styles.bsodMainText}>
          Hệ thống gặp một chút trục trặc... nhưng mà không sao,
          vì có em ở đây rồi thì lỗi gì cũng thành chuyện nhỏ hết. 💙
        </p>
        <p className={styles.bsodSubText}>
          Đùa vậy thôi chứ tụi mình chưa bao giờ là "lỗi hệ thống" cả -
          1 năm qua là bản build ổn định nhất tui từng chạy.
        </p>
        <p className={styles.bsodProgress}>0% dữ liệu tình cảm bị mất trong sự cố này.</p>
        {showHint && (
          <p className={styles.bsodHint}>Bấm phím bất kỳ hoặc click để quay lại nha~</p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.shutdownScreen} onClick={onDismiss}>
      <p className={styles.shutdownText}>It's now safe to close this tab 💜</p>
      {showHint && (
        <p className={styles.shutdownHint}>(bấm phím bất kỳ hoặc click để quay lại desktop)</p>
      )}
    </div>
  );
};

export default FakeSystemScreen;