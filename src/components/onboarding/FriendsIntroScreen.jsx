import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/components/utils/haptics';
import { Hand } from 'lucide-react';

const MOCK_FRIENDS = [
  { initials: 'M', name: 'Marcus R.', streak: 14, level: 7, color: 'from-orange-500 to-orange-700' },
  { initials: 'S', name: 'Sarah K.', streak: 22, level: 9, color: 'from-violet-500 to-violet-700' },
];

const MOCK_GROUP = {
  name: 'The Faithful Five',
  members: [
    { initials: 'M', color: 'bg-orange-500' },
    { initials: 'J', color: 'bg-blue-500' },
    { initials: 'S', color: 'bg-violet-500' },
    { initials: 'R', color: 'bg-emerald-500' },
    { initials: 'T', color: 'bg-rose-500' },
  ],
  readToday: 4,
  total: 5,
  streak: 9,
};

export default function FriendsIntroScreen({ onContinue }) {
  const [fived, setFived] = useState(null);
  const [activating, setActivating] = useState(false);

  const handleHighFive = (name) => {
    triggerHaptic();
    setFived(name);
    setTimeout(() => setFived(null), 1400);
  };

  const handleContinue = () => {
    if (activating) return;
    setActivating(true);
    triggerHaptic();
    setTimeout(() => onContinue(), 280);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center px-6 pt-2 pb-10"
    >
      <motion.div
        initial={{ y: 22, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-full max-w-sm flex flex-col items-center space-y-5"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-foreground">Read Together</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Follow friends' streaks and cheer them on. Start a group to keep each other on track.
          </p>
        </div>

        <div className="w-full space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Friends</p>
          {MOCK_FRIENDS.map((f, idx) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.08 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-card"
            >
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${f.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-black text-sm">{f.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{f.name}</p>
                <p className="text-xs text-orange-500 font-semibold">🔥 {f.streak}d · Lvl {f.level}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => handleHighFive(f.name)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-600 text-xs font-bold transition-colors hover:bg-amber-500/25"
              >
                <AnimatePresence mode="wait">
                  {fived === f.name ? (
                    <motion.span
                      key="sent"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs"
                    >
                      🎉 Sent!
                    </motion.span>
                  ) : (
                    <motion.span key="hand" className="flex items-center gap-1">
                      <Hand className="w-3 h-3" /> 🙌
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          ))}
        </div>

        <div className="w-full space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Groups</p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="px-4 py-4 rounded-2xl border border-border bg-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-foreground">{MOCK_GROUP.name}</p>
                <p className="text-xs text-orange-500 font-semibold mt-0.5">🔥 {MOCK_GROUP.streak}-day group streak</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                {MOCK_GROUP.readToday}/{MOCK_GROUP.total} read today
              </span>
            </div>
            <div className="flex gap-1.5">
              {MOCK_GROUP.members.map((m, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${m.color} flex items-center justify-center`}>
                  <span className="text-white font-black text-xs">{m.initials}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${(MOCK_GROUP.readToday / MOCK_GROUP.total) * 100}%` }}
                transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        </div>

        <p className="text-xs text-muted-foreground/70 text-center">
          Tap 🙌 to try it. Find friends and groups in the Friends tab.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-8 w-full max-w-sm"
      >
        <motion.div whileTap={{ scale: 0.96 }}>
          <Button onClick={handleContinue} disabled={activating} size="lg" className="w-full h-14 rounded-full text-base font-bold">
            Next →
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
