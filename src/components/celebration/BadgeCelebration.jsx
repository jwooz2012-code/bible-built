import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAchievementIcon, getAchievementColor } from '@/components/badges/badgeIcons';
import { BADGE_SCRIPTURES } from '@/components/badges/badgeScriptures';

// ─── Rarity system (future-ready) ────────────────────────────────────────────
function getRarity(title) {
  const legendary = ['The Whole Word', 'Built for a Lifetime', 'Iron Discipline'];
  const epic = ['Cover to Cover', 'Testament Strong', 'Triple Digits', 'All In', 'Master Builder'];
  const rare = ['Fifty Down', 'Built to Last', 'Deep Roots', 'Swordsmen', 'Back for More'];
  if (legendary.includes(title)) return 'legendary';
  if (epic.includes(title)) return 'epic';
  if (rare.includes(title)) return 'rare';
  return 'common';
}

function getRarityLabel(rarity) {
  return { legendary: 'LEGENDARY', epic: 'EPIC', rare: 'RARE', common: 'UNLOCKED' }[rarity];
}

// ─── Burst particles (fast, impact moment) ───────────────────────────────────
const BURST = Array.from({ length: 20 }, (_, i) => {
  const angle = (i / 20) * 360;
  const rad = (angle * Math.PI) / 180;
  const dist = 55 + (i % 4) * 18;
  return {
    id: i,
    x: Math.cos(rad) * dist,
    y: Math.sin(rad) * dist,
    size: i % 3 === 0 ? 4 : i % 3 === 1 ? 3 : 2,
  };
});

// ─── Ambient float particles (slow, after burst) ─────────────────────────────
const AMBIENT = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 120,
  y: -(30 + i * 14),
  size: 2 + (i % 2),
  delay: 0.7 + i * 0.15,
  duration: 2.8 + i * 0.4,
}));

function BurstParticles({ color, isBlackWhite }) {
  return (
    <>
      {BURST.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], x: p.x, y: p.y, scale: [0, 1.2, 0.3] }}
          transition={{ duration: 0.45, delay: 0.3, ease: [0.2, 0, 0.8, 1] }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: '50%',
            top: '50%',
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
            background: isBlackWhite ? '#fff' : 'white',
            opacity: 0,
          }}
        />
      ))}
    </>
  );
}

function AmbientParticles({ color, isBlackWhite }) {
  return (
    <>
      {AMBIENT.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 0.6, 0], x: p.x, y: p.y }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut', repeat: Infinity, repeatDelay: 1.2 }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: '50%',
            top: '50%',
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
            background: isBlackWhite ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.8)',
          }}
        />
      ))}
    </>
  );
}

// ─── Light streaks behind badge ──────────────────────────────────────────────
function LightStreaks() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[28px]">
      {[15, 75, 135, 195].map((angle, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.04, 0.02, 0.05, 0] }}
          transition={{ duration: 4 + i * 1.2, delay: 0.8 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: 2,
            height: '140%',
            top: '-20%',
            left: '50%',
            transformOrigin: 'top center',
            transform: `rotate(${angle}deg)`,
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.12), transparent)',
            filter: 'blur(3px)',
          }}
        />
      ))}
    </div>
  );
}

