import React, { useState } from 'react';
import Desktop from './Desktop';
import LoginScreen from './components/LoginScreen/LoginScreen';
import CRTOverlay from './components/CRTOverlay/CRTOverlay';
import { SoundSettingsProvider } from './context/SoundSettingsContext';
import { AchievementsProvider } from './context/AchievementsContext';
import './styles/global.css';

function App() {
  // Trạng thái khóa màn hình, mặc định ban đầu là false
  const [isUnlocked, setIsUnlocked] = useState(false);

  return (
    <SoundSettingsProvider>
      <AchievementsProvider>
        {/* Nếu chưa mở khóa thì hiện LoginScreen */}
        {!isUnlocked && (
          <LoginScreen onUnlock={() => setIsUnlocked(true)} />
        )}
        
        <Desktop />

        <CRTOverlay />
      </AchievementsProvider>
    </SoundSettingsProvider>
  );
}

export default App;