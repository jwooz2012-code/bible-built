import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/components/utils/haptics';
import { Plus } from 'lucide-react';

const MOCK_GROUPS = [
  {
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
  },
  {
    name: 'Morning Warriors',
    members: [
      { initials: 'A', color: 'bg-amber-500' },
      { initials: 'D', color: 'bg-cyan-500' },
      { initials: 'K', color: 'bg-pink-500' },
    ],
    readToday: 3,
    total: 3,
    streak: 21,
  },
];

export default function GroupsIntroScreen({ onContinue }) {
  const [activating, setActivating] = useState(false);

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
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 pb-24 pt-6"
    >
      <motion.div
        initial={{ y: 22, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-full max-w-sm flex flex-col items-center space-y-6"
      >
        {/* NEW badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 18 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 text-xs font-bold tracking-wide"
        >
          <span>✨</span> NEW
        </motion.div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-foreground">Build Your Squad</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Start or join an accountability group. Read together. Rise together.
          </p>
        </div>

        {/* Group cards */}
        <div className="w-full space-y-3">
          {MOCK_GROUPS.map((g, idx) => (
            <motion.div
              key={g.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + idx * 0.1 }}
              className="px-4 py-4 rounded-2xl border border-border bg-card"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-foreground">{g.name}</p>
                  <p className="text-xs text-orange-500 font-semibold mt-0.5">🔥 {g.streak}-day group streak</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                  {g.readToday}/{g.total} read today
                </span>
              </div>
              {/* Member avatars */}
              <div className="flex gap-1.5">
                {g.members.map((m, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${m.color} flex items-center justify-center`}>
                    <span className="text-white font-black text-xs">{m.initials}</span>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(g.readToday / g.total) * 100}%` }}
                  transition={{ delay: 0.5 + idx * 0.1, duration: 0.7, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Create group CTA preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-border text-muted-foreground"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Create a new group…</span>
        </motion.div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="mt-10 w-full max-w-sm"
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
