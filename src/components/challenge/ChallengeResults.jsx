import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Zap, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MedalBadge from '@/components/challenge/MedalBadge';
import { MEDALS, medalFor, minScoreFor, medalRank } from '@/data/challenges';

export default function ChallengeResults({ challenge, questions, answers, previousBest, save, onRetake, onDone, onRetrySave }) {
  const total = questions.length;
  const score = answers.filter(Boolean).length;
  const medal = medalFor(score, total);
  const isNewBest = !previousBest || score > previousBest.score;
  const missed = questions.filter((_, i) => !answers[i]);
  const bestMedalId = previousBest ? medalFor(previousBest.score, previousBest.total)?.id : null;
  // Only point to a medal the reader hasn't already earned.
  const nextMedal = [...MEDALS].reverse().find((m) => minScoreFor(m, total) > score && medalRank(m.id) > medalRank(bestMedalId));

  useEffect(() => {
    if (medal?.id !== 'gold') return;
    const end = Date.now() + 900;
    const burst = () => {
      confetti({ particleCount: 40, spread: 70, startVelocity: 38, origin: { y: 0.35 }, colors: ['#FDE047', '#EAB308', '#22C55E', '#FFFFFF'] });
      if (Date.now() < end) setTimeout(burst, 250);
    };
    burst();
  }, [medal?.id]);

  const headline = medal?.id === 'gold' ? 'Perfect score!' : medal ? `${medal.label} medal!` : 'Keep studying';

  return (
    <div className="px-5 pb-12">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="flex flex-col items-center text-center pt-4"
      >
        <MedalBadge medalId={medal?.id} size={112} />
        <h1 className="text-3xl font-black text-foreground mt-5">{headline}</h1>
        <p className="text-5xl font-black text-foreground mt-2 tabular-nums">
          {score}<span className="text-2xl text-muted-foreground">/{total}</span>
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {isNewBest
            ? (previousBest ? 'New personal best!' : `Your first ${challenge.book} score.`)
            : `Your best is still ${previousBest.score}/${previousBest.total}.`}
          {nextMedal && ` ${minScoreFor(nextMedal, total)}/${total} earns ${nextMedal.label}.`}
        </p>
      </motion.div>

      <div className="mt-5 min-h-[44px] flex justify-center">
        {save.status === 'saving' && <p className="text-sm text-muted-foreground">Saving your score…</p>}
        {save.status === 'saved' && save.xpAwarded > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-bold text-amber-700 dark:text-amber-300"
            style={{ background: 'rgba(234,179,8,0.15)' }}
          >
            <Zap className="w-4 h-4" /> +{save.xpAwarded} XP for your {save.newMedals.map((id) => MEDALS.find((m) => m.id === id)?.label).join(' + ')} {save.newMedals.length > 1 ? 'medals' : 'medal'}
          </motion.div>
        )}
        {save.status === 'error' && (
          <button onClick={onRetrySave} className="text-sm font-semibold text-red-600 underline underline-offset-2">
            Couldn't save your score. Tap to try again.
          </button>
        )}
      </div>

      {missed.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Review what you missed</p>
          <div className="space-y-2.5">
            {missed.map((q) => (
              <div key={q.id} className="rounded-2xl border border-border bg-card px-4 py-3">
                <p className="text-sm font-semibold text-foreground leading-snug">{q.prompt}</p>
                <p className="text-sm mt-1.5" style={{ color: '#16A34A' }}>
                  {q.type === 'order' ? q.items.map((i) => i.text).join(' → ') : q.choices[q.answer]}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {q.type === 'order'
                    ? `${challenge.book} ${q.items[0].chapter}:${q.items[0].verse} – ${q.items[q.items.length - 1].chapter}:${q.items[q.items.length - 1].verse}`
                    : `${challenge.book} ${q.ref.chapter}:${q.ref.verse}${q.ref.to ? `–${q.ref.to}` : ''}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 space-y-2">
        <Button onClick={onRetake} size="lg" className="w-full h-14 rounded-full text-base font-bold">
          <RotateCcw className="w-4 h-4 mr-2" /> Retake with New Questions
        </Button>
        <Button onClick={onDone} variant="ghost" size="lg" className="w-full h-12 rounded-full font-semibold text-muted-foreground">
          Done
        </Button>
      </div>
    </div>
  );
}
