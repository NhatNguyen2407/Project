import React, { useState, useRef, useEffect } from 'react';
import styles from './WindowFrame.module.css';

const WindowFrame = ({ title, children, onClose, onMinimize, zIndex, onFocus, isMinimized }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  
  const [size, setSize] = useState({ width: 750, height: 450 });
  const [position, setPosition] = useState({ 
    x: Math.random() * 50 + 50, 
    y: Math.random() * 50 + 20 
  });
  
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const resizeRef = useRef({ isResizing: false, startX: 0, startY: 0, initialWidth: 0, initialHeight: 0 });

  const onMouseDownDrag = (e) => {
    if (isMaximized) return; 
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
    onFocus();
  };

  const onMouseDownResize = (e) => {
    e.stopPropagation(); 
    if (isMaximized) return;
    resizeRef.current = {
      isResizing: true,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: size.width,
      initialHeight: size.height
    };
    onFocus();
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (dragRef.current.isDragging) {
        setPosition({
          x: dragRef.current.initialX + (e.clientX - dragRef.current.startX),
          y: dragRef.current.initialY + (e.clientY - dragRef.current.startY)
        });
      } else if (resizeRef.current.isResizing) {
        setSize({
          width: Math.max(350, resizeRef.current.initialWidth + (e.clientX - resizeRef.current.startX)), 
          height: Math.max(250, resizeRef.current.initialHeight + (e.clientY - resizeRef.current.startY)) 
        });
      }
    };

    const onMouseUp = () => {
      dragRef.current.isDragging = false;
      resizeRef.current.isResizing = false;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // Đẩy position và zIndex trực tiếp vào thẻ ngoài cùng
  const frameStyle = {
    position: 'absolute',
    top: isMaximized ? 0 : position.y,
    left: isMaximized ? 0 : position.x,
    width: isMaximized ? '100vw' : size.width,
    height: isMaximized ? 'calc(100vh - 60px)' : size.height,
    zIndex: zIndex,
    display: isMinimized ? 'none' : 'flex'
  };

  return (
    <div 
      className={`${styles.window} ${isMaximized ? styles.maximized : ''}`} 
      style={frameStyle}
      onMouseDown={onFocus}
    >
      <div className={styles.header} onMouseDown={onMouseDownDrag}>
        <div className={styles.title}>{title}</div>
        <div className={styles.controls}>
          <button className={styles.btn} onClick={(e) => { e.stopPropagation(); onMinimize(); }}>_</button>
          <button className={styles.btn} onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }}>
            {isMaximized ? '❐' : '□'}
          </button>
          <button className={`${styles.btn} ${styles.closeBtn}`} onClick={(e) => { e.stopPropagation(); onClose(); }}>X</button>
        </div>
      </div>
      
      <div className={styles.content}>
        {children}
      </div>

      {!isMaximized && (
        <div className={styles.resizer} onMouseDown={onMouseDownResize}></div>
      )}
    </div>
  );
};

export default WindowFrame;