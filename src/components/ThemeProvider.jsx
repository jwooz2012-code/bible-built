import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const ThemeContext = createContext({ 
  theme: 'system', 
  setTheme: () => {}, 
  resolvedTheme: 'light',
  energyMode: false,
  setEnergyMode: () => {}
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('light');
  const [energyMode, setEnergyModeState] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        const savedTheme = u?.theme_preference || localStorage.getItem('theme') || 'system';
        const savedEnergy = u?.energy_mode ?? (localStorage.getItem('energy_mode') === 'true');
        setThemeState(savedTheme);
        setEnergyModeState(savedEnergy);
      })
      .catch(() => {
        const savedTheme = localStorage.getItem('theme') || 'system';
        const savedEnergy = localStorage.getItem('energy_mode') === 'true';
        setThemeState(savedTheme);
        setEnergyModeState(savedEnergy);
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
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (energyMode) {
      root.classList.add('energy');
    } else {
      root.classList.remove('energy');
    }
  }, [energyMode]);

  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (user) {
      try {
        await base44.auth.updateMe({ theme_preference: newTheme });
      } catch (error) {
        // Silent fail
      }
    }
  };

  const setEnergyMode = async (enabled) => {
    setEnergyModeState(enabled);
    localStorage.setItem('energy_mode', String(enabled));
    
    if (user) {
      try {
        await base44.auth.updateMe({ energy_mode: enabled });
      } catch (error) {
        // Silent fail
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, energyMode, setEnergyMode }}>
      {children}
    </ThemeContext.Provider>
  );
}