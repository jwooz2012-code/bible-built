import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { triggerHaptic } from '@/components/utils/haptics';
import { useTheme } from '@/components/ThemeProvider';

export default function ChapterTile({ chapter, timesRead, onClick, disabled, chapterId }) {
  const { energyMode, energyPalette, resolvedTheme } = useTheme();
  const [floaters, setFloaters] = useState([]);

  useEffect(() => {
    if (!chapterId) return;
    const handler = (e) => {
      if (e.detail?.chapterId !== chapterId) return;
      const id = Date.now() + Math.random();
      setFloaters(prev => [...prev, id]);
      setTimeout(() => setFloaters(prev => prev.filter(f => f !== id)), 800);
    };
    window.addEventListener('biblebuilt:chapterRead', handler);
    return () => window.removeEventListener('biblebuilt:chapterRead', handler);
  }, [chapterId]);

  const handleClick = () => {
    if (!disabled) {
      triggerHaptic();
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
    <div className="relative">
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.15 }}
      onClick={handleClick}
      disabled={disabled}
      className={`relative aspect-square w-full rounded-xl flex items-center justify-center transition-all border shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={energyMode ? getEnergyTileStyle() : getDefaultTileStyle()}>

      {timesRead >= 1 && (() => {
        // Color tiers: 1=green, 2=purple, 3=orange, 4+=blue
        const tierStyles = timesRead >= 4
          ? { bg: 'linear-gradient(135deg, #3B82F6, #06B6D4)', border: 'rgba(59,130,246,0.5)', text: '#fff', shadow: '0 2px 6px rgba(59,130,246,0.5)' }
          : timesRead === 3
          ? { bg: 'linear-gradient(135deg, #F59E0B, #F97316)', border: 'rgba(245,158,11,0.5)', text: '#fff', shadow: '0 2px 6px rgba(249,115,22,0.55)' }
          : timesRead === 2
          ? { bg: 'linear-gradient(135deg, #8B5CF6, #6366F1)', border: 'rgba(139,92,246,0.5)', text: '#fff', shadow: '0 2px 6px rgba(139,92,246,0.55)' }
          : { bg: 'linear-gradient(135deg, #22C55E, #10B981)', border: 'rgba(34,197,94,0.5)', text: '#fff', shadow: '0 2px 6px rgba(34,197,94,0.5)' };
        return (
          <div
            className="rounded-full absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center times-read-badge"
            style={{
              background: tierStyles.bg,
              border: `1.5px solid ${tierStyles.border}`,
              boxShadow: tierStyles.shadow,
            }}
          >
            <span className="text-[10px] font-black leading-none" style={{ color: tierStyles.text }}>
              {timesRead}
            </span>
          </div>
        );
      })()}
      
      <span
        className="text-base font-semibold leading-none"
        style={{ 
          color: energyMode && timesRead > 0 
            ? '#FFFFFF' 
            : 'hsl(var(--foreground))' 
        }}>
        {chapter}
      </span>
    </motion.button>

    {/* +1 micro-celebration — matches onboarding demo */}
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
    </div>);

}