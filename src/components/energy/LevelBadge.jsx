import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

export default function LevelBadge({ weeklyCount = 0 }) {
  const level = Math.floor(weeklyCount / 3) + 1;

  return (
    <motion.div
      initial={{ rotate: -12, scale: 0.9, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      className="bb-energy-card rounded-2xl px-4 py-3 text-center"
    >
      <Award className="w-6 h-6 mx-auto mb-1 text-accent" />
      <div className="text-2xl font-bold text-foreground">Lvl {level}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">This Week</div>
    </motion.div>
  );
}