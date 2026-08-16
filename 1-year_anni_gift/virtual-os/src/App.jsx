import React, { useState } from 'react';
import Desktop from './Desktop';
import LoginScreen from './components/LoginScreen/LoginScreen';
import CRTOverlay from './components/CRTOverlay/CRTOverlay';
import { SoundSettingsProvider } from './context/SoundSettingsContext';
import './styles/global.css';

function App() {
  // Trạng thái khóa màn hình, mặc định ban đầu là false (bị khóa)
  const [isUnlocked, setIsUnlocked] = useState(false);

  return (
    <SoundSettingsProvider>
      {/* Nếu chưa mở khóa thì hiện LoginScreen */}
      {!isUnlocked && (
        <LoginScreen onUnlock={() => setIsUnlocked(true)} />
      )}
      
      {/* Desktop luôn được render ngầm bên dưới, nhưng LoginScreen sẽ đè lên trên */}
      <Desktop />

      {/* Lớp phủ hiệu ứng CRT, luôn nằm trên cùng toàn bộ UI */}
      <CRTOverlay />
    </SoundSettingsProvider>
  );
}

export default App;