import React, { createContext, useContext, useState, useEffect } from 'react';

const EnergyContext = createContext({ 
  energyEnabled: false, 
  setEnergyEnabled: () => {} 
});

export const useEnergy = () => useContext(EnergyContext);

export function EnergyProvider({ children }) {
  const [energyEnabled, setEnergyEnabledState] = useState(() => {
    try {
      return localStorage.getItem('bb_energy_mode') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
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