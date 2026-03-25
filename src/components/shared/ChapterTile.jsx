import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { triggerHaptic } from '@/components/utils/haptics';
import { useTheme } from '@/components/ThemeProvider';

export default function ChapterTile({ chapter, timesRead, onClick, disabled }) {
  const { energyMode, energyPalette, resolvedTheme } = useTheme();

  const [floaters, setFloaters] = useState([]);

  const handleClick = () => {
    if (!disabled) {
      triggerHaptic();
      onClick();
      const id = Date.now();
      setFloaters(prev => [...prev, id]);
      setTimeout(() => setFloaters(prev => prev.filter(f => f !== id)), 800);
    }
  };

  // Energy mode: match calendar day styling
  const getEnergyTileStyle = () => {
    if (timesRead > 0) {
      return {
        background: 'rgba(28, 32, 38, 0.9)',
        borderWidth: '1.5px',
        borderColor: 'hsla(var(--primary) / 0.4)',
        boxShadow: 'inset 0 0 8px hsla(var(--primary) / 0.1)'
      };
    }
    return {
      background: 'hsl(var(--card))',
      borderColor: 'hsl(var(--border))'
    };
  };

  const getDefaultTileStyle = () => {
    if (timesRead > 0) {
      return {
        background: 'hsl(var(--accent))',
        borderColor: 'hsl(var(--accent))',
        borderWidth: '1.5px'
      };
    }
    return {
      background: 'hsl(var(--card))',
      borderColor: 'hsl(var(--border))'
    };
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.15 }}
      onClick={handleClick}
      disabled={disabled}
      className={`relative aspect-square rounded-xl flex items-center justify-center transition-all border shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={energyMode ? getEnergyTileStyle() : getDefaultTileStyle()}>

      {timesRead >= 1 &&
      <div 
        className="rounded-full absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center times-read-badge"
        style={{ 
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #1a1a1a',
          opacity: 1
        }}
      >
          <span
          className="text-[9px] font-bold leading-none"
          style={{ color: '#1a1a1a' }}>
            {timesRead}
          </span>
        </div>
      }
      
      <span
        className="text-[15px] font-semibold leading-none"
        style={{ 
          color: energyMode && timesRead > 0 
            ? '#FFFFFF' 
            : 'hsl(var(--foreground))' 
        }}>
        {chapter}
      </span>

      {/* Floating +1 animation */}
      <AnimatePresence>
        {floaters.map(id => (
          <motion.div
            key={id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -28, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-black text-emerald-500 pointer-events-none z-20"
          >
            +1
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.button>);

}