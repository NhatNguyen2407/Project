import React, { useState } from 'react';
import WindowFrame from './components/WindowFrame/WindowFrame';
import DesktopIcon from './components/DesktopIcon/DesktopIcon';
import Taskbar from './components/Taskbar/Taskbar';
import StartMenu from './components/StartMenu/StartMenu';
import ContextMenu from './components/ContextMenu/ContextMenu';

// Import ảnh icon từ thư mục assets
import galleryIcon from './assets/images/folder_icon.png';
import musicIcon from './assets/images/music_icon.png';
import letterIcon from './assets/images/heart_letter_icon.png';

// Kho ứng dụng tạm thời (chưa gắn code ruột bên trong)
const APPS = [
  { id: 'gallery', title: 'GALLERY.EXE', icon: galleryIcon, content: <div style={{ padding: '20px' }}>Nội dung album ảnh kỷ niệm...</div> },
  { id: 'music', title: 'MUSIC_PLAYER.EXE', icon: musicIcon, content: <div style={{ padding: '20px' }}>Trình phát nhạc sẽ nằm ở đây...</div> },
  { id: 'letter', title: 'LOVE_LETTER.TXT', icon: letterIcon, content: <div style={{ padding: '20px' }}>Nội dung bức thư tình...</div> }
];

const Desktop = () => {
  const [openWindows, setOpenWindows] = useState([]); 
  const [topZIndex, setTopZIndex] = useState(10);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { x, y }
  const [theme, setTheme] = useState('purple'); // 'purple', 'pink', 'mint'

  // Xử lý mở/focus/đóng App
  const handleOpenApp = (appId) => {
    setIsStartMenuOpen(false);
    setContextMenu(null);
    const isAlreadyOpen = openWindows.find(w => w.id === appId);
    
    if (!isAlreadyOpen) {
      const newZIndex = topZIndex + 1;
      setOpenWindows([...openWindows, { id: appId, zIndex: newZIndex }]);
      setTopZIndex(newZIndex);
    } else {
      handleFocusApp(appId);
    }
  };

  const handleCloseApp = (appId) => {
    setOpenWindows(openWindows.filter(w => w.id !== appId));
  };

  const handleFocusApp = (appId) => {
    const newZIndex = topZIndex + 1;
    setOpenWindows(openWindows.map(w => 
      w.id === appId ? { ...w, zIndex: newZIndex } : w
    ));
    setTopZIndex(newZIndex);
  };

  // Hàm chặn chuột phải mặc định & mở Custom Context Menu
  const handleContextMenu = (e) => {
    e.preventDefault(); 
    setIsStartMenuOpen(false);
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Đổi màu nền theo Theme
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
      
      {/* 1. RENDER SHORTCUTS */}
      <div style={iconGridStyle}>
        {APPS.map((app) => (
          <DesktopIcon 
            key={app.id}
            iconSrc={app.icon} 
            label={app.title.split('.')[0]} 
            onDoubleClick={() => handleOpenApp(app.id)} 
          />
        ))}
      </div>

      {/* 2. RENDER WINDOWS */}
      {openWindows.map((openedApp) => {
        const appData = APPS.find(a => a.id === openedApp.id);
        return (
          <div 
            key={openedApp.id} 
            style={{ position: 'absolute', zIndex: openedApp.zIndex }}
            onMouseDown={() => handleFocusApp(openedApp.id)}
          >
            <WindowFrame 
              title={appData.title} 
              onClose={() => handleCloseApp(openedApp.id)}
            >
              {appData.content}
            </WindowFrame>
          </div>
        );
      })}

      {/* 3. CONTEXT MENU (Chuột phải) */}
      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onClose={() => setContextMenu(null)}
          onChangeWallpaper={(selectedTheme) => {
            setTheme(selectedTheme);
            setContextMenu(null);
          }}
          onLock={() => window.location.reload()}
        />
      )}

      {/* 4. START MENU */}
      {isStartMenuOpen && (
        <StartMenu 
          APPS={APPS} 
          onOpenApp={handleOpenApp} 
          onLock={() => window.location.reload()} 
        />
      )}

      {/* 5. TASKBAR */}
      <Taskbar 
        openWindows={openWindows} 
        APPS={APPS} 
        onTabClick={handleFocusApp} 
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
};

export default Desktop;