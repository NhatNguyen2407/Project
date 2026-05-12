import { useContext } from 'react';
import './App.css';

function App() {

  const shortcuts = [
    { id: 'intro', title: 'Opening', icon: '💌' },
    { id: 'music', title: 'Spotify', icon: '🎵' },
    { id: 'memories', title: 'Photos', icon: '🖼️' },
  ];

  return (
    <div className="desktop-environment">
      <div className="shortcut-grid">
        {shortcuts.map(s => (
          <div key={s.id} className="icon" onDoubleClick={() => console.log(`Mở app ${s.id}`)}>
            <span className="icon-img">{s.icon}</span>
            <span className="icon-label">{s.title}</span>
          </div>
        ))}
      </div>
      
      {/* Khung Taskbar mờ mờ ảo ảo ở dưới cùng */}
      <div className="taskbar">
         <div className="start-btn">💜</div>
      </div>
    </div>
  );
}

export default App;