import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CalendarDays, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOUR_HIGHLIGHTS = [
  { icon: BookOpen, label: 'Log and read chapters', color: '#16A34A' },
  { icon: CalendarDays, label: 'Fix a missed day', color: '#EF4444' },
  { icon: Users, label: 'Read with friends and groups', color: '#3B82F6' },
  { icon: Zap, label: 'Earn XP and collect artifacts', color: '#F59E0B' },
];

export default function TourOfferScreen({ name, planName, onTour, onSkip, isSaving }) {
  const firstName = name?.trim().split(/\s+/)[0];
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col px-6 pt-4 pb-8"
    >
      <h1 className="text-3xl font-black mb-2 text-foreground">
        You're all set{firstName ? `, ${firstName}` : ''}.
      </h1>
      <p className="text-base text-muted-foreground mb-8">
        {planName
          ? <>Your plan starts today: <span className="font-semibold text-foreground">{planName}</span>.</>
          : 'Read any book, any day. Every chapter counts.'}
      </p>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-baseline justify-between mb-4">
          <p className="font-bold text-foreground">Want a quick tour?</p>
          <p className="text-xs font-semibold text-muted-foreground">About 1 minute</p>
        </div>
        <div className="space-y-3">
          {TOUR_HIGHLIGHTS.map(({ icon: Icon, label, color }, idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.06 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}1F` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-sm font-medium text-foreground">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-2">
        <motion.div whileTap={{ scale: isSaving ? 1 : 0.98 }}>
          <Button
            onClick={onTour}
            disabled={isSaving}
            size="lg"
            className="w-full h-14 rounded-full font-bold"
          >
            {isSaving ? 'Setting up…' : 'Show Me Around'}
          </Button>
        </motion.div>
        <Button
          onClick={onSkip}
          disabled={isSaving}
          variant="ghost"
          size="lg"
          className="w-full h-12 rounded-full font-semibold text-muted-foreground"
        >
          Skip for now
        </Button>
      </div>
    </motion.div>
  );
}
