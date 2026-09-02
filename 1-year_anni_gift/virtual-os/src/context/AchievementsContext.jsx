import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ACHIEVEMENTS } from '../constants/achievement';

const STORAGE_KEY = 'unlocked-achievements';

const AchievementsContext = createContext(null);

const loadUnlocked = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    return new Set();
  }
};

const getAppAchievementIds = () =>
  Object.keys(ACHIEVEMENTS).filter((id) => ACHIEVEMENTS[id].category === 'app');

export const AchievementsProvider = ({ children }) => {
  const [unlockedIds, setUnlockedIds] = useState(loadUnlocked);
  const [toasts, setToasts] = useState([]); 
  const toastIdCounter = useRef(0);
  const prevUnlockedRef = useRef(unlockedIds);

  const unlock = useCallback((achievementId) => {
    if (!ACHIEVEMENTS[achievementId]) return; // id không tồn tại trong registry -> bỏ qua an toàn

    setUnlockedIds((prev) => {
      if (prev.has(achievementId)) return prev;

      const next = new Set(prev);
      next.add(achievementId);

      const appIds = getAppAchievementIds();
      if (appIds.length > 0 && appIds.every((id) => next.has(id))) {
        next.add('explorer');
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch (e) {
      }

      return next;
    });
  }, []);

  useEffect(() => {
    const prev = prevUnlockedRef.current;
    const newlyUnlocked = [...unlockedIds].filter((id) => !prev.has(id));

    if (newlyUnlocked.length > 0) {
      const newToasts = newlyUnlocked
        .map((id) => {
          const meta = ACHIEVEMENTS[id];
          if (!meta) return null;
          return { toastId: toastIdCounter.current++, id, ...meta };
        })
        .filter(Boolean);
      setToasts((current) => [...current, ...newToasts]);
    }

    prevUnlockedRef.current = unlockedIds;
  }, [unlockedIds]);

  const dismissCurrentToast = useCallback(() => {
    setToasts((prev) => prev.slice(1));
  }, []);

  const isUnlocked = useCallback((id) => unlockedIds.has(id), [unlockedIds]);

  const value = {
    unlock,
    isUnlocked,
    unlockedIds,
    toasts,
    dismissCurrentToast,
    totalCount: Object.keys(ACHIEVEMENTS).length,
    unlockedCount: unlockedIds.size,
  };

  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider>
  );
};

export const useAchievements = () => {
  const ctx = useContext(AchievementsContext);
  if (!ctx) {
    throw new Error('useAchievements phải được gọi bên trong <AchievementsProvider>');
  }
  return ctx;
};