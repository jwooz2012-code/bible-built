import React, { createContext, useContext, useState, useEffect } from 'react';

const GuestModeContext = createContext();

export const useGuestMode = () => {
  const context = useContext(GuestModeContext);
  if (!context) {
    throw new Error('useGuestMode must be used within GuestModeProvider');
  }
  return context;
};

// Guest mode flag - set to true for App Store review
const GUEST_MODE_ENABLED = true;

const STORAGE_KEYS = {
  READING_LOGS: 'biblebuilt_guest_progress_v1_reading_logs',
  BOOK_PROGRESS: 'biblebuilt_guest_progress_v1_book_progress',
  ACHIEVEMENTS: 'biblebuilt_guest_progress_v1_achievements',
  BIBLE_PROGRESS: 'biblebuilt_guest_progress_v1_bible_progress',
  LIFETIME_READING: 'biblebuilt_guest_progress_v1_lifetime_reading',
};

export const GuestModeProvider = ({ children }) => {
  const [isGuest, setIsGuest] = useState(false);
  const [guestData, setGuestData] = useState({
    readingLogs: [],
    bookProgress: [],
    achievements: [],
    bibleProgress: null,
    lifetimeReading: null,
  });

  useEffect(() => {
    if (GUEST_MODE_ENABLED) {
      // Load guest data from localStorage
      const loadedData = {
        readingLogs: JSON.parse(localStorage.getItem(STORAGE_KEYS.READING_LOGS) || '[]'),
        bookProgress: JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOK_PROGRESS) || '[]'),
        achievements: JSON.parse(localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS) || '[]'),
        bibleProgress: JSON.parse(localStorage.getItem(STORAGE_KEYS.BIBLE_PROGRESS) || 'null'),
        lifetimeReading: JSON.parse(localStorage.getItem(STORAGE_KEYS.LIFETIME_READING) || 'null'),
      };
      setGuestData(loadedData);
      setIsGuest(true);
    }
  }, []);

  const saveToStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const guestAPI = {
    // ReadingLog operations
    readingLog: {
      list: () => Promise.resolve(guestData.readingLogs),
      filter: ({ user_id }) => Promise.resolve(guestData.readingLogs),
      create: (data) => {
        const newLog = { ...data, id: `guest_${Date.now()}_${Math.random()}` };
        const updated = [...guestData.readingLogs, newLog];
        setGuestData(prev => ({ ...prev, readingLogs: updated }));
        saveToStorage(STORAGE_KEYS.READING_LOGS, updated);
        return Promise.resolve(newLog);
      },
      delete: (id) => {
        const updated = guestData.readingLogs.filter(log => log.id !== id);
        setGuestData(prev => ({ ...prev, readingLogs: updated }));
        saveToStorage(STORAGE_KEYS.READING_LOGS, updated);
        return Promise.resolve({ success: true });
      },
    },
    
    // BookProgress operations
    bookProgress: {
      list: () => Promise.resolve(guestData.bookProgress),
      filter: ({ book_index, user_id }) => {
        const filtered = guestData.bookProgress.filter(bp => bp.book_index === book_index);
        return Promise.resolve(filtered);
      },
      create: (data) => {
        const newProgress = { ...data, id: `guest_${Date.now()}_${Math.random()}` };
        const updated = [...guestData.bookProgress, newProgress];
        setGuestData(prev => ({ ...prev, bookProgress: updated }));
        saveToStorage(STORAGE_KEYS.BOOK_PROGRESS, updated);
        return Promise.resolve(newProgress);
      },
      update: (id, data) => {
        const updated = guestData.bookProgress.map(bp => 
          bp.id === id ? { ...bp, ...data } : bp
        );
        setGuestData(prev => ({ ...prev, bookProgress: updated }));
        saveToStorage(STORAGE_KEYS.BOOK_PROGRESS, updated);
        return Promise.resolve({ ...guestData.bookProgress.find(bp => bp.id === id), ...data });
      },
    },
    
    // Achievement operations
    achievement: {
      list: () => Promise.resolve(guestData.achievements),
      filter: ({ user_id }) => Promise.resolve(guestData.achievements),
      create: (data) => {
        const newAchievement = { ...data, id: `guest_${Date.now()}_${Math.random()}` };
        const updated = [...guestData.achievements, newAchievement];
        setGuestData(prev => ({ ...prev, achievements: updated }));
        saveToStorage(STORAGE_KEYS.ACHIEVEMENTS, updated);
        return Promise.resolve(newAchievement);
      },
    },
    
    // BibleProgress operations
    bibleProgress: {
      list: () => Promise.resolve(guestData.bibleProgress ? [guestData.bibleProgress] : []),
      filter: ({ user_id }) => Promise.resolve(guestData.bibleProgress ? [guestData.bibleProgress] : []),
      create: (data) => {
        const newProgress = { ...data, id: `guest_${Date.now()}` };
        setGuestData(prev => ({ ...prev, bibleProgress: newProgress }));
        saveToStorage(STORAGE_KEYS.BIBLE_PROGRESS, newProgress);
        return Promise.resolve(newProgress);
      },
      update: (id, data) => {
        const updated = { ...guestData.bibleProgress, ...data };
        setGuestData(prev => ({ ...prev, bibleProgress: updated }));
        saveToStorage(STORAGE_KEYS.BIBLE_PROGRESS, updated);
        return Promise.resolve(updated);
      },
    },
    
    // LifetimeReading operations
    lifetimeReading: {
      list: () => Promise.resolve(guestData.lifetimeReading ? [guestData.lifetimeReading] : []),
      filter: ({ user_id }) => Promise.resolve(guestData.lifetimeReading ? [guestData.lifetimeReading] : []),
      create: (data) => {
        const newReading = { ...data, id: `guest_${Date.now()}` };
        setGuestData(prev => ({ ...prev, lifetimeReading: newReading }));
        saveToStorage(STORAGE_KEYS.LIFETIME_READING, newReading);
        return Promise.resolve(newReading);
      },
      update: (id, data) => {
        const updated = { ...guestData.lifetimeReading, ...data };
        setGuestData(prev => ({ ...prev, lifetimeReading: updated }));
        saveToStorage(STORAGE_KEYS.LIFETIME_READING, updated);
        return Promise.resolve(updated);
      },
    },
  };

  const guestUser = {
    id: 'guest_user',
    email: 'guest@app.com',
    full_name: 'Guest User',
    role: 'user',
  };

  return (
    <GuestModeContext.Provider value={{ 
      isGuest, 
      guestAPI, 
      guestUser,
      isGuestModeEnabled: GUEST_MODE_ENABLED,
    }}>
      {children}
    </GuestModeContext.Provider>
  );
};