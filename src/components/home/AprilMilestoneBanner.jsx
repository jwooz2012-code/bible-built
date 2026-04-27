import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'bb_april_10k_dismissed';

export default function AprilMilestoneBanner() {
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(STORAGE_KEY));

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
          style={{ background: 'radial-gradient(ellipse at 50% 30%, #166534 0%, #052e16 70%)' }}
        >
          {/* Glow blobs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] left-[20%] w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.18), transparent 70%)', filter: 'blur(20px)' }} />
            <div className="absolute bottom-[15%] right-[10%] w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(134,239,172,0.14), transparent 70%)', filter: 'blur(20px)' }} />
            <div className="absolute top-[50%] left-[5%] w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.1), transparent 70%)', filter: 'blur(15px)' }} />
          </div>

          <div className="relative text-center px-10 max-w-sm w-full">

            {/* Emoji */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: [0, 1.3, 1], rotate: ['-30deg', '8deg', '0deg'] }}
              transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
              className="text-7xl mb-6 select-none"
            >
              🎉
            </motion.div>

            {/* Label */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-green-400 text-xs font-bold uppercase tracking-[0.25em] mb-3"
            >
              Community Milestone
            </motion.p>

            {/* Hero number */}
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 140, damping: 12 }}
              className="font-black leading-none select-none"
              style={{
                fontSize: 'clamp(88px, 28vw, 120px)',
                background: 'linear-gradient(160deg, #ffffff 0%, #86efac 45%, #4ade80 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.04em',
                lineHeight: 0.9,
              }}
            >
              10K
            </motion.p>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="text-green-200/70 text-lg font-semibold tracking-[0.15em] uppercase mt-3 mb-8"
            >
              Chapters Read{' '}
              <span className="text-white font-black">This April</span>
            </motion.p>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.75, duration: 0.5 }}
              className="w-16 h-px bg-green-500/40 mx-auto mb-8"
            />

            {/* Invite line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="text-green-300/70 text-sm leading-relaxed mb-10"
            >
              Invite a friend to track what matters with us.
            </motion.p>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.4, ease: 'easeOut' }}
              whileTap={{ scale: 0.96 }}
              onClick={handleDismiss}
              className="w-full py-5 rounded-3xl font-black text-xl select-none tracking-wide"
              style={{
                background: 'linear-gradient(135deg, #15803d 0%, #22c55e 60%, #4ade80 100%)',
                boxShadow: '0 0 50px rgba(34,197,94,0.5), 0 6px 24px rgba(0,0,0,0.4)',
                color: '#fff',
                letterSpacing: '0.04em',
                textShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}
            >
              Let's Do It! 🚀
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}