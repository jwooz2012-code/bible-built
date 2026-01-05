import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';

const EnergyContext = createContext({ 
  energyEnabled: false, 
  setEnergyEnabled: () => {} 
});

export const useEnergy = () => useContext(EnergyContext);

// Apply energy class before React mounts (prevents flash)
if (typeof window !== 'undefined') {
  try {
    const energy = localStorage.getItem('bb_energy_mode');
    if (energy === '1') {
      document.documentElement.classList.add('energy');
    } else {
      document.documentElement.classList.remove('energy');
    }
  } catch {}
}

export function EnergyProvider({ children }) {
  const [energyEnabled, setEnergyEnabledState] = useState(() => {
    try {
      return localStorage.getItem('bb_energy_mode') === '1';
    } catch {
      return false;
    }
  });

  // Use useLayoutEffect for synchronous DOM updates
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (energyEnabled) {
      root.classList.add('energy');
    } else {
      root.classList.remove('energy');
    }
  }, [energyEnabled]);

  const setEnergyEnabled = (enabled) => {
    setEnergyEnabledState(enabled);
    try {
      localStorage.setItem('bb_energy_mode', enabled ? '1' : '0');
    } catch {}
  };

  return (
    <EnergyContext.Provider value={{ energyEnabled, setEnergyEnabled }}>
      {children}
    </EnergyContext.Provider>
  );
}