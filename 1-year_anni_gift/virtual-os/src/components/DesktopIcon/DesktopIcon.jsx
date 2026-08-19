import React, { useState } from 'react';
import styles from './DesktopIcon.module.css';
import { useDraggable } from '../../hooks/useDraggable';
import IconContextMenu from '../IconContextMenu/IconContextMenu';
import IconProperties from '../IconProperties/IconProperties';
import { useAchievements } from '../../context/AchievementsContext';

const getFileType = (title) => {
  const ext = title.split('.').pop().toLowerCase();
  if (ext === 'exe') return 'Application';
  if (ext === 'txt') return 'Text Document';
  return 'File';
};

const DesktopIcon = ({ id, iconSrc, title, initialPosition, onDoubleClick, isRefreshing }) => {
  const { position, onDragMouseDown, justDraggedRef } = useDraggable(initialPosition, `icon-pos-${id}`);

  const defaultLabel = title.split('.')[0];
  const [label, setLabel] = useState(defaultLabel);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(defaultLabel);

  const [contextMenu, setContextMenu] = useState(null);
  const [showProperties, setShowProperties] = useState(false);
  const { unlock } = useAchievements();

  const handleDoubleClick = () => {
    if (justDraggedRef.current) return;
    onDoubleClick();
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const submitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== label) {
      setLabel(trimmed);
      unlock('rename_icon');
    } else if (!trimmed) {
      setRenameValue(label); // Không cho đổi thành tên rỗng
    }
    setIsRenaming(false);
  };

  return (
    <>
      <div
        className={styles.iconContainer}
        style={{
          left: position.x,
          top: position.y,
          opacity: isRefreshing ? 0 : 1,
        }}
        onMouseDown={onDragMouseDown}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        <div className={styles.imageWrapper}>
          <img src={iconSrc} alt={label} className={styles.iconImage} />
        </div>

        {isRenaming ? (
          <input
            className={styles.renameInput}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitRename();
              if (e.key === 'Escape') { setRenameValue(label); setIsRenaming(false); }
            }}
            onMouseDown={(e) => e.stopPropagation()} // Không cho kích hoạt kéo thả khi đang gõ tên
            autoFocus
            onFocus={(e) => e.target.select()}
          />
        ) : (
          <div className={styles.label}>{label}</div>
        )}
      </div>

      {contextMenu && (
        <IconContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onOpen={() => {
            setContextMenu(null);
            onDoubleClick();
          }}
          onRename={() => {
            setContextMenu(null);
            setRenameValue(label);
            setIsRenaming(true);
          }}
          onProperties={() => {
            setContextMenu(null);
            setShowProperties(true);
          }}
        />
      )}

      {showProperties && (
        <IconProperties
          iconSrc={iconSrc}
          label={label}
          fileType={getFileType(title)}
          onClose={() => setShowProperties(false)}
        />
      )}
    </>
  );
};

export default DesktopIcon;