import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { base44 } from '@/api/base44Client';
import ThemeToggle from '@/components/ThemeToggle';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';
import { useDayReadingLogs } from '@/components/bible/hooks/useDayReadingLogs';
import { useToggleChapterRead } from '@/components/bible/hooks/useToggleChapterRead';

export default function Home() {
  const [user, setUser] = useState(null);
  const [selectedBookIndex, setSelectedBookIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    base44.auth.me()
      .then(u => { if (mounted) { setUser(u); setIsLoading(false); } })
      .catch(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const userId = user?.id;

  const { data: todayLogs = [], isLoading: logsLoading } = useDayReadingLogs(userId, today);
  const { markRead, undoRead } = useToggleChapterRead();

  const selectedBook = BIBLE_BOOKS[selectedBookIndex];
  const chapters = Array.from({ length: selectedBook.chapters }, (_, i) => i + 1);

  const todayChapterIds = new Set(todayLogs.map(log => log.chapterId));

  const recentLogs = todayLogs.slice().reverse().slice(0, 10);

  const handleToggleChapter = (chapter) => {
    const chapterId = generateChapterId(selectedBookIndex, chapter);
    const isRead = todayChapterIds.has(chapterId);

    if (isRead) {
      undoRead.mutate({ userId, dateKey: today, chapterId });
    } else {
      markRead.mutate({
        userId,
        dateKey: today,
        timestamp: new Date().toISOString(),
        book: selectedBook.name,
        bookIndex: selectedBookIndex,
        chapter,
        chapterId,
        testament: selectedBook.testament,
      });
    }
  };

  const handleDeleteLog = (logId) => {
    base44.entities.ReadingLog.delete(logId).then(() => {
      undoRead.mutate({ userId, dateKey: today, chapterId: 'dummy' });
    });
  };

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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Bible Built</h1>
          <p className="text-gray-600 dark:text-gray-400">A life grounded in Scripture</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg mb-6"
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Book
          </label>
          <Select value={String(selectedBookIndex)} onValueChange={(v) => setSelectedBookIndex(Number(v))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BIBLE_BOOKS.map((book) => (
                <SelectItem key={book.index} value={String(book.index)}>
                  {book.name} ({book.chapters} chapters)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {selectedBook.name} - Chapters
          </h2>
          <div className="grid grid-cols-5 sm:grid-cols-7 gap-3">
            {chapters.map((chapter) => {
              const chapterId = generateChapterId(selectedBookIndex, chapter);
              const isRead = todayChapterIds.has(chapterId);
              
              return (
                <Button
                  key={chapter}
                  onClick={() => handleToggleChapter(chapter)}
                  disabled={markRead.isPending || undoRead.isPending}
                  className={`
                    aspect-square p-0 text-lg font-semibold transition-all
                    ${isRead
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white'
                    }
                  `}
                >
                  {isRead ? <Check className="w-5 h-5" /> : chapter}
                </Button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity (Today)
          </h2>
          {logsLoading ? (
            <div className="space-y-2">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : recentLogs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No chapters read today</p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {log.book} {log.chapter}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLog(log.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}