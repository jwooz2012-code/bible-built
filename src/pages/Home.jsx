import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckSquare, Zap } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import AuthRecoveryScreen from '@/components/auth/AuthRecoveryScreen';

import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import BookCard from '@/components/shared/BookCard';
import ChapterTile from '@/components/shared/ChapterTile';
import WeekView from '@/components/shared/WeekView';
import { BIBLE_BOOKS, generateChapterId, TOTAL_CHAPTERS, OT_CHAPTERS, NT_CHAPTERS } from '@/components/bible/bibleData';
import { useDayReadingLogs } from '@/components/bible/hooks/useDayReadingLogs';
import { useToggleChapterRead } from '@/components/bible/hooks/useToggleChapterRead';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { useMarkAllRead } from '@/components/bible/hooks/useMarkAllRead';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { useReadingStats } from '@/components/bible/hooks/useReadingStats';
import { useMostRecentBooks } from '@/components/bible/hooks/useMostRecentBooks';
import { useReadingPlan } from '@/components/bible/hooks/useReadingPlan';
import { useCurrentStreak } from '@/components/bible/hooks/useCurrentStreak';
import { useStreakWithGrace } from '@/components/bible/hooks/useStreakWithGrace';
import GraceAlertBanner from '@/components/home/GraceAlertBanner';
import TodayProgressBar from '@/components/trackers/TodayProgressBar';
import ProgressHero, { getTier } from '@/components/trackers/ProgressHero';
import StreakCard from '@/components/trackers/StreakCard';
import WeeklySummaryCard from '@/components/trackers/WeeklySummaryCard';
import PersonalRecordsCard from '@/components/trackers/PersonalRecordsCard';

