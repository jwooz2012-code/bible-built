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
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          style={{ background: 'linear-gradient(160deg, #0f2d1a 0%, #14532d 50%, #166534 100%)' }}
        >
          {/* Decorative sparkles */}
          {[
            'top-[8%] left-[12%]', 'top-[15%] right-[18%]', 'top-[30%] left-[5%]',
            'bottom-[25%] right-[8%]', 'bottom-[15%] left-[20%]', 'top-[50%] right-[4%]',
            'top-[6%] left-[45%]', 'bottom-[35%] left-[3%]', 'top-[22%] right-[6%]',
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} rounded-full bg-white/10`}
              style={{ width: `${6 + (i % 3) * 4}px`, height: `${6 + (i % 3) * 4}px` }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.88, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-sm w-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 12 }}
              className="text-7xl mb-6"
            >
              🎉
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-green-300 text-sm font-semibold uppercase tracking-widest mb-3"
            >
              Community Milestone
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white font-bold text-4xl leading-tight mb-4"
            >
              WOW! Over 10,000 Chapters & Counting!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-green-100 text-lg leading-relaxed mb-10"
            >
              You and the BibleBuilt community have read over{' '}
              <span className="text-white font-bold">TEN THOUSAND chapters</span> this April.
              Keep up the amazing work — keep tracking what truly matters. 📖
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleDismiss}
              className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', boxShadow: '0 8px 32px rgba(34,197,94,0.4)' }}
            >
              Let's Do It! 🚀
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}