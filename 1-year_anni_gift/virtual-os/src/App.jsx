import React, { useState } from 'react';
import Desktop from './Desktop';
import LoginScreen from './components/LoginScreen/LoginScreen';
import BootScreen from './components/BootScreen/BootScreen';
import OSLoadingScreen from './components/OSLoadingScreen/OSLoadingScreen';
import CRTOverlay from './components/CRTOverlay/CRTOverlay';
import CursorTrail from './components/CursorTrail/CursorTrail';
import { SoundSettingsProvider } from './context/SoundSettingsContext';
import { AchievementsProvider } from './context/AchievementsContext';
import './styles/global.css';

const PHASES = {
  BIOS: 'bios',
  LOADING: 'loading',
  LOGIN: 'login',
  DESKTOP: 'desktop',
};

function App() {
  const [phase, setPhase] = useState(PHASES.BIOS);

  return (
    <SoundSettingsProvider>
      <AchievementsProvider>
        {phase === PHASES.BIOS && (
          <BootScreen onComplete={() => setPhase(PHASES.LOADING)} />
        )}

        {phase === PHASES.LOADING && (
          <OSLoadingScreen onComplete={() => setPhase(PHASES.LOGIN)} />
        )}

        {phase === PHASES.LOGIN && (
          <LoginScreen onUnlock={() => setPhase(PHASES.DESKTOP)} />
        )}
        
        <Desktop />

        <CRTOverlay />

        <CursorTrail />
      </AchievementsProvider>
    </SoundSettingsProvider>
  );
}

export default App;