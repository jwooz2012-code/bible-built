import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { base44 } from '@/api/base44Client';
import ThemeToggle from '@/components/ThemeToggle';
import ProgressRing from '@/components/bible/ProgressRing';
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <Skeleton className="h-20 w-64" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-24">
      <ThemeToggle />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Statistics</h1>
          <p className="text-gray-600 dark:text-gray-400">Your reading progress</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            This Year ({currentYear})
          </h2>

          {yearLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Chapters</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{yearStats.totalCount}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {yearStats.totalCount} of {TOTAL_CHAPTERS}
                  </p>
                </div>
                <ProgressRing progress={yearStats.totalPercent} size={100} strokeWidth={8}>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{yearStats.totalPercent}%</span>
                </ProgressRing>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Old Testament</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{yearStats.otCount}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{yearStats.otPercent}%</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">New Testament</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{yearStats.ntCount}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{yearStats.ntPercent}%</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Lifetime
          </h2>

          {lifetimeLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Times Through the Bible</p>
                <p className="text-5xl font-bold text-green-600 dark:text-green-400">{lifetimeStats.timesThroughBible}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {lifetimeStats.percentToNext}% progress to next ({lifetimeStats.progressToNext}/{TOTAL_CHAPTERS})
                </p>
              </div>

              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Total Chapters Read</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{lifetimeStats.totalCount}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Old Testament</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{lifetimeStats.otCount}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">New Testament</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{lifetimeStats.ntCount}</p>
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