// ─── Collectible badge ────────────────────────────────────────────────────────
function CollectibleBadge({ badge, color, isBlackWhite, rarity }) {
  // Chrome/metallic highlight overlay
  const chromeStyle = {
    background: isBlackWhite
      ? 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.12) 100%)'
      : 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 55%, rgba(255,255,255,0.15) 100%)',
  };

  // Outer ring color
  const ringStyle = isBlackWhite
    ? { background: 'linear-gradient(135deg, #555 0%, #111 50%, #444 100%)' }
    : {}; // gradient applied via className for colored badges

  return (
    <motion.div
      initial={{ y: -40, opacity: 0, rotate: -8, scale: 0.7 }}
      animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 320, damping: 20 }}
      style={{ position: 'relative', width: 112, height: 112 }}
    >
      {/* Floating idle animation wrapper */}
      <motion.div
        animate={{ y: [0, -4, 0], rotate: [0, 0.8, 0, -0.8, 0] }}
        transition={{ duration: 3.6, delay: 0.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        {/* Outer ring (metallic frame) */}
        <div
          className={`absolute inset-0 rounded-full ${!isBlackWhite ? `bg-gradient-to-br ${color}` : ''}`}
          style={{
            ...ringStyle,
            boxShadow: isBlackWhite
              ? '0 0 0 3px rgba(255,255,255,0.15), 0 12px 40px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.5)'
              : '0 0 0 3px rgba(255,255,255,0.18), 0 12px 40px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
            padding: 4,
          }}
        >
          {/* Inner badge body */}
          <div
            className={`w-full h-full rounded-full flex items-center justify-center relative overflow-hidden ${
              isBlackWhite ? 'bg-gray-900' : `bg-gradient-to-br ${color}`
            }`}
            style={{
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.3)',
            }}
          >
            {/* Chrome highlight sweep */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={chromeStyle}
            />
            {/* Icon */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              {getAchievementIcon(badge?.title, true, 'large')}
            </div>
          </div>
        </div>

        {/* Bottom shadow / depth */}
        <div
          style={{
            position: 'absolute',
            bottom: -10,
            left: '15%',
            right: '15%',
            height: 16,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.35)',
            filter: 'blur(8px)',
          }}
        />
      </motion.div>

      {/* Burst + ambient particles */}
      <BurstParticles color={color} isBlackWhite={isBlackWhite} />
      <AmbientParticles color={color} isBlackWhite={isBlackWhite} />
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BadgeCelebration({ data, onDismiss }) {
  const { badge, userName } = data;
  const color = getAchievementColor(badge?.title);
  const isBlackWhite = color === 'BLACK_WHITE';
  const scripture = BADGE_SCRIPTURES[badge?.title];
  const rarity = getRarity(badge?.title);
  const rarityLabel = getRarityLabel(rarity);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Rarity accent colors for eyebrow label
  const rarityColor = {
    legendary: '#F59E0B',
    epic: '#8B5CF6',
    rare: '#06B6D4',
    common: undefined,
  }[rarity];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Subtle animated background gradient */}
      <motion.div
        animate={{ opacity: [0.06, 0.1, 0.06] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isBlackWhite
            ? 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.12) 0%, transparent 70%)'
            : `radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.1) 0%, transparent 65%)`,
        }}
      />

      {/* Trophy card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.65 }}
        className="w-full max-w-[340px] mx-6 rounded-[28px] overflow-hidden relative"
        style={{
          background: 'linear-gradient(160deg, hsl(var(--card)) 0%, hsl(var(--card)) 70%, rgba(255,255,255,0.02) 100%)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <LightStreaks />

        {/* Top accent bar */}
        <div
          className={`h-[3px] w-full ${isBlackWhite ? 'bg-gradient-to-r from-gray-500 via-white to-gray-500' : `bg-gradient-to-r ${color}`}`}
          style={{ opacity: 0.9 }}
        />

        <div className="flex flex-col items-center px-8 pt-8 pb-7 relative z-10">

          {/* Eyebrow — rarity label */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72, duration: 0.3 }}
            className="text-[10px] font-black uppercase tracking-[0.25em] mb-7"
            style={{ color: rarityColor ?? 'hsl(var(--muted-foreground))' }}
          >
            {rarityLabel}
          </motion.p>

          {/* Badge */}
          <div className="mb-7">
            <CollectibleBadge badge={badge} color={color} isBlackWhite={isBlackWhite} rarity={rarity} />
          </div>

          {/* Badge name */}
          <motion.h2
            initial={{ opacity: 0, scale: 1.08, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-[26px] font-black text-foreground text-center leading-tight tracking-tight mb-2"
          >
            {badge?.title}
          </motion.h2>

          {/* Badge subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.88, duration: 0.35 }}
            className="text-[13px] text-muted-foreground text-center leading-relaxed mb-5 max-w-[240px]"
          >
            {badge?.subtitle}
          </motion.p>

          {/* Scripture */}
          {scripture && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.96, duration: 0.45 }}
              className="w-full rounded-2xl px-5 py-4 mb-6 text-center"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <p className="text-[13px] text-foreground/75 leading-relaxed italic mb-2">
                "{scripture.text}"
              </p>
              <p className="text-[10px] font-bold text-muted-foreground tracking-[0.18em] uppercase">
                {scripture.reference}
              </p>
            </motion.div>
          )}

          {!scripture && <div className="mb-5" />}

          {/* CTA button */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: scripture ? 1.06 : 0.96, duration: 0.35 }}
            whileTap={{ scale: 0.96 }}
            onClick={onDismiss}
            className={`w-full py-4 rounded-2xl font-bold text-[15px] tracking-wide text-white ${
              isBlackWhite ? '' : `bg-gradient-to-r ${color}`
            }`}
            style={isBlackWhite ? {
              background: 'linear-gradient(135deg, #333 0%, #111 100%)',
            } : {
              boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            Keep Building
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}