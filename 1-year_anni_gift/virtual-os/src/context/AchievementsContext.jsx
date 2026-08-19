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
    if (!ACHIEVEMENTS[achievementId]) return;

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

    newlyUnlocked.forEach((id) => {
      const meta = ACHIEVEMENTS[id];
      if (!meta) return;
      const toastId = toastIdCounter.current++;
      setToasts((current) => [...current, { toastId, id, ...meta }]);
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.toastId !== toastId));
      }, 4500);
    });

    prevUnlockedRef.current = unlockedIds;
  }, [unlockedIds]);

  const isUnlocked = useCallback((id) => unlockedIds.has(id), [unlockedIds]);

  const value = {
    unlock,
    isUnlocked,
    unlockedIds,
    toasts,
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