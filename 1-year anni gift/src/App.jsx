import React, { useContext } from 'react';
import { WindowsContext, WindowsProvider } from './context/WindowContext.jsx';
import WindowFrame from './components/Window/WindowFrame.jsx';
import './App.css';

const DesktopEnvironment = () => {
  const { openApps, openApp, focusedApp, minimizedApps, minimizeApp } = useContext(WindowsContext);

  const shortcuts = [
    { id: 'intro', title: 'Opening', icon: '💌' },
    { id: 'music', title: 'Spotify', icon: '🎵' },
    { id: 'memories', title: 'Photos', icon: '🖼️' },
    { id: 'tenten', title: 'TenTen VIP', icon: '🍜' }, // Thêm app thẻ VIP quán Ramen nè
  ];

  return (
    <div className="desktop-environment">
      {/* Các Shortcut trên màn hình */}
      <div className="shortcut-grid">
        {shortcuts.map(s => (
          <div key={s.id} className="icon" onDoubleClick={() => openApp(s.id)}>
            <span className="icon-img">{s.icon}</span>
            <span className="icon-label">{s.title}</span>
          </div>
        ))}
      </div>

      {/* Render các cửa sổ đang mở */}
      {openApps.includes('intro') && (
        <WindowFrame title="Opening Message" appID="intro">
          <p>Loading module intro...</p>
        </WindowFrame>
      )}

      {openApps.includes('music') && (
        <WindowFrame title="Music Player" appID="music">
          <div style={{ padding: '20px' }}>
            <h2>Spotify Fake</h2>
            <p>Giao diện đĩa than sẽ bê vào đây.</p>
          </div>
        </WindowFrame>
      )}

      {/* Thêm các điều kiện render app khác ở đây */}

      {/* Taskbar ở dưới cùng */}
      <div className="taskbar">
        <div className="start-btn">💜</div>
        
        {/* KHU VỰC HIỆN APP ĐANG MỞ (WINDOWS TASKBAR STYLE) */}
        <div className="taskbar-apps">
          {openApps.map(appID => {
            // Lấy thông tin app từ mảng shortcuts để lấy icon
            const appInfo = shortcuts.find(s => s.id === appID);
            if (!appInfo) return null;

            const isFocused = focusedApp === appID;
            const isMinimized = minimizedApps.includes(appID);

            return (
              <div 
                key={appID}
                className={`taskbar-item ${(isFocused && !isMinimized) ? 'active' : ''}`}
                onClick={() => {
                  if (isFocused && !isMinimized) {
                    minimizeApp(appID); // Đang mở thì thu nhỏ
                  } else {
                    openApp(appID); // Bị thu nhỏ hoặc chìm xuống dưới thì gọi lên
                  }
                }}
                title={appInfo.title}
              >
                <span className="taskbar-icon-small">{appInfo.icon}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <WindowsProvider>
      <DesktopEnvironment />
    </WindowsProvider>
  );
}

export default App;