import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { triggerHaptic } from '@/components/utils/haptics';
import { useTheme } from '@/components/ThemeProvider';

export default function ChapterTile({ chapter, timesRead, onClick, disabled }) {
  const { energyMode, energyPalette } = useTheme();

  const isRoyalRead = energyMode && energyPalette === 'royal' && timesRead > 0;

  const handleClick = () => {
    if (!disabled) {
      triggerHaptic();
      onClick();
    }
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.15 }}
      onClick={handleClick}
      disabled={disabled}
      className={`relative aspect-square rounded-xl flex items-center justify-center transition-all border shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={timesRead > 0 ? {
        background: 'hsl(var(--accent))',
        borderColor: 'hsl(var(--accent))',
        borderWidth: '1.5px'
      } : {
        background: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))'
      }}>

      {timesRead >= 1 &&
      <div className="bg-white rounded-full absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center border border-[#1a1a1a] times-read-badge">


          <span
          className="text-[9px] font-bold leading-none"
          style={{ color: energyMode && energyPalette === 'petal' ? 'hsl(222 22% 18%)' : '#F97316' }}>

            {timesRead}
          </span>
        </div>
      }
      
      <span
        className="text-[15px] font-semibold leading-none"
        style={isRoyalRead ? { color: 'hsl(220 25% 12%)' } : { color: 'hsl(var(--foreground))' }}>

        {chapter}
      </span>
    </motion.button>);

}