import React, { createContext, useState } from 'react';

export const WindowsContext = createContext();

export const WindowsProvider = ({ children }) => {
  const [openApps, setOpenApps] = useState([]);

  const openApp = (appID) => {
    if (!openApps.includes(appID)) {
      setOpenApps([...openApps, appID]);
    }
  };

  const closeApp = (appID) => {
    setOpenApps(openApps.filter(id => id !== appID));
  };

  return (
    <WindowsContext.Provider value={{ openApps, openApp, closeApp }}>
      {children}
    </WindowsContext.Provider>
  );
};