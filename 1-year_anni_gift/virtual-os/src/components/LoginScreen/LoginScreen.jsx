import React, { useState } from 'react';
import styles from './LoginScreen.module.css';
import PixelProgressBar from '../PixelProgressBar/PixelProgressBar';

const LoginScreen = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false); // Đang hiện progress bar (chưa fade)
  const [isFadingOut, setIsFadingOut] = useState(false); // Đã load xong, bắt đầu fade màn hình
  const [unlockProgress, setUnlockProgress] = useState(0);

  // Mật khẩu bí mật (Bro có thể đổi thành ngày kỷ niệm hoặc chữ gì đó)
  const SECRET_PASSWORD = '24102026'; 

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === SECRET_PASSWORD) {
      setError(false);
      setIsUnlocking(true); // Chỉ hiện thanh loading, MÀN HÌNH CHƯA MỜ ĐI

      // Giai đoạn 1: chạy progress bar đầy dần trong 1s, đứng yên hoàn toàn
      const stepMs = 60;
      const totalSteps = 1000 / stepMs;
      let step = 0;
      const progressTimer = setInterval(() => {
        step++;
        const pct = Math.min(100, (step / totalSteps) * 100);
        setUnlockProgress(pct);

        if (pct >= 100) {
          clearInterval(progressTimer);
          // Giai đoạn 2: CHỈ SAU KHI load xong 100% mới bắt đầu hiệu ứng fade/scale
          setIsFadingOut(true);
          // Đợi đúng bằng thời lượng transition fade trong CSS (0.5s) rồi mới báo mở khoá
          setTimeout(() => {
            onUnlock();
          }, 500);
        }
      }, stepMs);
    } else {
      setError(true);
      setPassword('');
      // Tắt trạng thái lỗi sau 0.5s để có thể rung (shake) lại nếu nhập sai tiếp
      setTimeout(() => setError(false), 5000); 
    }
  };

  return (
    <div className={`${styles.container} ${isFadingOut ? styles.fadeOut : ''}`}>
      <div className={styles.loginBox}>
        {/* Avatar người dùng */}
        <div className={styles.avatar}>
          <span className={styles.avatarIcon}>💜</span>
        </div>
        
        <h1 className={styles.userName}>Bi ngố hỏi cậu!</h1>
        <p className={styles.prompt}>Cậu biếc hôm nay là ngày bao nhiu hơm?!?</p>

        <form onSubmit={handleLogin} className={styles.form}>
          <input 
            type="password" 
            className={`${styles.input} ${error ? styles.shake : ''}`}
            placeholder="Enter password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            disabled={isUnlocking}
          />
          <button type="submit" className={styles.submitBtn} disabled={isUnlocking}>
            →
          </button>
        </form>
        
        {error && <p className={styles.errorMsg}>Cái đồ Nhi Ngố!! Sai mật khẩu òi</p>}

        {isUnlocking && (
          <div className={styles.unlockProgressWrap}>
            <p className={styles.unlockingText}>Đang mở khoá...</p>
            <PixelProgressBar progress={unlockProgress} segments={14} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;