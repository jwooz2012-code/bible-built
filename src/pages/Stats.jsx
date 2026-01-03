import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Book, ScrollText, Calendar, TrendingUp, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProgressRing from '@/components/bible/ProgressRing';
import ThemeToggle from '@/components/ThemeToggle';
import { useBookProgress } from '@/components/bible/useBookProgress';
import { TOTAL_CHAPTERS } from '@/components/bible/bibleData';
import { base44 } from '@/api/base44Client';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';

export default function Stats() {
  const { isLoading, calculateStats } = useBookProgress();
  const [me, setMe] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    base44.auth.me().then(u => { 
      if (mounted) setMe(u); 
    }).catch(() => setMe(null));
    return () => { mounted = false; };
  }, []);

  const userId = me?.id;
  const stats = calculateStats();

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);
  const monthEndStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;
  const yearStart = `${currentYear}-01-01`;
  const yearEnd = `${currentYear}-12-31`;

  const { data: monthLogs = [] } = useReadingLogsRange(userId, monthStart, monthEndStr);
  const { data: yearLogs = [] } = useReadingLogsRange(userId, yearStart, yearEnd);

  const thisMonthChapters = monthLogs.length;
  const thisYearChapters = yearLogs.length;
  const daysInWord = new Set(yearLogs.map(log => log.date)).size;
  const avgPerDay = daysInWord > 0 ? (thisYearChapters / daysInWord).toFixed(1) : 0;

  const oldTestamentPercent = Math.round((stats.oldTestamentChaptersRead / stats.oldTestamentTotalChapters) * 100);
  const newTestamentPercent = Math.round((stats.newTestamentChaptersRead / stats.newTestamentTotalChapters) * 100);

  if (!me || isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 p-4">
        <div className="max-w-lg mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 w-full rounded-3xl" />
          <div className="grid grid-cols-2 gap-3">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <ThemeToggle />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">Statistics</h1>
            <p className="text-base text-gray-500 dark:text-gray-400">Your reading journey</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700 mb-6"
        >
          <div className="text-center">
            <ProgressRing progress={stats.overallProgress} size={140} strokeWidth={10}>
              <div className="text-center">
                <p className="text-3xl font-bold text-black dark:text-white">{stats.overallProgress}%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Complete</p>
              </div>
            </ProgressRing>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              {stats.totalChaptersRead} of {TOTAL_CHAPTERS.toLocaleString()} chapters read
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-2 mb-3">
              <ScrollText className="w-4 h-4 text-slate-900 dark:text-slate-50" />
              <span className="text-sm font-medium text-slate-900 dark:text-slate-50">Old Testament</span>
            </div>
            <ProgressRing progress={oldTestamentPercent} size={70} strokeWidth={6}>
              <span className="text-sm font-bold text-black dark:text-white">{oldTestamentPercent}%</span>
            </ProgressRing>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {stats.oldTestamentChaptersRead}/{stats.oldTestamentTotalChapters} chapters
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-2 mb-3">
              <Book className="w-4 h-4 text-slate-900 dark:text-slate-50" />
              <span className="text-sm font-medium text-slate-900 dark:text-slate-50">New Testament</span>
            </div>
            <ProgressRing progress={newTestamentPercent} size={70} strokeWidth={6}>
              <span className="text-sm font-bold text-black dark:text-white">{newTestamentPercent}%</span>
            </ProgressRing>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {stats.newTestamentChaptersRead}/{stats.newTestamentTotalChapters} chapters
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="mb-3">
            <h2 className="text-lg font-bold text-black dark:text-white">This Month</h2>
          </div>
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Chapters Read</span>
            </div>
            <p className="text-2xl font-bold text-black dark:text-white">{thisMonthChapters}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="mb-3">
            <h2 className="text-lg font-bold text-black dark:text-white">This Year</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Chapters</span>
              </div>
              <p className="text-2xl font-bold text-black dark:text-white">{thisYearChapters}</p>
            </div>
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Days</span>
              </div>
              <p className="text-2xl font-bold text-black dark:text-white">{daysInWord}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="outline"
            onClick={() => base44.auth.logout()}
            className="w-full border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}