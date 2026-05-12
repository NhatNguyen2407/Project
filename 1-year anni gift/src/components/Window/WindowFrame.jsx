import React, { useContext } from 'react';
import { WindowsContext } from '../../context/WindowsContext';

const WindowFrame = ({ title, appID, children }) => {
  const { closeApp } = useContext(WindowsContext);

  return (
    <div className="window-wrapper">
      <div className="window-header">
        <span className="window-title">{title}</span>
        <button onClick={() => closeApp(appID)} className="close-btn">×</button>
      </div>
      <div className="window-body">
        {children}
      </div>
    </div>
  );
};

export default WindowFrame;