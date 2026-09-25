import React from 'react';
import { Medal, Lock } from 'lucide-react';
import { MEDALS } from '@/data/challenges';

const GRADIENTS = {
  gold: 'linear-gradient(135deg, #FDE047, #EAB308 55%, #B45309)',
  silver: 'linear-gradient(135deg, #F1F5F9, #94A3B8 55%, #475569)',
  bronze: 'linear-gradient(135deg, #FDBA74, #C2410C 55%, #7C2D12)',
};

export default function MedalBadge({ medalId, size = 44, locked = false }) {
  const medal = MEDALS.find((m) => m.id === medalId);
  const iconSize = Math.round(size * 0.5);

  if (locked || !medal) {
    return (
      <div
        className="rounded-full flex items-center justify-center shrink-0"
        style={{ width: size, height: size, background: 'hsl(var(--muted))', border: '2px dashed hsl(var(--border))' }}
      >
        {locked
          ? <Lock style={{ width: iconSize * 0.8, height: iconSize * 0.8 }} className="text-muted-foreground" />
          : <Medal style={{ width: iconSize, height: iconSize }} className="text-muted-foreground/60" />}
      </div>
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: GRADIENTS[medal.id], boxShadow: `0 4px 14px ${medal.color}66, inset 0 1px 0 rgba(255,255,255,0.5)` }}
      aria-label={`${medal.label} medal`}
    >
      <Medal style={{ width: iconSize, height: iconSize, color: '#fff' }} strokeWidth={2.2} />
    </div>
  );
}
