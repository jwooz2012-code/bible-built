import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { triggerHaptic } from '@/components/utils/haptics';

// Mock badge colors matching the real app badge colors
const MOCK_BADGES = [
  { bg: '#1a1a2e' },   // dark/black
  { bg: '#0ea5e9' },   // blue
  { bg: '#10b981' },   // green
  { bg: '#f59e0b' },   // amber
  { bg: '#f97316' },   // orange
  { bg: '#8b5cf6' },   // purple
  { bg: '#ef4444' },   // red
  { bg: '#059669' },   // emerald
  { bg: '#6b7280' },   // gray
  { bg: '#3b82f6' },   // blue2
];

export default function AccountabilityScreen({ onContinue }) {
  const [isActivating, setIsActivating] = useState(false);

  const handleContinue = () => {
    if (isActivating) return;
    setIsActivating(true);
    triggerHaptic();
    setTimeout(() => onContinue(), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 pb-24"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="w-full max-w-sm flex flex-col items-center space-y-6"
      >
        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-foreground">Accountability</h1>
          <p className="text-sm text-muted-foreground">
            Share your progress and inspire others
          </p>
        </div>

        {/* Share Card — mirrors the real ShareSummary weekly card */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          className="w-full rounded-3xl overflow-hidden"
          style={{ backgroundColor: '#0A0A0A' }}
        >
          <div className="flex flex-col px-5 py-5 gap-3">

            {/* Header */}
            <div className="text-center">
              <h2 className="text-xl font-black tracking-tight" style={{ color: '#FAFAFA' }}>
                This Week
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#A1A1AA' }}>
                Mar 22 – Mar 28
              </p>
            </div>

            {/* Hero stat */}
            <div
              className="flex flex-col items-center justify-center rounded-2xl py-4"
              style={{ backgroundColor: '#1F1F1F', boxShadow: '0 6px 24px rgba(0,0,0,0.4)' }}
            >
              <div className="text-5xl font-black leading-none mb-1.5" style={{ color: '#FFFFFF' }}>
                8
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>
                Chapters Read
              </div>
            </div>

            {/* 2×2 stats grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'DAYS', value: '3', isText: false },
                { label: 'BOOKS', value: '3', isText: false },
                { label: 'MOST READ BOOK', value: 'Acts', isText: true },
                { label: 'BEST DAY', value: '4', isText: false },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center py-3 px-3 rounded-xl min-h-[64px]"
                  style={{ backgroundColor: '#171717' }}
                >
                  <div
                    className={`font-black leading-none ${stat.isText ? 'text-lg' : 'text-3xl'}`}
                    style={{ color: '#FFFFFF' }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-[8px] font-bold uppercase tracking-wider mt-1 text-center"
                    style={{ color: '#71717A' }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: '#94A3B8' }}>
                Earned Badges
              </div>
              <div className="grid grid-cols-5 gap-2">
                {MOCK_BADGES.map((badge, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full"
                    style={{
                      backgroundColor: badge.bg,
                      boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
                      border: badge.bg === '#1a1a2e' ? '1px solid rgba(255,255,255,0.15)' : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Branding */}
            <div className="flex flex-col items-center gap-1 pt-1">
              <div className="flex items-center gap-2">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6953bfa67629f34f674461da/6d21a8071_AppIcon.png"
                  alt="Bible Built"
                  className="w-5 h-5 rounded-md"
                  style={{ opacity: 0.85 }}
                />
                <span className="text-sm font-bold tracking-wide" style={{ color: '#D4D4D8' }}>
                  Bible Built
                </span>
              </div>
              <span className="text-[10px] font-semibold tracking-wide" style={{ color: '#71717A' }}>
                Track what matters
              </span>
            </div>
          </div>
        </motion.div>

        <p className="text-xs text-center text-muted-foreground opacity-60">
          Found on your Profile page → Share Summary
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="mt-8 w-full max-w-sm"
      >
        <motion.div whileTap={{ scale: 0.96 }} transition={{ duration: 0.1 }}>
          <Button
            onClick={handleContinue}
            disabled={isActivating}
            size="lg"
            className="w-full h-14 rounded-full text-base font-bold"
          >
            {isActivating ? 'Continue...' : 'Next'}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}