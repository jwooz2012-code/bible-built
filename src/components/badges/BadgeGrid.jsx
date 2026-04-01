import React, { useState, useRef } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { getAchievementIcon, getAchievementColor } from './badgeIcons';
import { X, Lock, Award } from 'lucide-react';

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
          style={{
            maxHeight: 'calc(100vh - env(safe-area-inset-bottom) - 120px)',
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
            <div className="relative mb-5">
              {!isLocked && (
                <div
                  className={`absolute inset-0 rounded-full ${isBW ? '' : `bg-gradient-to-br ${color}`}`}
                  style={{
                    filter: 'blur(8px)',
                    opacity: 0.25,
                    transform: 'scale(1.15)',
                    background: isBW ? 'rgba(180,180,180,0.2)' : undefined,
                  }}
                />
              )}
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center relative overflow-hidden ${isBW ? '' : `bg-gradient-to-br ${color}`}`}
                style={{
                  background: isBW ? 'linear-gradient(145deg, #3a3a3a 0%, #111 50%, #2a2a2a 100%)' : undefined,
                  boxShadow: isLocked
                    ? 'inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 8px 28px rgba(0,0,0,0.35), 0 0 0 3px rgba(255,255,255,0.12), inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.2)',
                  border: isLocked ? '2px solid rgba(255,255,255,0.06)' : '2px solid rgba(255,255,255,0.2)',
                  opacity: isLocked ? 0.4 : 1,
                  filter: isLocked ? 'grayscale(1)' : 'none',
                }}
              >
                <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.08) 100%)' }} />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 rounded-b-full pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.18))' }} />
                <div style={{ position: 'relative', zIndex: 2, color: '#fff', transform: 'scale(1.8)', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }}>
                  {getAchievementIcon(badge.title, true, 'large')}
                </div>
              </div>
              {isLocked && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-muted flex items-center justify-center" style={{ border: '1.5px solid hsl(var(--border))' }}>
                  <Lock className="w-3 h-3 text-muted-foreground/60" />
                </div>
              )}
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

function TiltBadge({ children, isLocked }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (!ref.current || isLocked) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: -dy * 14, y: dx * 14 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovering(false);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !isLocked && setHovering(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovering ? 1.08 : 1})`,
        transition: hovering ? 'transform 0.05s ease-out' : 'transform 0.3s ease-out',
      }}
    >
      {children}
    </div>
  );
}

export default function BadgeGrid({ achievements }) {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [view, setView] = useState('earned');
  const { energyMode } = useTheme();

  const earned = achievements.filter(b => b.achieved);
  const visible = view === 'earned' ? earned : achievements;

  return (
    <>
      {/* Header row: count + toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4" style={{ color: '#FACC15' }} />
          <span className="text-sm font-semibold text-foreground">
            {earned.length} <span className="text-muted-foreground font-normal">/ {achievements.length}</span>
          </span>
          <span className="text-xs text-muted-foreground/50">unlocked</span>
        </div>
        <div className="flex items-center gap-0.5 p-1 rounded-xl" style={{ background: 'hsl(var(--muted))' }}>
          {['earned', 'all'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={{
                background: view === v ? 'hsl(var(--card))' : 'transparent',
                color: view === v ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {v === 'earned' ? 'Earned' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[13px] text-muted-foreground/60">No badges earned yet — keep reading!</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-x-3 gap-y-6">
          {visible.map((badge, idx) => {
            const color = getAchievementColor(badge.title);
            const isBW = color === 'BLACK_WHITE';
            const isLocked = !badge.achieved;

            return (
              <motion.button
                key={badge.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03, duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileTap={{ scale: 0.88 }}
                onClick={() => setSelectedBadge(badge)}
                className="flex flex-col items-center gap-2 text-center"
                style={{ opacity: isLocked ? 0.38 : 1 }}
              >
                {/* Circular coin medal */}
                <TiltBadge isLocked={isLocked}>
                <div className="relative">
                  {/* Glow ring for earned badges */}
                  {!isLocked && (
                    <div
                      className={`absolute inset-0 rounded-full ${isBW ? '' : `bg-gradient-to-br ${color}`}`}
                      style={{
                        filter: energyMode ? 'blur(7px)' : 'blur(5px)',
                        opacity: energyMode ? 0.6 : 0.28,
                        transform: energyMode ? 'scale(1.2)' : 'scale(1.12)',
                        background: isBW ? 'rgba(200,200,200,0.2)' : undefined,
                      }}
                    />
                  )}
                  <div
                    data-badge-coin="true"
                    className={`w-16 h-16 rounded-full flex items-center justify-center relative overflow-hidden ${isBW ? '' : `bg-gradient-to-br ${color}`}`}
                    style={{
                      background: isBW ? 'linear-gradient(145deg, #3a3a3a 0%, #111 50%, #2a2a2a 100%)' : undefined,
                      boxShadow: isLocked
                        ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.3)'
                        : energyMode
                          ? '0 6px 24px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.2), inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.25)'
                          : '0 6px 20px rgba(0,0,0,0.35), 0 0 0 2px rgba(255,255,255,0.12), inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.2)',
                      border: isLocked ? '1.5px solid rgba(255,255,255,0.06)' : '1.5px solid rgba(255,255,255,0.25)',
                      filter: isLocked ? 'grayscale(1) brightness(0.6)' : energyMode ? 'brightness(1.15) saturate(1.25)' : 'none',
                    }}
                  >
                    {/* Chrome highlight sweep */}
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.08) 100%)',
                      }}
                    />
                    {/* Bottom shadow inner */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1/2 rounded-b-full pointer-events-none"
                      style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.18))' }}
                    />
                    <div style={{ position: 'relative', zIndex: 2, color: '#fff', transform: 'scale(1.6)', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }}>
                      {getAchievementIcon(badge.title, true, 'large')}
                    </div>
                  </div>
                  {isLocked && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-muted flex items-center justify-center" style={{ border: '1px solid hsl(var(--border))' }}>
                      <Lock className="w-2 h-2 text-muted-foreground/60" />
                    </div>
                  )}
                  </div>
                  </TiltBadge>
                  <span
                  className="text-[10px] font-semibold leading-tight line-clamp-2 px-0.5"
                  style={{ color: isLocked ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground)/0.85)' }}
                  >
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