import React from 'react';
import { motion } from 'framer-motion';

export default function MomentumRings({ otPercent, ntPercent, currentStreak }) {
  const rings = [
    { percent: otPercent, color: 'hsl(var(--chart-1))', label: 'Old Testament', size: 220 },
    { percent: ntPercent, color: 'hsl(var(--chart-2))', label: 'New Testament', size: 160 },
  ];

  return (
    <div className="relative flex items-center justify-center h-64">
      <div className="bb-ambient" />
      {rings.map((ring, i) => {
        const radius = ring.size / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (ring.percent / 100) * circumference;

        return (
          <svg
            key={i}
            className="absolute"
            width={ring.size + 20}
            height={ring.size + 20}
            style={{ transform: 'rotate(-90deg)' }}
          >
            <circle
              cx={(ring.size + 20) / 2}
              cy={(ring.size + 20) / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <motion.circle
              cx={(ring.size + 20) / 2}
              cy={(ring.size + 20) / 2}
              r={radius}
              fill="none"
              stroke={ring.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
        );
      })}
      <div className="absolute text-center">
        <div className="text-3xl font-bold text-foreground">{currentStreak}</div>
        <div className="text-xs text-muted-foreground mt-1">day streak</div>
      </div>
    </div>
  );
}