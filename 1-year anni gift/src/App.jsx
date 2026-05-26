import React, { useContext } from 'react';
import { WindowsContext, WindowsProvider } from './context/WindowContext.jsx';
import WindowFrame from './components/Window/WindowFrame.jsx';
import './App.css';

const DesktopEnvironment = () => {
  const { openApps, openApp } = useContext(WindowsContext);

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
          <div style={{ padding: '20px' }}>
            <h2>Thư mở đầu...</h2>
            <p>Nội dung bức thư sẽ nằm ở đây.</p>
          </div>
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