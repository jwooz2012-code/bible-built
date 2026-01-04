import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { useReadingStats } from '@/components/bible/hooks/useReadingStats';
import { TOTAL_CHAPTERS } from '@/components/bible/bibleData';

export default function Stats() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    base44.auth.me()
      .then(u => { if (mounted) { setUser(u); setIsLoading(false); } })
      .catch(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const userId = user?.id;
  const currentYear = new Date().getFullYear();
  const yearStart = `${currentYear}-01-01`;
  const yearEnd = `${currentYear}-12-31`;

  const { data: yearLogs = [], isLoading: yearLoading } = useReadingLogsRange(userId, yearStart, yearEnd);
  const { data: lifetimeLogs = [], isLoading: lifetimeLoading } = useReadingLogsRange(userId, '2000-01-01', '2099-12-31');

  const yearStats = useReadingStats(yearLogs);
  const lifetimeStats = useReadingStats(lifetimeLogs);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-20 w-64" />
      </div>
    );
  }

  if (!user || !userId) {
    base44.auth.redirectToLogin();
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <PageHeader title="Statistics" subtitle="Your reading progress" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 mb-4"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              This Year ({currentYear})
            </h2>
            <div className="w-16 h-[1px] bg-[#2F3E5C] opacity-70" />
          </div>

          {yearLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total Progress</span>
                  <span className="text-2xl font-semibold text-foreground">
                    {yearStats.totalCount} <span className="text-sm text-muted-foreground">/ {TOTAL_CHAPTERS}</span>
                  </span>
                </div>
                <div className="relative w-full h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${Math.max(0, Math.min(100, yearStats.totalPercent || 0))}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Old Testament</p>
                  <p className="text-2xl font-semibold text-foreground">{yearStats.otCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">{yearStats.otPercent}%</p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">New Testament</p>
                  <p className="text-2xl font-semibold text-foreground">{yearStats.ntCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">{yearStats.ntPercent}%</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Lifetime</h2>
            <div className="w-16 h-[1px] bg-[#2F3E5C] opacity-70" />
          </div>

          {lifetimeLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center bg-accent/10 rounded-xl p-6">
                <p className="text-sm text-muted-foreground mb-2">Times Through the Bible</p>
                <p className="text-5xl font-bold text-accent">{lifetimeStats.timesThroughBible}</p>
                <p className="text-xs text-muted-foreground mt-3">
                  {lifetimeStats.percentToNext}% to next ({lifetimeStats.progressToNext}/{TOTAL_CHAPTERS})
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Chapters Read</p>
                <p className="text-4xl font-semibold text-foreground mb-4">{lifetimeStats.totalCount}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Old Testament</p>
                    <p className="text-2xl font-semibold text-foreground">{lifetimeStats.otCount}</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">New Testament</p>
                    <p className="text-2xl font-semibold text-foreground">{lifetimeStats.ntCount}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}