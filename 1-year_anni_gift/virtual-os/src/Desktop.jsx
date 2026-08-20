import React, { useState, useEffect } from 'react';
import WindowFrame from './components/WindowFrame/WindowFrame';
import DesktopIcon from './components/DesktopIcon/DesktopIcon';
import Taskbar from './components/Taskbar/Taskbar';
import StartMenu from './components/StartMenu/StartMenu';
import ContextMenu from './components/ContextMenu/ContextMenu';
import StickyNote from './components/StickyNote/StickyNote';
import PixelPet from './components/PixelPet/PixelPet';
import FloatingElements from './components/FloatingElements/FloatingElements';
import FakeSystemScreen from './components/FakeSystemScreen/FakeSystemScreen';
import CountdownWidget from './components/CountdownWidget/CountdownWidget';
import Screensaver from './components/Screensaver/Screensaver';
import AchievementToast from './components/AchievementToast/AchievementToast';
import { useSound } from './hooks/useSound';
import { useAchievements } from './context/AchievementsContext';

// Import ảnh icon
import galleryIcon from './assets/images/pixel/folder_icon_pixel.png';
import musicIcon from './assets/images/pixel/music_icon_pixel.png';
import letterIcon from './assets/images/pixel/heart_letter_icon_pixel.png';
import memoryMatchIcon from './assets/images/pixel/memory_match_icon.svg';
import terminalIcon from './assets/images/pixel/terminal_icon.svg';
import timelineIcon from './assets/images/pixel/timeline_icon.svg';
import achievementsIcon from './assets/images/pixel/achievements_icon.svg';
import quizIcon from './assets/images/pixel/quiz_icon.svg';

// Import các App
import Gallery from './apps/Gallery/Gallery';
import MusicPlayer from './apps/MusicPlayer/MusicPlayer';
import Letter from './apps/Letter/Letter';
import MemoryMatch from './apps/MemoryMatch/MemoryMatch';
import Terminal from './apps/Terminal/Terminal';
import Timeline from './apps/Timeline/Timeline';
import Achievements from './apps/Achievements/Achievements';
import Quiz from './apps/Quiz/Quiz';

// Kho ứng dụng
const APPS = [
  { id: 'gallery', title: 'GALLERY.EXE', icon: galleryIcon, content: <Gallery /> },
  { id: 'music', title: 'MUSIC_PLAYER.EXE', icon: musicIcon, content: <MusicPlayer /> },
  { id: 'letter', title: 'LOVE_LETTER.TXT', icon: letterIcon, content: <Letter /> },
  { id: 'memory', title: 'MEMORY_MATCH.EXE', icon: memoryMatchIcon, content: <MemoryMatch /> },
  { id: 'terminal', title: 'TERMINAL.EXE', icon: terminalIcon, content: <Terminal /> },
  { id: 'timeline', title: 'TIMELINE.EXE', icon: timelineIcon, content: <Timeline /> },
  { id: 'achievements', title: 'ACHIEVEMENTS.EXE', icon: achievementsIcon, content: <Achievements /> },
  { id: 'quiz', title: 'QUIZ.EXE', icon: quizIcon, content: <Quiz /> }
];

