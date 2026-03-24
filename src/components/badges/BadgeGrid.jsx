import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAchievementIcon, getAchievementColor } from './badgeIcons';
import { X } from 'lucide-react';

function BadgeModal({ badge, onClose }) {
  const color = getAchievementColor(badge.title);
  const isBW = color === 'BLACK_WHITE';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          className="relative w-full max-w-xs rounded-3xl p-6 z-10"
          style={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border)/0.8)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
          }}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isBW ? 'bg-gray-900' : `bg-gradient-to-br ${color}`}`}
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)' }}
            >
              <div style={{ color: '#fff', transform: 'scale(1.3)', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}>
                {getAchievementIcon(badge.title, true)}
              </div>
            </div>
            <h3 className="text-[17px] font-bold text-foreground mb-1.5">{badge.title}</h3>
            <p className="text-[14px] text-muted-foreground leading-relaxed">{badge.subtitle}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function BadgeGrid({ achievements }) {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const earned = achievements.filter(b => b.achieved);

  if (earned.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[13px] text-muted-foreground/60">No badges earned yet — keep reading!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {earned.map((badge, idx) => {
          const color = getAchievementColor(badge.title);
          const isBW = color === 'BLACK_WHITE';

          return (
            <motion.button
              key={badge.id}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04, duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setSelectedBadge(badge)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl text-center"
              style={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border)/0.6)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${isBW ? 'bg-gray-900' : `bg-gradient-to-br ${color}`}`}
                style={{
                  boxShadow: '0 3px 12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)'
                }}
              >
                <div style={{ color: '#fff', transform: 'scale(1.15)', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))' }}>
                  {getAchievementIcon(badge.title, true)}
                </div>
              </div>
              <span className="text-[11px] font-semibold text-foreground/80 leading-tight line-clamp-2">{badge.title}</span>
            </motion.button>
          );
        })}
      </div>

      {selectedBadge && (
        <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
      )}
    </>
  );
}