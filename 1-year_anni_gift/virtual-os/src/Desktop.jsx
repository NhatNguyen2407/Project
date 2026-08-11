import React from 'react';
import WindowFrame from './components/WindowFrame/WindowFrame';

const Desktop = () => {
  return (
    <div style={desktopStyle}>
      {/* Ném WindowFrame vào đây */}
      <WindowFrame title="CATS.EXE">
        <div style={{ textAlign: 'center', color: '#7b1fa2' }}>
          <h3 style={{ marginBottom: '8px' }}>TOO MANY CATS!</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Chào mừng bạn đến với Virtual OS ✨
          </p>
        </div>
      </WindowFrame>
    </div>
  );
};

// Style cho nền màn hình Desktop với hiệu ứng ô ly pastel
const desktopStyle = {
  width: '100vw',
  height: '100vh',
  backgroundColor: '#f4ecf7',
  backgroundImage: `
    linear-gradient(#e1bee7 1px, transparent 1px),
    linear-gradient(90deg, #e1bee7 1px, transparent 1px)
  `,
  backgroundSize: '30px 30px',
  position: 'relative',
  overflow: 'hidden',
};

export default Desktop;