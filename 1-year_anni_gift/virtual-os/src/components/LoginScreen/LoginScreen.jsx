import React, { useState } from 'react';
import styles from './LoginScreen.module.css';

const LoginScreen = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Mật khẩu bí mật (Bro có thể đổi thành ngày kỷ niệm hoặc chữ gì đó)
  const SECRET_PASSWORD = '24102026'; 

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === SECRET_PASSWORD) {
      setError(false);
      setIsUnlocking(true);
      
      // Đợi 1s cho hiệu ứng fade out chạy xong rồi mới báo lên App.jsx là đã mở khóa
      setTimeout(() => {
        onUnlock();
      }, 1000);
    } else {
      setError(true);
      setPassword('');
      // Tắt trạng thái lỗi sau 0.5s để có thể rung (shake) lại nếu nhập sai tiếp
      setTimeout(() => setError(false), 5000); 
    }
  };

  return (
    <div className={`${styles.container} ${isUnlocking ? styles.fadeOut : ''}`}>
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
          />
          <button type="submit" className={styles.submitBtn}>
            →
          </button>
        </form>
        
        {error && <p className={styles.errorMsg}>Cái đồ Nhi Ngố!! Sai mật khẩu òi</p>}
      </div>
    </div>
  );
};

export default LoginScreen;