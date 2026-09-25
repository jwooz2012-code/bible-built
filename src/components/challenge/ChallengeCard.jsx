import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { MEDALS } from '@/data/challenges';
import MedalBadge from '@/components/challenge/MedalBadge';

export default function ChallengeCard({ challenge, chapterCount, readCount, summary, onOpen }) {
  const unlocked = readCount >= chapterCount;
  const best = summary?.best;
  const bestMedal = MEDALS.find((m) => m.id === best?.medal);

  let detail;
  if (!unlocked) detail = `Finish all ${chapterCount} chapters to unlock · ${readCount}/${chapterCount} read`;
  else if (best) detail = `Best: ${best.score}/${best.total}${bestMedal ? ` · ${bestMedal.label}` : ''}`;
  else detail = `${challenge.questionsPerTest} questions · Earn Bronze, Silver, or Gold`;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
      className="w-full text-left rounded-2xl px-4 py-3.5 flex items-center gap-3.5 border transition-colors"
      style={unlocked ? {
        background: 'color-mix(in srgb, rgb(234,179,8) 7%, hsl(var(--card)) 93%)',
        borderColor: 'color-mix(in srgb, rgb(234,179,8) 30%, hsl(var(--border)) 70%)',
      } : {
        background: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
      }}
    >
      <MedalBadge medalId={best?.medal} locked={!unlocked} size={42} />
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-foreground">{challenge.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </motion.button>
  );
}
