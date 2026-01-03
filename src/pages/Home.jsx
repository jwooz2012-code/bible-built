import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import BookCard from '@/components/shared/BookCard';
import ChapterTile from '@/components/shared/ChapterTile';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';
import { useDayReadingLogs } from '@/components/bible/hooks/useDayReadingLogs';
import { useToggleChapterRead } from '@/components/bible/hooks/useToggleChapterRead';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { getChapterIdsSet } from '@/components/bible/utils/logUtils';
import { calculateBookProgress } from '@/components/bible/utils/bookProgress';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => {
    let mounted = true;
    base44.auth.me()
      .then(u => { if (mounted) { setUser(u); setIsLoading(false); } })
      .catch(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const userId = user?.id;
  const today = new Date().toISOString().slice(0, 10);
  const { data: todayLogs = [] } = useDayReadingLogs(userId, today);
  const { data: allTimeLogs = [] } = useReadingLogsRange(userId, '2000-01-01', '2099-12-31');

  const todayChapterIds = getChapterIdsSet(todayLogs);
  const { markRead, undoRead } = useToggleChapterRead();

  const getBookProgress = (book) => {
    const bookLogs = allTimeLogs.filter(log => log.bookIndex === book.index);
    return calculateBookProgress(bookLogs, book.chapters);
  };

  const getBookTodayCount = (bookIndex) => {
    return todayLogs.filter(log => log.bookIndex === bookIndex).length;
  };

  const handleChapterAction = async (action) => {
    if (!selectedChapter) return;
    if (!userId) {
      toast.error('Please log in again');
      return;
    }
    
    const { book, chapter, chapterId, isRead } = selectedChapter;
    
    try {
      if (action === 'mark' && !isRead) {
        await markRead.mutateAsync({
          userId,
          dateKey: today,
          timestamp: new Date().toISOString(),
          book: book.name,
          bookIndex: book.index,
          chapter,
          chapterId,
          testament: book.testament,
        });
      } else if (action === 'undo' && isRead) {
        await undoRead.mutateAsync({ userId, dateKey: today, chapterId });
      }
      setSelectedChapter(null);
    } catch (error) {
      console.error('Chapter action failed:', error);
    }
  };

  const handleDeleteLog = async (logId) => {
    await base44.entities.ReadingLog.delete(logId);
  };

  const last10Logs = allTimeLogs
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-20 w-64" />
      </div>
    );
  }

  if (!user || !userId) {
    window.location.href = '/auth';
    return null;
  }

  const formattedDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <PageHeader title="Bible Built" subtitle={formattedDate} />

        {!selectedBook ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {BIBLE_BOOKS.map(book => {
                const progress = getBookProgress(book);
                return (
                  <BookCard
                    key={book.index}
                    book={book}
                    todayCount={getBookTodayCount(book.index)}
                    currentCycleProgress={progress.currentCycleProgress}
                    timesThrough={progress.timesThrough}
                    onClick={() => setSelectedBook(book)}
                  />
                );
              })}
            </div>

            {last10Logs.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <button
                  onClick={() => setShowRecent(!showRecent)}
                  className="w-full flex items-center justify-between mb-2"
                >
                  <h3 className="font-semibold text-foreground">Recent Activity</h3>
                  {showRecent ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <AnimatePresence>
                  {showRecent && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {last10Logs.map(log => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-3 bg-secondary rounded-xl"
                        >
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {log.book} {log.chapter}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLog(log.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            key={selectedBook.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">{selectedBook.name}</h2>
              <Button variant="ghost" onClick={() => setSelectedBook(null)}>Back</Button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chapter => {
                const chapterId = generateChapterId(selectedBook.index, chapter);
                const isReadToday = todayChapterIds.has(chapterId);
                const bookProgress = getBookProgress(selectedBook);
                const isInCurrentCycle = bookProgress.currentCycleChapters.has(chapter);
                return (
                  <ChapterTile
                    key={chapter}
                    chapter={chapter}
                    isReadToday={isReadToday}
                    isInCurrentCycle={isInCurrentCycle}
                    onClick={() => setSelectedChapter({ book: selectedBook, chapter, chapterId, isRead: isReadToday })}
                    disabled={markRead.isPending || undoRead.isPending}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      <Sheet open={!!selectedChapter} onOpenChange={() => setSelectedChapter(null)}>
        <SheetContent side="bottom" className="max-h-[40vh]">
          <SheetHeader>
            <SheetTitle>
              {selectedChapter?.book.name} {selectedChapter?.chapter}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {!selectedChapter?.isRead && (
              <Button
                onClick={() => handleChapterAction('mark')}
                disabled={!userId || markRead.isPending}
                className="w-full"
                size="lg"
              >
                {markRead.isPending ? 'Saving...' : 'Mark as Read'}
              </Button>
            )}
            {selectedChapter?.isRead && (
              <Button
                onClick={() => handleChapterAction('undo')}
                disabled={!userId || undoRead.isPending}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {undoRead.isPending ? 'Removing...' : 'Undo'}
              </Button>
            )}
            <Button
              onClick={() => setSelectedChapter(null)}
              variant="ghost"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}