import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const ThemeContext = createContext({ theme: 'system', setTheme: () => {}, resolvedTheme: 'light' });

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('light');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        const savedTheme = u?.theme_preference || localStorage.getItem('theme') || 'light';
        setThemeState(savedTheme);
      })
      .catch(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setThemeState(savedTheme);
      });
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveTheme = theme;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      effectiveTheme = systemTheme;
    }

    root.classList.add(effectiveTheme);
    setResolvedTheme(effectiveTheme);

    // Apply Energy Mode on load
    const energyMode = localStorage.getItem('bb_energy_mode') === '1';
    if (energyMode) {
      root.classList.add('energy');
    } else {
      root.classList.remove('energy');
    }
  }, [theme]);

  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (user) {
      try {
        await base44.auth.updateMe({ theme_preference: newTheme });
      } catch (error) {
        console.error('Failed to save theme preference', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}