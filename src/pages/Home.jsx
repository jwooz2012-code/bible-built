import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { base44 } from '@/api/base44Client';
import ThemeToggle from '@/components/ThemeToggle';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';
import { useDayReadingLogs } from '@/components/bible/hooks/useDayReadingLogs';
import { useToggleChapterRead } from '@/components/bible/hooks/useToggleChapterRead';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { getChapterIdsSet } from '@/components/bible/utils/logUtils';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    let mounted = true;
    base44.auth.me()
      .then(u => { if (mounted) { setUser(u); setIsLoading(false); } })
      .catch(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const userId = user?.id;
  const today = new Date().toISOString().slice(0, 10);
  
  const { data: todayLogs = [], isLoading: todayLoading } = useDayReadingLogs(userId, today);
  const { data: recentLogs = [], isLoading: recentLoading } = useReadingLogsRange(
    userId, 
    '2000-01-01', 
    new Date().toISOString().slice(0, 10)
  );

  const todayChapterIds = getChapterIdsSet(todayLogs);
  const { markRead, undoRead } = useToggleChapterRead();

  const handleToggleChapter = async (book, chapter) => {
    const chapterId = generateChapterId(book.index, chapter);
    const isRead = todayChapterIds.has(chapterId);
    
    if (isRead) {
      undoRead.mutate({
        userId,
        dateKey: today,
        chapterId,
      });
    } else {
      markRead.mutate({
        userId,
        dateKey: today,
        timestamp: new Date().toISOString(),
        book: book.name,
        bookIndex: book.index,
        chapter,
        chapterId,
        testament: book.testament,
      });
    }
  };

  const handleDeleteLog = async (logId) => {
    await base44.entities.ReadingLog.delete(logId);
  };

  const last10Logs = recentLogs
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {todayLoading ? '...' : `${todayLogs.length} Today`}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Mark chapters as you read</p>
        </motion.div>

        {selectedBook ? (
          <motion.div
            key={selectedBook.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedBook.name}</h2>
              <Button variant="ghost" onClick={() => setSelectedBook(null)}>Back</Button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chapter => {
                const chapterId = generateChapterId(selectedBook.index, chapter);
                const isRead = todayChapterIds.has(chapterId);
                return (
                  <button
                    key={chapter}
                    onClick={() => handleToggleChapter(selectedBook, chapter)}
                    disabled={markRead.isPending || undoRead.isPending}
                    className={`
                      aspect-square rounded-lg flex items-center justify-center font-semibold
                      transition-all hover:scale-105
                      ${isRead
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600'
                      }
                    `}
                  >
                    {chapter}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Select a Book</h2>
            <div className="space-y-6">
              {['OT', 'NT'].map(testament => (
                <div key={testament}>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    {testament === 'OT' ? 'Old Testament' : 'New Testament'}
                  </h3>
                  <div className="space-y-1">
                    {BIBLE_BOOKS.filter(b => b.testament === testament).map(book => (
                      <button
                        key={book.name}
                        onClick={() => setSelectedBook(book)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-left"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">{book.name}</span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          {recentLoading ? (
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : last10Logs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No reading logged yet</p>
          ) : (
            <div className="space-y-2">
              {last10Logs.map(log => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {log.book} {log.chapter}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLog(log.id)}
                    className="text-red-600 hover:text-red-700"
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