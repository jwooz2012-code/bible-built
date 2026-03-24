import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAchievementIcon, getAchievementColor } from './badgeIcons';
import { X, Lock } from 'lucide-react';

function BadgeModal({ badge, onClose }) {
  const color = getAchievementColor(badge.title);
  const isBW = color === 'BLACK_WHITE';
  const isLocked = !badge.achieved;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 96px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          className="relative w-full max-w-xs rounded-3xl p-6 z-10 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - env(safe-area-inset-bottom) - 120px)' }}
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
              style={{
                boxShadow: isLocked ? 'none' : '0 4px 20px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)',
                opacity: isLocked ? 0.4 : 1,
                filter: isLocked ? 'grayscale(1)' : 'none'
              }}
            >
              <div style={{ color: '#fff', transform: 'scale(1.3)', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}>
                {getAchievementIcon(badge.title, true)}
              </div>
            </div>
            <h3 className="text-[17px] font-bold text-foreground mb-1.5">{badge.title}</h3>
            <p className="text-[14px] text-muted-foreground leading-relaxed">{badge.subtitle}</p>
            {isLocked && badge.progress != null && (
              <div className="w-full mt-4">
                <div className="flex justify-between text-[11px] text-muted-foreground/60 mb-1.5">
                  <span>Progress</span>
                  <span>{badge.progress} / {badge.target}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-muted">
                  <div
                    className="h-full rounded-full bg-muted-foreground/40"
                    style={{ width: `${Math.min(100, (badge.progress / badge.target) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function BadgeGrid({ achievements }) {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [view, setView] = useState('earned');

  const earned = achievements.filter(b => b.achieved);
  const visible = view === 'earned' ? earned : achievements;
  const lockedCount = achievements.length - earned.length;

  return (
    <>
      {/* Toggle */}
      <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: 'hsl(var(--muted))' }}>
        {['earned', 'all'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
            style={{
              background: view === v ? 'hsl(var(--card))' : 'transparent',
              color: view === v ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            {v === 'earned' ? 'Earned' : 'All'}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[13px] text-muted-foreground/60">No badges earned yet — keep reading!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {visible.map((badge, idx) => {
            const color = getAchievementColor(badge.title);
            const isBW = color === 'BLACK_WHITE';
            const isLocked = !badge.achieved;

            return (
              <motion.button
                key={badge.id}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03, duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setSelectedBadge(badge)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl text-center"
                style={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border)/0.6)',
                  boxShadow: isLocked ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
                  opacity: isLocked ? 0.5 : 1
                }}
              >
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${isBW ? 'bg-gray-900' : `bg-gradient-to-br ${color}`}`}
                    style={{
                      boxShadow: isLocked ? 'none' : '0 3px 12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
                      filter: isLocked ? 'grayscale(1)' : 'none'
                    }}
                  >
                    <div style={{ color: '#fff', transform: 'scale(1.15)', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))' }}>
                      {getAchievementIcon(badge.title, true)}
                    </div>
                  </div>
                  {isLocked && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-muted flex items-center justify-center" style={{ border: '1px solid hsl(var(--border))' }}>
                      <Lock className="w-2 h-2 text-muted-foreground/60" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-semibold leading-tight line-clamp-2" style={{ color: isLocked ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground)/0.8)' }}>
                  {badge.title}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}

      {selectedBadge && (
        <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
      )}
    </>
  );
}