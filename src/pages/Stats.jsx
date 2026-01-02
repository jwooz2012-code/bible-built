import React, { useMemo } from 'react';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function Stats() {
  const { isLoading, calculateStats } = useBookProgress();
  const queryClient = useQueryClient();
  const stats = calculateStats();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch reading logs for yearly stats
  const { data: readingLogs = [] } = useQuery({
    queryKey: ['readingLogs', user?.id],
    queryFn: async () => {
      return await base44.entities.ReadingLog.list();
    },
    enabled: !!user?.id,
    staleTime: 0,
  });



  // Calculate yearly stats
  const yearlyStats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const thisYearLogs = readingLogs.filter(log => {
      const logDate = new Date(log.occurred_at);
      return logDate.getFullYear() === currentYear;
    });

    const chaptersRead = thisYearLogs.length;
    const uniqueDates = new Set(thisYearLogs.map(log => log.local_date));
    const daysInWord = uniqueDates.size;
    const avgPerDay = daysInWord > 0 ? (chaptersRead / daysInWord).toFixed(1) : 0;

    return { chaptersRead, daysInWord, avgPerDay };
  }, [readingLogs]);



  const oldTestamentPercent = Math.round((stats.oldTestamentChaptersRead / stats.oldTestamentTotalChapters) * 100);
  const newTestamentPercent = Math.round((stats.newTestamentChaptersRead / stats.newTestamentTotalChapters) * 100);

  if (isLoading) {
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
        {/* Header */}
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

        {/* Overall Progress */}
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

        {/* Testament Progress */}
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

        {/* This Year Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="mb-3">
            <h2 className="text-lg font-bold text-black dark:text-white">This Year</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Chapters Read</span>
              </div>
              <p className="text-2xl font-bold text-black dark:text-white">{yearlyStats.chaptersRead}</p>
            </div>
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Days in the Word</span>
              </div>
              <p className="text-2xl font-bold text-black dark:text-white">{yearlyStats.daysInWord}</p>
            </div>
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700 col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Chapters per Day</span>
              </div>
              <p className="text-2xl font-bold text-black dark:text-white">{yearlyStats.avgPerDay}</p>
            </div>
          </div>
        </motion.div>

        {/* Lifetime Completions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="mb-3">
            <h2 className="text-lg font-bold text-black dark:text-white">Lifetime Completions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Based on your reading history</p>
          </div>
          <div className="space-y-3">
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Full Bible</p>
              <p className="text-2xl font-bold text-black dark:text-white">
                {stats.fullBibleComplete || 0} {stats.fullBibleComplete === 1 ? 'time' : 'times'}
              </p>
            </div>
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Old Testament</p>
              <p className="text-2xl font-bold text-black dark:text-white">
                {stats.oldTestamentComplete || 0} {stats.oldTestamentComplete === 1 ? 'time' : 'times'}
              </p>
            </div>
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">New Testament</p>
              <p className="text-2xl font-bold text-black dark:text-white">
                {stats.newTestamentComplete || 0} {stats.newTestamentComplete === 1 ? 'time' : 'times'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sign Out Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <Button
            variant="outline"
            onClick={async () => {
              queryClient.clear();
              await base44.auth.logout();
            }}
            className="w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-gray-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>


    </div>
  );
}