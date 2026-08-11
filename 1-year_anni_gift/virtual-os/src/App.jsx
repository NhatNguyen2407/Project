import React, { useState } from 'react';
import Desktop from './Desktop';
import LoginScreen from './components/LoginScreen/LoginScreen';
import './styles/global.css';

function App() {
  // Trạng thái khóa màn hình, mặc định ban đầu là false (bị khóa)
  const [isUnlocked, setIsUnlocked] = useState(false);

  return (
    <>
      {/* Nếu chưa mở khóa thì hiện LoginScreen */}
      {!isUnlocked && (
        <LoginScreen onUnlock={() => setIsUnlocked(true)} />
      )}
      
      {/* Desktop luôn được render ngầm bên dưới, nhưng LoginScreen sẽ đè lên trên */}
      <Desktop />
    </>
  );
}

export default App;