const Desktop = () => {
  const [openWindows, setOpenWindows] = useState([]); 
  const [topZIndex, setTopZIndex] = useState(10);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); 
  const [theme, setTheme] = useState('purple'); 
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { playClick, playOpen, playClose } = useSound();
  const { unlock } = useAchievements();
  const [fakeScreen, setFakeScreen] = useState(null); 

  useEffect(() => {
    const handleSecretCombo = (e) => {
      if (e.ctrlKey && e.altKey && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setFakeScreen('bsod');
        unlock('prankster');
      }
    };
    window.addEventListener('keydown', handleSecretCombo);
    return () => window.removeEventListener('keydown', handleSecretCombo);
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (e.target.closest('button, [data-sfx="click"]')) {
        playClick();
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [playClick]);

  const handleOpenApp = (appId) => {
    setIsStartMenuOpen(false);
    setContextMenu(null);
    const existingApp = openWindows.find(w => w.id === appId);
    
    if (!existingApp) {
      const newZIndex = topZIndex + 1;
      setOpenWindows([...openWindows, { id: appId, zIndex: newZIndex, isMinimized: false }]);
      setTopZIndex(newZIndex);
      playOpen();
      unlock(`open_${appId}`);
    } else {
      handleRestoreAndFocus(appId);
    }
  };

  const handleRestoreAndFocus = (appId) => {
    const newZIndex = topZIndex + 1;
    setOpenWindows(openWindows.map(w => 
      w.id === appId ? { ...w, isMinimized: false, zIndex: newZIndex } : w
    ));
    setTopZIndex(newZIndex);
  };

  const handleMinimizeApp = (appId) => {
    setOpenWindows(openWindows.map(w => 
      w.id === appId ? { ...w, isMinimized: true } : w
    ));
    playClose();
  };

  const handleCloseApp = (appId) => {
    setOpenWindows(openWindows.filter(w => w.id !== appId));
    playClose();
  };

  const handleTaskbarClick = (appId) => {
    const app = openWindows.find(w => w.id === appId);
    const isTop = app.zIndex === Math.max(...openWindows.map(win => win.zIndex));
    
    if (app.isMinimized) {
      handleRestoreAndFocus(appId);
    } else if (isTop) {
      handleMinimizeApp(appId);
    } else {
      handleRestoreAndFocus(appId);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault(); 
    setIsStartMenuOpen(false);
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleRefresh = () => {
    setContextMenu(null);
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 200);
  };

  const getBackgroundStyle = () => {
    let bgColor = '#f4ecf7';
    let dotColor = '#e1bee7';

    if (theme === 'pink') {
      bgColor = '#fff0f5';
      dotColor = '#f8bbd0';
    } else if (theme === 'mint') {
      bgColor = '#e8f5e9';
      dotColor = '#a5d6a7';
    }

    return {
      width: '100vw',
      height: '100vh',
      backgroundColor: bgColor,
      backgroundImage: `
        radial-gradient(${dotColor} 1.5px, transparent 1.5px),
        radial-gradient(${dotColor} 1.5px, transparent 1.5px)
      `,
      backgroundSize: '16px 16px',
      backgroundPosition: '0 0, 8px 8px',
      position: 'relative',
      overflow: 'hidden',
    };
  };

  return (
    <div 
      style={getBackgroundStyle()} 
      onContextMenu={handleContextMenu} 
      onClick={() => { setIsStartMenuOpen(false); setContextMenu(null); }}
    >
      {APPS.map((app, index) => (
        <DesktopIcon 
          key={app.id}
          id={app.id}
          iconSrc={app.icon} 
          title={app.title}
          initialPosition={{ x: 20, y: 20 + index * 110 }}
          onDoubleClick={() => handleOpenApp(app.id)} 
          isRefreshing={isRefreshing}
        />
      ))}

      <FloatingElements />
      <StickyNote />
      <PixelPet />
      <CountdownWidget />
      <AchievementToast />

      {openWindows.map((openedApp) => {
        const appData = APPS.find(a => a.id === openedApp.id);
        return (
          <WindowFrame 
            key={openedApp.id}
            title={appData.title} 
            zIndex={openedApp.zIndex}
            isMinimized={openedApp.isMinimized}
            onFocus={() => handleRestoreAndFocus(openedApp.id)}
            onClose={() => handleCloseApp(openedApp.id)}
            onMinimize={() => handleMinimizeApp(openedApp.id)}
          >
            {appData.content}
          </WindowFrame>
        );
      })}

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onClose={() => setContextMenu(null)}
          onRefresh={handleRefresh}
          onChangeWallpaper={(selectedTheme) => {
            setTheme(selectedTheme);
            setContextMenu(null);
            unlock('change_theme');
          }}
          onLock={() => window.location.reload()}
          onShutdown={() => { setFakeScreen('shutdown'); unlock('shutdown_egg'); }}
        />
      )}

      {isStartMenuOpen && (
        <StartMenu 
          APPS={APPS} 
          onOpenApp={handleOpenApp} 
          onLock={() => window.location.reload()} 
        />
      )}

      <Taskbar 
        openWindows={openWindows} 
        APPS={APPS} 
        onTabClick={handleTaskbarClick} 
        toggleStartMenu={() => setIsStartMenuOpen(!isStartMenuOpen)} 
      />

      {fakeScreen && (
        <FakeSystemScreen
          variant={fakeScreen}
          onDismiss={() => setFakeScreen(null)}
        />
      )}

      <Screensaver />
    </div>
  );
};

export default Desktop;