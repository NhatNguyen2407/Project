import React, { useState, useRef, useEffect } from 'react';
import styles from './WindowFrame.module.css';

const RESIZE_HANDLES = [
  { dir: 'n', className: styles.handleN },
  { dir: 's', className: styles.handleS },
  { dir: 'e', className: styles.handleE },
  { dir: 'w', className: styles.handleW },
  { dir: 'ne', className: styles.handleNE },
  { dir: 'nw', className: styles.handleNW },
  { dir: 'se', className: styles.handleSE },
  { dir: 'sw', className: styles.handleSW },
];

const MIN_WIDTH = 320;
const MIN_HEIGHT = 220;

const WindowFrame = ({ title, children, onClose, onMinimize, zIndex, onFocus, isMinimized, isClosing }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  const [size, setSize] = useState({ width: 750, height: 450 });
  const [position, setPosition] = useState({
    x: Math.random() * 50 + 50,
    y: Math.random() * 50 + 20
  });

  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const resizeRef = useRef({
    isResizing: false,
    dir: null,
    startX: 0,
    startY: 0,
    initialWidth: 0,
    initialHeight: 0,
    initialX: 0,
    initialY: 0,
  });

  const onMouseDownDrag = (e) => {
    if (isMaximized) return;
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
    document.body.classList.add(styles.noSelect);
    onFocus();
  };

  const onMouseDownResize = (e, dir) => {
    e.stopPropagation();
    e.preventDefault();
    if (isMaximized) return;
    resizeRef.current = {
      isResizing: true,
      dir,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: size.width,
      initialHeight: size.height,
      initialX: position.x,
      initialY: position.y,
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
        const {
          dir, startX, startY, initialWidth, initialHeight, initialX, initialY,
        } = resizeRef.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let nextWidth = initialWidth;
        let nextHeight = initialHeight;
        let nextX = initialX;
        let nextY = initialY;

        if (dir.includes('e')) {
          nextWidth = Math.max(MIN_WIDTH, initialWidth + deltaX);
        }
        if (dir.includes('w')) {
          const proposedWidth = initialWidth - deltaX;
          nextWidth = Math.max(MIN_WIDTH, proposedWidth);
          nextX = initialX + (initialWidth - nextWidth);
        }
        if (dir.includes('s')) {
          nextHeight = Math.max(MIN_HEIGHT, initialHeight + deltaY);
        }
        if (dir.includes('n')) {
          const proposedHeight = initialHeight - deltaY;
          nextHeight = Math.max(MIN_HEIGHT, proposedHeight);
          nextY = initialY + (initialHeight - nextHeight);
        }

        setSize({ width: nextWidth, height: nextHeight });
        setPosition({ x: nextX, y: nextY });
      }
    };

    const onMouseUp = () => {
      dragRef.current.isDragging = false;
      resizeRef.current.isResizing = false;
      document.body.classList.remove(styles.noSelect);
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleResizeMouseDown = (e, dir) => {
    onMouseDownResize(e, dir);
    document.body.classList.add(styles.noSelect);
    const cursorMap = {
      n: 'ns-resize', s: 'ns-resize',
      e: 'ew-resize', w: 'ew-resize',
      ne: 'nesw-resize', sw: 'nesw-resize',
      nw: 'nwse-resize', se: 'nwse-resize',
    };
    document.body.style.cursor = cursorMap[dir];
  };

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
      className={`${styles.window} ${isMaximized ? styles.maximized : ''} ${isClosing ? styles.closing : ''}`}
      style={frameStyle}
      onMouseDown={onFocus}
    >
      <div className={styles.header} onMouseDown={onMouseDownDrag} onDoubleClick={() => !isMaximized && setIsMaximized(true)}>
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

      {!isMaximized && RESIZE_HANDLES.map(({ dir, className }) => (
        <div
          key={dir}
          className={`${styles.resizeHandle} ${className}`}
          onMouseDown={(e) => handleResizeMouseDown(e, dir)}
        />
      ))}

      {!isMaximized && <div className={styles.resizerVisual}></div>}
    </div>
  );
};

export default WindowFrame;