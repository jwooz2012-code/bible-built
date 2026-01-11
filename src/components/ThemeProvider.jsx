import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ensureEnergyStyleInjected, removeEnergyStyle } from '../components/utils/energyStyle';

const ThemeContext = createContext({ 
  theme: 'system', 
  setTheme: () => {}, 
  resolvedTheme: 'light',
  energyMode: false,
  setEnergyMode: () => {},
  energyPalette: 'arcade',
  setEnergyPalette: () => {}
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('light');
  const [energyMode, setEnergyModeState] = useState(false);
  const [energyPalette, setEnergyPaletteState] = useState('surge');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        const savedTheme = u?.theme_preference || localStorage.getItem('theme') || 'system';
        const savedEnergy = localStorage.getItem('energy_mode') === 'true';
        let savedPalette = localStorage.getItem('bb_energy_palette') || 'surge';
        
        // Force surge as the only palette
        if (savedPalette !== 'surge') {
          savedPalette = 'surge';
          localStorage.setItem('bb_energy_palette', 'surge');
        }
        
        setThemeState(savedTheme);
        setEnergyModeState(savedEnergy);
        setEnergyPaletteState(savedPalette);
      })
      .catch(() => {
        const savedTheme = localStorage.getItem('theme') || 'system';
        const savedEnergy = localStorage.getItem('energy_mode') === 'true';
        let savedPalette = localStorage.getItem('bb_energy_palette') || 'surge';
        
        // Force surge as the only palette
        if (savedPalette !== 'surge') {
          savedPalette = 'surge';
          localStorage.setItem('bb_energy_palette', 'surge');
        }
        
        setThemeState(savedTheme);
        setEnergyModeState(savedEnergy);
        setEnergyPaletteState(savedPalette);
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
      root.dataset.energyPalette = energyPalette;
      ensureEnergyStyleInjected(energyPalette);
    } else {
      root.classList.remove('energy');
      delete root.dataset.energyPalette;
      removeEnergyStyle();
    }
  }, [energyMode, energyPalette]);

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

  const setEnergyMode = (enabled) => {
    setEnergyModeState(enabled);
    localStorage.setItem('energy_mode', String(enabled));
  };

  const setEnergyPalette = (palette) => {
    // Always force surge
    setEnergyPaletteState('surge');
    localStorage.setItem('bb_energy_palette', 'surge');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, energyMode, setEnergyMode, energyPalette, setEnergyPalette }}>
      {children}
    </ThemeContext.Provider>
  );
}