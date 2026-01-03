import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trophy, Flame, ChevronRight, RotateCcw, CalendarDays, BookMarked } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

import ProgressRing from '@/components/bible/ProgressRing';
import BookCard from '@/components/bible/BookCard';
import StatsCard from '@/components/bible/StatsCard';
import ThemeToggle from '@/components/ThemeToggle';
import WeekCalendar from '@/components/bible/WeekCalendar';
import { useBookProgress } from '@/components/bible/useBookProgress';
import { BIBLE_BOOKS, ACHIEVEMENTS } from '@/components/bible/bibleData';

export default function Home() {
  const [testament, setTestament] = useState('all');
  const { achievements, isLoading, checkAchievements } = useBookProgress();

  const queryClient = useQueryClient();

  const [me, setMe] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    base44.auth.me().then(u => { if (mounted) setMe(u); }).catch(() => setMe(null));
    return () => { mounted = false; };
  }, []);

  const userId = me?.id;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);
  const monthEndStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;

  const yearStart = `${currentYear}-01-01`;
  const yearEnd = `${currentYear}-12-31`;

  const { data: monthLogs = [] } = useQuery({
    queryKey: ['readingLogs', userId, monthStart, monthEndStr],
    queryFn: async () => {
      const logs = await base44.entities.ReadingLog.filter({ user_id: userId });
      return logs.filter(log => log.date >= monthStart && log.date <= monthEndStr);
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: yearLogs = [] } = useQuery({
    queryKey: ['readingLogs', userId, yearStart, yearEnd],
    queryFn: async () => {
      const logs = await base44.entities.ReadingLog.filter({ user_id: userId });
      return logs.filter(log => log.date >= yearStart && log.date <= yearEnd);
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: allLogs = [] } = useQuery({
    queryKey: ['readingLogs', userId],
    queryFn: async () => {
      return await base44.entities.ReadingLog.filter({ user_id: userId });
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const addLogMutation = useMutation({
    mutationFn: async ({ localDate, bookIndex, chapter }) => {
      const user = await base44.auth.me();
      
      return await base44.entities.ReadingLog.create({
        user_id: user.id,
        date: localDate,
        book_index: bookIndex,
        chapter: chapter,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['readingLogs', userId] });
      queryClient.invalidateQueries({ queryKey: ['readingLogsByBook', userId, variables.bookIndex] });
      toast.success('Chapter added');
      setTimeout(() => checkAchievements(), 500);
    },
  });

  const removeLogMutation = useMutation({
    mutationFn: async ({ logId, bookIndex }) => {
      return await base44.entities.ReadingLog.delete(logId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['readingLogs', userId] });
      queryClient.invalidateQueries({ queryKey: ['readingLogsByBook', userId, variables.bookIndex] });
      toast.success('Chapter removed');
    },
  });

  const unlockedAchievements = achievements.map(a => a.achievement_id);

  const filteredBooks = testament === 'all' 
    ? BIBLE_BOOKS 
    : BIBLE_BOOKS.filter(b => b.testament === testament);

  const bookProgress = {};
  allLogs.forEach(log => {
    const bookIndex = log.book_index;
    if (!bookProgress[bookIndex]) {
      bookProgress[bookIndex] = new Set();
    }
    bookProgress[bookIndex].add(Number(log.chapter));
  });

  const recentlyRead = Object.entries(bookProgress)
    .map(([bookIndex, chaptersSet]) => {
      const book = BIBLE_BOOKS[Number(bookIndex)];
      if (!book) return null;
      const logs = allLogs.filter(l => l.book_index === Number(bookIndex));
      const lastRead = logs.length > 0 ? Math.max(...logs.map(l => new Date(l.date).getTime())) : 0;
      return {
        book_name: book.name,
        chapters_read: Array.from(chaptersSet),
        last_read_date: new Date(lastRead).toISOString(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.last_read_date) - new Date(a.last_read_date))
    .slice(0, 2);

  const chaptersThisMonth = monthLogs.length;
  const chaptersThisYear = yearLogs.length;

  const handleAddMultipleChapters = async (localDate, bookIndex, chapters) => {
    for (const chapter of chapters) {
      await addLogMutation.mutateAsync({ localDate, bookIndex, chapter });
    }
  };

  const handleMarkBookComplete = async (localDate, bookIndex) => {
    const book = BIBLE_BOOKS[bookIndex];
    const allChapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
    
    for (const chapter of allChapters) {
      await addLogMutation.mutateAsync({ localDate, bookIndex, chapter });
    }
  };

  const handleRemoveLog = async (logId, bookIndex) => {
    await removeLogMutation.mutateAsync({ logId, bookIndex });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4 pb-24">
        <div className="max-w-lg mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full rounded-3xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <ThemeToggle />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Built by the Word</h1>
          <p className="text-gray-600 dark:text-slate-400 text-base">A life grounded in Scripture</p>
        </motion.div>

        {/* Week Calendar */}
        <WeekCalendar 
          onAddChapters={handleAddMultipleChapters}
          onMarkComplete={handleMarkBookComplete}
          onRemoveLog={handleRemoveLog}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link to={createPageUrl('ReadingCalendar?view=month')} className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all hover:scale-105 h-full"
            >
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-slate-400">This Month</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{chaptersThisMonth}</p>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">chapters read</p>
            </motion.div>
          </Link>

          <Link to={createPageUrl('ReadingCalendar?view=year')} className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all hover:scale-105 h-full"
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-slate-400">This Year</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{chaptersThisYear}</p>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">chapters read</p>
            </motion.div>
          </Link>
        </div>

        {/* Continue in the Word */}
        {recentlyRead.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Continue in the Word</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {recentlyRead.map((progress, i) => {
                const book = BIBLE_BOOKS.find(b => b.name === progress.book_name);
                if (!book) return null;
                return (
                  <Link 
                    key={progress.id} 
                    to={createPageUrl(`BookDetail?book=${encodeURIComponent(book.name)}`)}
                    className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <p className="font-bold text-gray-900 dark:text-slate-100 text-base mb-1">{book.name}</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      {progress.chapters_read?.length || 0}/{book.chapters} chapters
                    </p>
                  </Link>
                );
              })}
            </div>
          </motion.div>
          )}

        {/* Books List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Books of the Bible</h3>
          </div>

          <Tabs value={testament} onValueChange={setTestament} className="mb-4">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-slate-800/80 dark:backdrop-blur-sm dark:border dark:border-slate-700/50">
              <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
              <TabsTrigger value="old" className="text-sm">Old Testament</TabsTrigger>
              <TabsTrigger value="new" className="text-sm">New Testament</TabsTrigger>
            </TabsList>
          </Tabs>

          <AnimatePresence mode="wait">
            <motion.div
              key={testament}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-4"
            >
              {filteredBooks.map((book, i) => {
                const chaptersRead = bookProgress[book.index] || new Set();
                const progress = {
                  chapters_read: Array.from(chaptersRead),
                  completion_count: chaptersRead.size === book.chapters ? 1 : 0,
                };
                return (
                  <BookCard
                    key={book.name}
                    book={book}
                    progress={progress}
                    index={i}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}