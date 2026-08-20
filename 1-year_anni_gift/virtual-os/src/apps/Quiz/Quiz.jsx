import React, { useState } from 'react';
import styles from './Quiz.module.css';
import PixelProgressBar from '../../components/PixelProgressBar/PixelProgressBar';
import { useSound } from '../../hooks/useSound';

// CÂU HỎI
// Cấu trúc:
//   id             : số duy nhất, không trùng câu khác
//   question       : nội dung câu hỏi
//   options        : mảng 4 đáp án (chuỗi text)
//   correctIndex   : vị trí (0-3) của đáp án đúng trong mảng options
//   feedbackCorrect: câu nói khi chọn đúng
//   feedbackWrong  : câu nói khi chọn sai (vẫn nên ngọt ngào, đừng làm buồn :))
//
// Thêm câu hỏi mới: copy 1 object bên dưới, đổi id, sửa nội dung.
// Thứ tự trong mảng = thứ tự hỏi từ đầu tới cuối quiz.

const QUIZ_DATA = [
  {
    id: 1,
    question: 'Lần đầu tụi mình gặp nhau là ở đâu?',
    options: ['Trên lớp', 'Quán cà phê', 'Qua mạng', 'Do bạn bè giới thiệu'],
    correctIndex: 0,
    feedbackCorrect: 'Chuẩn không cần chỉnh! 💜',
    feedbackWrong: 'Trật rồi nha, nhưng không sao, quan trọng là tụi mình gặp được nhau thôi.',
  },
  {
    id: 2,
    question: 'Món ăn tui thích nhất là gì?',
    options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
    correctIndex: 1,
    feedbackCorrect: 'Đúng đó! Hiểu tui ghê 😌',
    feedbackWrong: 'Sai rồi, để tui nhắc lại cho nhớ nè hehe.',
  },
  {
    id: 3,
    question: 'Kỷ niệm nào tui hay nhắc nhất?',
    options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
    correctIndex: 2,
    feedbackCorrect: 'Yes! Kỷ niệm đó đáng nhớ thiệt.',
    feedbackWrong: 'Không phải đâu, nhưng cảm ơn vì đã cố nhớ nha.',
  },
  // add q if want
];

const CLOSING_MESSAGE = 'Dù đúng hay sai bao nhiêu câu thì cũng không quan trọng bằng việc tụi mình đã cùng nhau tạo ra những kỷ niệm này. Cảm ơn vì đã ở đây 💜';

const Quiz = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null); // Đáp án đang chọn cho câu hiện tại
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const { playMatch, playClose, playWin } = useSound();

  const currentQuestion = QUIZ_DATA[currentIndex];
  const progress = (currentIndex / QUIZ_DATA.length) * 100;

  const handleSelect = (optionIndex) => {
    if (selected !== null) return; // Đã chọn rồi thì không cho đổi đáp án
    setSelected(optionIndex);
    if (optionIndex === currentQuestion.correctIndex) {
      setScore((s) => s + 1);
      playMatch();
    } else {
      playClose();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < QUIZ_DATA.length) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    } else {
      setIsFinished(true);
      playWin();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setIsFinished(false);
  };

  if (QUIZ_DATA.length === 0) {
    return <div className={styles.container}><p className={styles.emptyState}>Chưa có câu hỏi nào - bro thêm vào QUIZ_DATA trong Quiz.jsx nha.</p></div>;
  }

  if (isFinished) {
    return (
      <div className={styles.container}>
        <div className={styles.resultScreen}>
          <p className={styles.resultTitle}>🎉 Hoàn thành!</p>
          <p className={styles.resultScore}>{score}/{QUIZ_DATA.length} câu đúng</p>
          <p className={styles.closingMessage}>{CLOSING_MESSAGE}</p>
          <button className={styles.restartBtn} onClick={handleRestart}>Làm lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.progressWrap}>
        <PixelProgressBar progress={progress} segments={QUIZ_DATA.length} />
        <span className={styles.progressLabel}>Câu {currentIndex + 1}/{QUIZ_DATA.length}</span>
      </div>

      <p className={styles.question}>{currentQuestion.question}</p>

      <div className={styles.options}>
        {currentQuestion.options.map((option, index) => {
          let variant = '';
          if (selected !== null) {
            if (index === currentQuestion.correctIndex) variant = styles.correct;
            else if (index === selected) variant = styles.wrong;
          }
          return (
            <button
              key={index}
              className={`${styles.optionBtn} ${variant}`}
              onClick={() => handleSelect(index)}
              disabled={selected !== null}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className={styles.feedbackBox}>
          <p className={styles.feedbackText}>
            {selected === currentQuestion.correctIndex
              ? currentQuestion.feedbackCorrect
              : currentQuestion.feedbackWrong}
          </p>
          <button className={styles.nextBtn} onClick={handleNext}>
            {currentIndex + 1 < QUIZ_DATA.length ? 'Câu tiếp theo →' : 'Xem kết quả'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;