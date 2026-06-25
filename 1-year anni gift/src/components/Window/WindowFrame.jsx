import React, { useContext, useState } from 'react';
import Draggable from 'react-draggable';
import { WindowsContext } from '../../context/WindowContext';

const WindowFrame = ({ title, appID, children }) => {
  const { closeApp, focusApp, focusedApp, minimizeApp, minimizedApps } = useContext(WindowsContext);
  const [isMaximized, setIsMaximized] = useState(false); // State kiểm tra phóng to

  const isFocused = focusedApp === appID;
  const isMinimized = minimizedApps.includes(appID);
  
  const zIndex = isFocused ? 100 : 10;
  // Nếu bị thu nhỏ thì ẩn đi hoàn toàn
  const displayStyle = isMinimized ? { display: 'none' } : {};

  return (
    <Draggable
      handle=".window-header"
      cancel=".window-controls-win" /* THÊM DÒNG NÀY ĐỂ FIX LỖI CRASH */
      onMouseDown={() => focusApp(appID)}
      bounds="parent"
      defaultPosition={{ x: 50, y: 50 }}
      disabled={isMaximized}
    >
      <div 
        className={`window-wrapper ${isFocused ? 'focused' : ''} ${isMaximized ? 'maximized' : ''}`}
        style={{ zIndex: zIndex, ...displayStyle }}
        onClick={() => focusApp(appID)}
      >
        <div className="window-header">
          <div className="window-title-container">
            <span className="window-title">{title}</span>
          </div>

          {/* CỤM NÚT ĐIỀU KHIỂN BÊN PHẢI */}
          <div 
            className="window-controls-win"
            onMouseDown={(e) => e.stopPropagation()} /* CHÌA KHÓA FIX LỖI CRASH Ở ĐÂY BRO NHÉ! */
          >
            <button 
              className="control-btn-win minimize" 
              onClick={(e) => { e.stopPropagation(); minimizeApp(appID); }}
              title="Minimize"
            >
              {/* Icon Dấu trừ */}
              <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1"><path d="M0,5 h10" /></svg>
            </button>
            
            <button 
              className="control-btn-win maximize" 
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsMaximized(!isMaximized); 
                focusApp(appID);
              }}
              title={isMaximized ? "Restore Down" : "Maximize"}
            >
              {/* Đổi icon chuẩn Windows 11 bằng SVG */}
              {isMaximized ? (
                // Icon Restore (2 ô vuông chồng lên nhau giống ảnh bro gửi)
                <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1" fill="none">
                  <path d="M2,2 h6 v6 h-6 z M2,4 v-2 h6 v6 h-2 M0,4 h6 v6 h-6 z" />
                </svg>
              ) : (
                // Icon Maximize (1 ô vuông)
                <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1" fill="none">
                  <path d="M0,0 h10 v10 h-10 z" />
                </svg>
              )}
            </button>

            <button 
              className="control-btn-win close" 
              onClick={(e) => { e.stopPropagation(); closeApp(appID); }}
              title="Close"
            >
              {/* Icon Dấu X */}
              <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1"><path d="M0,0 L10,10 M10,0 L0,10" /></svg>
            </button>
          </div>
        </div>

        <div className="window-body">
          {children}
        </div>
      </div>
    </Draggable>
  );
};

export default WindowFrame;