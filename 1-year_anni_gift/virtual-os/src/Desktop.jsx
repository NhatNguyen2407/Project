import React, { useState } from 'react';
import WindowFrame from './components/WindowFrame/WindowFrame';
import DesktopIcon from './components/DesktopIcon/DesktopIcon';
import Taskbar from './components/Taskbar/Taskbar';
import StartMenu from './components/StartMenu/StartMenu';
import ContextMenu from './components/ContextMenu/ContextMenu';

// Import ảnh icon
import galleryIcon from './assets/images/folder_icon.png';
import musicIcon from './assets/images/music_icon.png';
import letterIcon from './assets/images/heart_letter_icon.png';

// Import các App
import Gallery from './apps/Gallery/Gallery';
import MusicPlayer from './apps/MusicPlayer/MusicPlayer';
import Letter from './apps/Letter/Letter';

// Kho ứng dụng
const APPS = [
  { id: 'gallery', title: 'GALLERY.EXE', icon: galleryIcon, content: <Gallery /> },
  { id: 'music', title: 'MUSIC_PLAYER.EXE', icon: musicIcon, content: <MusicPlayer /> },
  { id: 'letter', title: 'LOVE_LETTER.TXT', icon: letterIcon, content: <Letter /> }
];

const Desktop = () => {
  const [openWindows, setOpenWindows] = useState([]); 
  const [topZIndex, setTopZIndex] = useState(10);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); 
  const [theme, setTheme] = useState('purple'); 
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleOpenApp = (appId) => {
    setIsStartMenuOpen(false);
    setContextMenu(null);
    const existingApp = openWindows.find(w => w.id === appId);
    
    if (!existingApp) {
      const newZIndex = topZIndex + 1;
      setOpenWindows([...openWindows, { id: appId, zIndex: newZIndex, isMinimized: false }]);
      setTopZIndex(newZIndex);
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
  };

  const handleCloseApp = (appId) => {
    setOpenWindows(openWindows.filter(w => w.id !== appId));
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
    let lineColor = '#e1bee7';

    if (theme === 'pink') {
      bgColor = '#fff0f5';
      lineColor = '#f8bbd0';
    } else if (theme === 'mint') {
      bgColor = '#e8f5e9';
      lineColor = '#a5d6a7';
    }

    return {
      width: '100vw',
      height: '100vh',
      backgroundColor: bgColor,
      backgroundImage: `
        linear-gradient(${lineColor} 1px, transparent 1px),
        linear-gradient(90deg, ${lineColor} 1px, transparent 1px)
      `,
      backgroundSize: '30px 30px',
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
      <div style={{ ...iconGridStyle, opacity: isRefreshing ? 0 : 1 }}>
        {APPS.map((app) => (
          <DesktopIcon 
            key={app.id}
            iconSrc={app.icon} 
            label={app.title.split('.')[0]} 
            onDoubleClick={() => handleOpenApp(app.id)} 
          />
        ))}
      </div>

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
          }}
          onLock={() => window.location.reload()}
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
    </div>
  );
};

const iconGridStyle = {
  position: 'absolute',
  top: '20px',
  left: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  zIndex: 1,
  transition: 'opacity 0.1s ease',
};

export default Desktop;