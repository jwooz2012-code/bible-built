import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAchievementIcon, getAchievementColor } from './badgeIcons';

/**
 * UNIFIED BADGE STRIP
 * 
 * Single source of truth for badge display across the app.
 * Used on Home, Stats, and any other page showing earned badges.
 * 
 * Features:
 * - Horizontal scroll with snap behavior
 * - Resets to start on mount
 * - Identical visual treatment everywhere
 * - Smooth Apple-level scrolling
 */
export default function BadgeStrip({ badges, showLabel = true }) {
  const scrollRef = useRef(null);

  // Reset scroll position to start on mount or when badges change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [badges]);

  // Filter only earned badges
  const earnedBadges = badges.filter(badge => badge.achieved);

  if (earnedBadges.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-muted-foreground">No badges earned yet</p>
      </div>
    );
  }

  return (
    <div>
      {showLabel && (
        <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-2 text-center">
          Badges
        </p>
      )}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-1"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <div className="flex items-center justify-center gap-2 mx-auto">
          {earnedBadges.map((badge, idx) => {
            const color = getAchievementColor(badge.title);
            const isBW = color === 'BLACK_WHITE';
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05, duration: 0.2 }}
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 snap-start ${
                  isBW ? 'bg-gray-900' : `bg-gradient-to-br ${color}`
                }`}
                style={{
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1), inset 0 0.5px 0 rgba(255,255,255,0.1)',
                  border: isBW ? '1.5px solid rgba(255,255,255,0.15)' : '1.5px solid rgba(0,0,0,0.08)',
                  borderColor: isBW ? 'rgba(255,255,255,0.15)' : undefined
                }}
                title={badge.title}
              >
                <div 
                  style={{ 
                    color: isBW ? '#FFFFFF' : '#FFFFFF',
                    filter: 'drop-shadow(0 0.5px 0.5px rgba(0,0,0,0.15))',
                    opacity: 0.95
                  }}
                >
                  {getAchievementIcon(badge.title, badge.achieved)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}