import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAchievementIcon, getAchievementColor } from '@/components/badges/badgeIcons';
import { BADGE_SCRIPTURES } from '@/components/badges/badgeScriptures';

// Particle data — static so no rerenders
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  angle: (i / 18) * 360,
  distance: 72 + (i % 3) * 22,
  size: i % 3 === 0 ? 3.5 : i % 3 === 1 ? 2.5 : 2,
  delay: 0.35 + (i % 6) * 0.06,
}));

function GlowRing({ color }) {
  const isBlackWhite = color === 'BLACK_WHITE';
  const glowColor = isBlackWhite ? 'rgba(255,255,255,0.12)' : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: [0, 0.55, 0.28], scale: [0.3, 1.35, 1.1] }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], times: [0, 0.55, 1] }}
      className={`absolute rounded-full pointer-events-none ${
        isBlackWhite ? '' : `bg-gradient-to-br ${color}`
      }`}
      style={{
        width: 260,
        height: 260,
        filter: 'blur(48px)',
        background: glowColor,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
}

function Particles({ color }) {
  const isBlackWhite = color === 'BLACK_WHITE';
  return (
    <>
      {PARTICLES.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = Math.cos(rad) * p.distance;
        const y = Math.sin(rad) * p.distance;
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{ opacity: [0, 0.9, 0], x, y, scale: [0, 1, 0.4] }}
            transition={{
              duration: 1.0,
              delay: p.delay,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`absolute rounded-full pointer-events-none ${
              isBlackWhite
                ? 'bg-white/60'
                : `bg-gradient-to-br ${color}`
            }`}
            style={{
              width: p.size,
              height: p.size,
              left: '50%',
              top: '50%',
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
            }}
          />
        );
      })}
    </>
  );
}

export default function BadgeCelebration({ data, onDismiss }) {
  const { badge, userName } = data;
  const color = getAchievementColor(badge?.title);
  const isBlackWhite = color === 'BLACK_WHITE';
  const scripture = BADGE_SCRIPTURES[badge?.title];
  const firstName = userName?.split(' ')[0];
  const hasName = firstName && firstName.length > 1 && firstName.length < 20;

  // Prevent background scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', stiffness: 340, damping: 26, delay: 0.06 }}
        className="w-full max-w-[340px] mx-6 bg-card border border-border rounded-[28px] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent strip */}
        <div
          className={`h-1 w-full ${isBlackWhite ? 'bg-gray-700' : `bg-gradient-to-r ${color}`}`}
        />

        <div className="flex flex-col items-center px-8 pt-9 pb-8">

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4 }}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6"
          >
            Badge Unlocked
          </motion.p>

          {/* Badge icon with glow + particles */}
          <div className="relative flex items-center justify-center mb-6" style={{ width: 96, height: 96 }}>
            <GlowRing color={color} />
            <Particles color={color} />
            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.14, type: 'spring', stiffness: 260, damping: 17 }}
              className={`relative z-10 w-20 h-20 flex items-center justify-center rounded-full shadow-xl ${
                isBlackWhite
                  ? 'bg-gray-900 border border-white/10'
                  : `bg-gradient-to-br ${color}`
              }`}
            >
              {getAchievementIcon(badge?.title, true, 'large')}
            </motion.div>
          </div>

          {/* Badge name */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.38 }}
            className="text-[24px] font-bold text-foreground text-center leading-tight mb-2"
          >
            {badge?.title}
          </motion.h2>

          {/* Badge subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.38 }}
            className="text-sm text-muted-foreground text-center leading-relaxed mb-5 max-w-[240px]"
          >
            {badge?.subtitle}
          </motion.p>

          {/* Scripture block */}
          {scripture && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44, duration: 0.4 }}
              className="w-full rounded-2xl bg-muted/60 border border-border px-5 py-4 mb-6 text-center"
            >
              <p className="text-[13px] text-foreground/80 leading-relaxed italic mb-2">
                "{scripture.text}"
              </p>
              <p className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase">
                {scripture.reference}
              </p>
            </motion.div>
          )}

          {/* No scripture spacer so layout stays balanced */}
          {!scripture && <div className="mb-6" />}

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: scripture ? 0.54 : 0.44, duration: 0.38 }}
            onClick={onDismiss}
            className="w-full py-4 rounded-2xl bg-foreground text-background font-semibold text-[15px] tracking-wide transition-opacity active:opacity-70"
          >
            Keep Building
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}