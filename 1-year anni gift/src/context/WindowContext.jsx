import React, { createContext, useState } from 'react';

export const WindowsContext = createContext();

export const WindowsProvider = ({ children }) => {
  const [openApps, setOpenApps] = useState([]);
  const [focusedApp, setFocusedApp] = useState(null);
  const [minimizedApps, setMinimizedApps] = useState([]); // Khai báo thêm list app bị thu nhỏ

  const openApp = (appID) => {
    // Nếu app chưa mở thì thêm vào danh sách mở
    if (!openApps.includes(appID)) {
      setOpenApps([...openApps, appID]);
    }
    // Nếu app đang bị thu nhỏ thì xóa khỏi danh sách thu nhỏ (khôi phục lại)
    if (minimizedApps.includes(appID)) {
      setMinimizedApps(minimizedApps.filter(id => id !== appID));
    }
    setFocusedApp(appID);
  };

  const closeApp = (appID) => {
    setOpenApps(openApps.filter(id => id !== appID));
    setMinimizedApps(minimizedApps.filter(id => id !== appID)); // Tắt thì xóa luôn khỏi list thu nhỏ
    if (focusedApp === appID) setFocusedApp(null);
  };

  const focusApp = (appID) => {
    // Chỉ focus nếu app không bị thu nhỏ
    if (!minimizedApps.includes(appID)) {
      setFocusedApp(appID);
    }
  };

  const minimizeApp = (appID) => {
    if (!minimizedApps.includes(appID)) {
      setMinimizedApps([...minimizedApps, appID]);
    }
    if (focusedApp === appID) setFocusedApp(null); // Bỏ focus khi thu nhỏ
  };

  return (
    <WindowsContext.Provider value={{ openApps, openApp, closeApp, focusedApp, focusApp, minimizedApps, minimizeApp }}>
      {children}
    </WindowsContext.Provider>
  );
};