import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function BadgeListWithProgress({ achievements, getAchievementColor, getAchievementIcon }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Show first 10 achieved badges by default, all when expanded
  const earnedAchievements = achievements.filter((a) => a.achieved);
  const displayCount = 10;
  const displayAchievements = isExpanded ? earnedAchievements : earnedAchievements.slice(0, displayCount);

  const allAchievements = isExpanded ? achievements : achievements.slice(0, displayCount);

  return (
    <>
      <div className="grid grid-cols-1 gap-3">
        {allAchievements.map((achievement) => {
          const color = getAchievementColor(achievement.title);
          const isBW = color === 'BLACK_WHITE';
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className={`rounded-xl p-4 border transition-all ${
                achievement.achieved ?
                'bg-card border-[#F97316]' :
                'bg-secondary border-border/50'
              }`}>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    achievement.achieved
                      ? isBW
                        ? 'bg-gray-900'
                        : `bg-gradient-to-br ${color}`
                      : 'bg-muted'
                  }`}
                  style={{ 
                    opacity: achievement.achieved ? 1 : 0.5,
                    boxShadow: achievement.achieved 
                      ? '0 1px 3px rgba(0,0,0,0.1), inset 0 0.5px 0 rgba(255,255,255,0.1)'
                      : 'none',
                    border: achievement.achieved && isBW ? '1.5px solid rgba(255,255,255,0.15)' : '1.5px solid',
                    borderColor: achievement.achieved && !isBW
                      ? 'color-mix(in srgb, var(--border) 60%, transparent)'
                      : achievement.achieved ? 'rgba(255,255,255,0.15)' : 'var(--border)'
                  }}>
                  <div 
                    style={{ 
                      color: achievement.achieved && isBW ? '#FFFFFF' : undefined,
                      filter: achievement.achieved ? 'drop-shadow(0 0.5px 0.5px rgba(0,0,0,0.15))' : 'none',
                      opacity: achievement.achieved ? 0.95 : 1
                    }}>
                    {getAchievementIcon(achievement.title, achievement.achieved)}
                  </div>
                </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-[15px] ${
            achievement.achieved ? 'text-foreground' : 'text-muted-foreground'}`
            }>
                  {achievement.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{achievement.subtitle.split('.')[0]}.</p>
                {!achievement.achieved &&
            <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                    {achievement.current} / {achievement.target}
                  </p>
            }
              </div>
              {achievement.achieved &&
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #F97316, #FACC15)' }} />

              }
              </div>
            </motion.div>
          );
        })}
      </div>

      {achievements.length > displayCount && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 pt-3 border-t border-border flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>{isExpanded ? 'Hide badges' : 'View all badges'}</span>
          <ChevronDown 
            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          />
        </button>
      )}
    </>
  );
}