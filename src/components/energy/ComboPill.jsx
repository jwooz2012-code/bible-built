import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function ComboPill({ todayCount = 0 }) {
  const combo = todayCount >= 5 ? 'x5' : todayCount >= 3 ? 'x3' : todayCount >= 2 ? 'x2' : 'x1';
  const comboColor = {
    'x5': 'text-accent',
    'x3': 'text-primary',
    'x2': 'text-chart-2',
    'x1': 'text-muted-foreground'
  }[combo];

  if (todayCount === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bb-energy-card rounded-full"
    >
      <Zap className={`w-3.5 h-3.5 ${comboColor}`} fill="currentColor" />
      <span className={`text-sm font-bold ${comboColor}`}>{combo} COMBO</span>
    </motion.div>
  );
}