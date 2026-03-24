import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { notificationSuccess } from '@/components/utils/haptics';

export const CELEBRATION_TYPES = {
  BADGE: 'badge',
  BOOK: 'book',
  STREAK: 'streak',
};

const PRIORITIES = { badge: 1, book: 2, streak: 3 };

const CelebrationContext = createContext(null);

// Session-level dedup — prevents re-triggering on refetch/re-render
const celebratedThisSession = new Set();

export function CelebrationProvider({ children }) {
  const [current, setCurrent] = useState(null);
  const queueRef = useRef([]);

  const showNext = useCallback(() => {
    if (queueRef.current.length === 0) { setCurrent(null); return; }
    queueRef.current.sort((a, b) => a.priority - b.priority);
    const next = queueRef.current.shift();
    setCurrent(next);
  }, []);

  const triggerCelebration = useCallback((type, data = {}, options = {}) => {
    const { dedupKey } = options;
    if (dedupKey) {
      if (celebratedThisSession.has(dedupKey)) return;
      celebratedThisSession.add(dedupKey);
    }
    notificationSuccess();

    const item = {
      type,
      data,
      priority: PRIORITIES[type] ?? 99,
      id: `${type}-${Date.now()}-${Math.random()}`,
    };

    setCurrent(prev => {
      if (!prev) return item;
      if (item.priority < prev.priority) {
        queueRef.current.unshift(prev);
        queueRef.current.sort((a, b) => a.priority - b.priority);
        return item;
      }
      queueRef.current.push(item);
      queueRef.current.sort((a, b) => a.priority - b.priority);
      return prev;
    });
  }, []);

  const dismiss = useCallback(() => { showNext(); }, [showNext]);

  return (
    <CelebrationContext.Provider value={{ current, triggerCelebration, dismiss }}>
      {children}
    </CelebrationContext.Provider>
  );
}

export function useCelebration() {
  const ctx = useContext(CelebrationContext);
  if (!ctx) return { current: null, triggerCelebration: () => {}, dismiss: () => {} };
  return ctx;
}