import { dedupeChapterIds, groupByDateKey, computeStreaks, computeWeeklySummary, computeRecords } from '@/components/trackers/deriveStats';
import XPBar from '@/components/energy/XPBar';
import { useTheme } from '@/components/ThemeProvider';
import TodayAssignmentCard from '@/components/bible/plans/TodayAssignmentCard';
import PlanModal from '@/components/bible/plans/PlanModal';
import PlanPreviewSheet from '@/components/bible/plans/PlanPreviewSheet';
import { runValidation } from '@/components/bible/plans/validatePlans';
import BibleReader from '@/components/shared/BibleReader';
import { AnimatePresence } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  const { energyMode, energyPalette, resolvedTheme } = useTheme();
  const { user, isLoadingAuth, retryAuth, logout } = useAuth();
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedTestamentFilter, setSelectedTestamentFilter] = useState('OT');
  const [planOpen, setPlanOpen] = useState(false);
  const [planPreviewOpen, setPlanPreviewOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [isReadModeActive, setIsReadModeActive] = useState(false);
  const [showMarkAllConfirm, setShowMarkAllConfirm] = useState(false);
  const [readerState, setReaderState] = useState(null); // { book, chapter }
  const [optimisticLogs, setOptimisticLogs] = useState([]);
  // One-time discovery: show badge for new reader feature
  const [showReaderBadge, setShowReaderBadge] = useState(() => !localStorage.getItem('bb_reader_discovered'));
  const [showReaderTooltip, setShowReaderTooltip] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [selectedBook]);

  useEffect(() => {
    const onHomeTap = () => {
      if (selectedBook) {
        setSelectedBook(null);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('biblebuilt:homeTap', onHomeTap);
    return () => window.removeEventListener('biblebuilt:homeTap', onHomeTap);
  }, [selectedBook]);

  useEffect(() => {
    const countKey = 'bb_app_open_count';
    const currentCount = parseInt(localStorage.getItem(countKey) || '0', 10);
    const newCount = currentCount + 1;
    localStorage.setItem(countKey, String(newCount));
    setShowWelcome(newCount <= 5);
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV) runValidation();
  }, []);

  useEffect(() => {
    if (!user) return;
    base44.analytics.track({
      eventName: 'app_open',
      properties: { user_id: user.id }
    });
  }, [user]);

  const userId = user?.id;

  const today = getDateKey();
  const { data: todayLogs = [] } = useDayReadingLogs(userId, today);
  const { data: allTimeLogs = [], isLoading: isLoadingLogs } = useReadingLogsRange(userId, '2000-01-01', '2099-12-31');
  const { data: plan } = useReadingPlan(userId);

  const currentStreak = useStreakWithGrace(allTimeLogs, userId).currentStreak;

  const trackerStats = useMemo(() => {
    if (!allTimeLogs.length) {
      return {
        lifetimeUniqueChapters: 0,
        yearUniqueChapters: 0,
        otUniqueChapters: 0,
        ntUniqueChapters: 0,
        otPercent: 0,
        ntPercent: 0,
        longestStreak: 0,
        thisWeekChapters: 0,
        thisWeekActiveDays: 0,
        deltaVsLastWeek: 0,
        records: { longestStreak: 0, bestRolling7: 0, bestMonth: 0, mostReadBook: { name: 'None', count: 0 }, mostCompletedBook: { name: 'None', count: 0 } }
      };
    }

    const currentYear = new Date().getFullYear();
    const yearStart = `${currentYear}-01-01`;
    const yearLogs = allTimeLogs.filter((log) => log.dateKey >= yearStart);

    const lifetimeUnique = dedupeChapterIds(allTimeLogs);
    const yearUnique = dedupeChapterIds(yearLogs);

    const yearOtLogs = yearLogs.filter((log) => log.testament === 'OT');
    const yearNtLogs = yearLogs.filter((log) => log.testament === 'NT');
    const otUnique = dedupeChapterIds(yearOtLogs);
    const ntUnique = dedupeChapterIds(yearNtLogs);

    const dateCountMap = groupByDateKey(allTimeLogs);
    const sortedDates = Array.from(dateCountMap.keys()).sort().reverse();
    const { longestStreak } = computeStreaks(sortedDates, today);
    const { thisWeekChapters, thisWeekActiveDays, deltaVsLastWeek } = computeWeeklySummary(dateCountMap, today);
    const records = computeRecords(dateCountMap, allTimeLogs);

    return {
      lifetimeUniqueChapters: lifetimeUnique.size,
      yearUniqueChapters: yearUnique.size,
      otUniqueChapters: otUnique.size,
      ntUniqueChapters: ntUnique.size,
      otPercent: Math.round(otUnique.size / 929 * 100),
      ntPercent: Math.round(ntUnique.size / 260 * 100),
      longestStreak,
      thisWeekChapters,
      thisWeekActiveDays,
      deltaVsLastWeek,
      records
    };
  }, [allTimeLogs, today]);

  const currentYear = new Date().getFullYear();
  const now = new Date();

  const yearStart = `${currentYear}-01-01`;
  const yearEnd = `${currentYear}-12-31`;
  const yearLogs = allTimeLogs.filter((log) => log.dateKey >= yearStart && log.dateKey <= yearEnd);
  const yearChaptersRead = yearLogs.length;

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekStart = getDateKey(weekAgo);
  const weekLogs = allTimeLogs.filter((log) => log.dateKey >= weekStart);
  const { totalCount: weekChaptersRead } = useReadingStats(weekLogs);

  const monthStart = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthLogs = allTimeLogs.filter((log) => log.dateKey >= monthStart && log.dateKey <= yearEnd);
  const { totalCount: monthChaptersRead } = useReadingStats(monthLogs);

  const readingDays = new Set(allTimeLogs.map((log) => log.dateKey)).size;
  const yearReadingDays = new Set(yearLogs.map((log) => log.dateKey)).size;
  const avgChaptersPerReadingDay = yearReadingDays > 0 ? (yearChaptersRead / yearReadingDays).toFixed(1) : 0;

  const { markRead, undoRead, isMarkingRead, isUndoingRead } = useToggleChapterRead({ user, allLogs: allTimeLogs });
  const { markAllRead, isMarkingAll } = useMarkAllRead();

  const recentBooks = useMostRecentBooks(allTimeLogs);

  const hasPlan = !!plan?.startDate && !!plan?.endDate;
  const showPrompt = !hasPlan && !promptDismissed && !localStorage.getItem('bb_plan_prompt_seen');

  const { totalCount: lifetimeTotalCount } = useReadingStats(allTimeLogs);
  const uniqueDays = new Set(allTimeLogs.map((log) => log.dateKey));
  const daysWithReadingDistinct = uniqueDays.size;

  const bookChaptersRead = {};
  allTimeLogs.forEach((log) => {
    if (!bookChaptersRead[log.book]) {
      bookChaptersRead[log.book] = new Set();
    }
    bookChaptersRead[log.book].add(log.chapter);
  });

  let totalBooksCompletedDistinct = 0;
  Object.keys(bookChaptersRead).forEach((bookName) => {
    const bookData = BIBLE_BOOKS.find((b) => b.name === bookName);
    if (bookData && bookChaptersRead[bookName].size >= bookData.chapters) {
      totalBooksCompletedDistinct++;
    }
  });

  const handleDismissPrompt = () => {
    localStorage.setItem('bb_plan_prompt_seen', 'true');
    setPromptDismissed(true);
  };

  const filteredBooks = BIBLE_BOOKS.filter((book) => {
    if (selectedTestamentFilter === 'OT') return book.testament === 'OT';
    if (selectedTestamentFilter === 'NT') return book.testament === 'NT';
    return true;
  });

  const getBookStats = (book) => {
    const chapterCounts = {};
    for (let i = 1; i <= book.chapters; i++) {
      chapterCounts[i] = 0;
    }
    const bookLogs = allTimeLogs.filter((log) => log.bookIndex === book.index);
    bookLogs.forEach((log) => {
      if (chapterCounts[log.chapter] !== undefined) {
        chapterCounts[log.chapter]++;
      }
    });
    const minCount = Math.min(...Object.values(chapterCounts));
    return { completions: minCount };
  };

  const getChapterStats = (bookIndex, chapter) => {
    const chapterId = generateChapterId(bookIndex, chapter);
    const chapterLogs = allTimeLogs.filter((log) => log.chapterId === chapterId);
    const optimisticCount = optimisticLogs.filter((log) => log.chapterId === chapterId).length;
    return { timesRead: chapterLogs.length + optimisticCount };
  };

  const handleChapterClick = async (book, chapter, chapterId) => {
    if (!userId) {
      toast.error('Please log in again');
      return;
    }
    if (isReadModeActive) {
      // Read Mode: open BibleReader overlay
      setReaderState({ book, chapter });
      return;
    }
    // Log Mode: mark as read immediately
    try {
      const now = new Date();
      await markRead({
        userId,
        dateKey: getDateKey(now),
        timestamp: now.toISOString(),
        book: book.name,
        bookIndex: book.index,
        chapter,
        chapterId,
        testament: book.testament
      });
    } catch (error) {
      toast.error(error?.message || 'Action failed. Please try again.');
    }
  };

  const handleToggleReadMode = () => {
    const next = !isReadModeActive;
    setIsReadModeActive(next);
    if (showReaderBadge) {
      setShowReaderBadge(false);
      localStorage.setItem('bb_reader_discovered', '1');
    }
    if (next && !localStorage.getItem('bb_reader_tooltip_seen')) {
      setShowReaderTooltip(true);
      localStorage.setItem('bb_reader_tooltip_seen', '1');
      setTimeout(() => setShowReaderTooltip(false), 4000);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !userId) {
    console.warn('[Home] user or userId missing after auth resolved. user:', user, 'userId:', userId);
    return (
      <AuthRecoveryScreen
        errorType="session_missing"
        onRetry={retryAuth}
        onLogout={() => logout(true)}
      />
    );
  }

  const weeklyQuotes = [
    "Faithfulness is built one chapter at a time.",
    "Show up. Let the Word do the work.",
    "You don't master the Word. You return to it.",
    "Consistency shapes understanding.",
    "A quiet habit can carry a lifetime.",
    "Read again. There is more here.",
    "Depth comes from staying.",
    "The Word rewards the patient reader.",
    "This is how Scripture becomes familiar.",
    "Built slowly. Held forever."
  ];

  const getWeeklyQuote = () => {
    const startOfYear = new Date(currentYear, 0, 1);
    const weeksSinceStartOfYear = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
    return weeklyQuotes[weeksSinceStartOfYear % weeklyQuotes.length];
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-6xl mx-auto px-5 pb-8">
        {!selectedBook && (
          <>
            {showWelcome && (
              <p className="text-sm text-muted-foreground/70 text-center mb-6">
                Track what matters.
              </p>
            )}

            <GraceAlertBanner tierColor={getTier(currentStreak).color} />

            <TodayAssignmentCard
              plan={plan}
              allTimeLogs={allTimeLogs}
              todayKey={today}
              userId={userId}
              onOpenPlanModal={() => setPlanOpen(true)}
              onOpenPlanPreview={() => setPlanPreviewOpen(true)}
              onDismissPrompt={handleDismissPrompt}
              showPrompt={showPrompt}
            />

            <ProgressHero
              currentStreak={currentStreak}
              records={trackerStats.records}
              todayLogs={todayLogs}
              thisWeekChapters={trackerStats.thisWeekChapters}
              yearChapters={yearChaptersRead}
            />

            {energyMode && (
              <div className="mb-5">
                <XPBar todayCount={todayLogs.length} />
              </div>
            )}

            <WeekView logs={allTimeLogs} tierColor={getTier(currentStreak).color} />

            {recentBooks.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">Continue Reading</h2>
                <div className="grid grid-cols-2 gap-2">
                  {recentBooks.slice(0, 2).map((book) => {
                    const stats = getBookStats(book);
                    return (
                      <BookCard
                        key={book.index}
                        book={book}
                        completions={stats.completions}
                        onClick={() => setSelectedBook(book)}
                        compact={true}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2 mb-5">
              <Button
                variant={selectedTestamentFilter === 'OT' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTestamentFilter('OT')}
                className="flex-1 h-10 text-sm font-medium"
              >
                Old Testament
              </Button>
              <Button
                variant={selectedTestamentFilter === 'NT' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTestamentFilter('NT')}
                className="flex-1 h-10 text-sm font-medium"
              >
                New Testament
              </Button>
            </div>
          </>
        )}

        {!selectedBook ? (
          <div className="grid grid-cols-2 gap-2 mb-6">
            {filteredBooks.map((book) => {
              const stats = getBookStats(book);
              return (
                <BookCard
                  key={book.index}
                  book={book}
                  completions={stats.completions}
                  onClick={() => setSelectedBook(book)}
                />
              );
            })}
          </div>
        ) : (
          <motion.div
            key={selectedBook.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 mb-5">
              <div className="flex items-center gap-3">
                <button
                  className="h-9 w-9 p-0 shrink-0 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
                  onClick={() => setSelectedBook(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-foreground flex-1">{selectedBook.name}</h2>
              </div>

              {/* Mode buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => { if (isReadModeActive) handleToggleReadMode(); }}
                  className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl text-sm font-semibold transition-all ${
                    !isReadModeActive
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  Mark Complete
                </button>
                <button
                  onClick={() => { if (!isReadModeActive) handleToggleReadMode(); }}
                  className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl text-sm font-semibold transition-all ${
                    isReadModeActive
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Read Chapter
                </button>
              </div>

              {/* Mark All as Read */}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowMarkAllConfirm(true)}
                  disabled={isMarkingAll || isMarkingRead || isUndoingRead}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-40"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {isMarkingAll ? 'Marking...' : 'Mark All as Read'}
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mb-5">
              {isReadModeActive ? 'Tap a chapter to open and read' : 'Tap a chapter to mark it as read'}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3.5">
              {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => {
                const chapterId = generateChapterId(selectedBook.index, chapter);
                const chapterStats = getChapterStats(selectedBook.index, chapter);
                return (
                  <ChapterTile
                    key={chapter}
                    chapter={chapter}
                    chapterId={chapterId}
                    timesRead={chapterStats.timesRead}
                    onClick={() => handleChapterClick(selectedBook, chapter, chapterId)}
                    disabled={isMarkingRead || isUndoingRead}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* BibleReader overlay */}
      <AnimatePresence>
        {readerState && (
          <BibleReader
            key={`${readerState.book.index}-${readerState.chapter}`}
            book={readerState.book}
            chapter={readerState.chapter}
            userId={userId}
            onClose={() => setReaderState(null)}
            onMarkRead={({ chapterId }) => {
              setOptimisticLogs(prev => [...prev, { chapterId }]);
              setReaderState(null);
            }}
          />
        )}
      </AnimatePresence>

      <AlertDialog open={showMarkAllConfirm} onOpenChange={setShowMarkAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark all chapters as read?</AlertDialogTitle>
            <AlertDialogDescription>
              This will log every chapter in {selectedBook?.name} as read today. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await markAllRead({ userId, book: selectedBook }); setShowMarkAllConfirm(false); }}>
              Mark All as Read
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PlanModal
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        userId={userId}
        existingPlan={plan}
        logs={allTimeLogs}
      />

      <PlanPreviewSheet
        open={planPreviewOpen}
        onClose={() => setPlanPreviewOpen(false)}
        plan={plan}
        userId={userId}
        todayKey={today}
        logs={allTimeLogs}
        onOpenPlanModal={() => {
          setPlanPreviewOpen(false);
          setPlanOpen(true);
        }}
      />
    </div>
  );
}