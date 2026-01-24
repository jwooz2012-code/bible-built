import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAchievementIcon, getAchievementColor } from './badgeIcons';
import { getBadgesForRow } from './badgeUtils';

export default function BadgeRowHorizontal({ 
  badges, 
  mode = 'earned',
  maxVisible = 7,
  onBadgeClick
}) {
  const scrollRef = useRef(null);
  const displayBadges = getBadgesForRow(badges, mode);
  const visibleBadges = displayBadges.slice(0, maxVisible);
  const placeholderCount = mode === 'earned' ? Math.max(0, maxVisible - visibleBadges.length) : 0;

  // Reset scroll position to start after layout is complete
  useEffect(() => {
    if (scrollRef.current) {
      // Use requestAnimationFrame to ensure layout is complete
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = 0;
        }
      });
    }
  }, [badges, mode]);

  return (
    <div ref={scrollRef} className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {visibleBadges.map((badge, idx) => {
        const color = getAchievementColor(badge.title);
        const isBW = color === 'BLACK_WHITE';
        
        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onBadgeClick?.(badge)}
            className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer ${
              badge.achieved
                ? isBW ? 'bg-foreground' : `bg-gradient-to-br ${color}`
                : 'bg-muted'
            }`}
            style={{
              boxShadow: badge.achieved 
                ? '0 2px 4px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)'
                : 'none',
              border: '1.5px solid',
              borderColor: badge.achieved 
                ? 'color-mix(in srgb, var(--border) 60%, transparent)'
                : 'var(--border)',
              opacity: badge.achieved ? 1 : 0.5
            }}
            title={badge.title}
          >
            <div 
              style={{ 
                color: badge.achieved && isBW ? 'hsl(var(--background))' : undefined,
                filter: badge.achieved ? 'drop-shadow(0 0.5px 1px rgba(0,0,0,0.2))' : 'none',
                opacity: badge.achieved ? 0.95 : 1
              }}>
              {getAchievementIcon(badge.title, badge.achieved, 'large')}
            </div>
          </motion.div>
        );
      })}
      
      {mode === 'earned' && Array.from({ length: placeholderCount }).map((_, idx) => (
        <div
          key={`placeholder-${idx}`}
          className="w-12 h-12 rounded-full flex-shrink-0 border border-border/40 bg-muted/20"
        />
      ))}
    </div>
  );
}