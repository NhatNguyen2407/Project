import React, { useState } from 'react';
import Desktop from './Desktop';
import LoginScreen from './components/LoginScreen/LoginScreen';
import BootScreen from './components/BootScreen/BootScreen';
import CRTOverlay from './components/CRTOverlay/CRTOverlay';
import CursorTrail from './components/CursorTrail/CursorTrail';
import { SoundSettingsProvider } from './context/SoundSettingsContext';
import { AchievementsProvider } from './context/AchievementsContext';
import './styles/global.css';

function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  return (
    <SoundSettingsProvider>
      <AchievementsProvider>
        {isBooting && (
          <BootScreen onComplete={() => setIsBooting(false)} />
        )}

        {!isBooting && !isUnlocked && (
          <LoginScreen onUnlock={() => setIsUnlocked(true)} />
        )}
        
        <Desktop />

        <CRTOverlay />

        <CursorTrail />
      </AchievementsProvider>
    </SoundSettingsProvider>
  );
}

export default App;