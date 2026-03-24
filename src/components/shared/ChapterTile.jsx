import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { impactLight } from '@/components/utils/haptics';
import { useTheme } from '@/components/ThemeProvider';

export default function ChapterTile({ chapter, timesRead, onClick, disabled }) {
  const { energyMode, energyPalette, resolvedTheme } = useTheme();

  const handleClick = () => {
    if (!disabled) {
      impactLight();
      onClick();
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
    </motion.button>);

}