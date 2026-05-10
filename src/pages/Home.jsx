import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckSquare, Zap, BookMarked } from 'lucide-react';
import { triggerHaptic } from '@/components/utils/haptics';
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
import { getDateKey, addDaysKey, formatDateKey } from '@/components/bible/utils/dateUtils';
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
import MissedDayBanner from '@/components/bible/plans/MissedDayBanner';
import { useCompleteTodaysAssignment } from '@/components/bible/hooks/useCompleteTodaysAssignment';
import { getOldestMissedDay } from '@/components/bible/plans/planUtils';
import PlanModal from '@/components/bible/plans/PlanModal';
import PlanPreviewSheet from '@/components/bible/plans/PlanPreviewSheet';
import { runValidation } from '@/components/bible/plans/validatePlans';
import BibleReader from '@/components/shared/BibleReader';

const WEEKLY_QUOTES = [
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
  const monthStart = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const yearLogs = useMemo(
    () => allTimeLogs.filter((log) => log.dateKey >= yearStart && log.dateKey <= yearEnd),
    [allTimeLogs, yearStart, yearEnd]
  );
  const yearChaptersRead = yearLogs.length;

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekStart = getDateKey(weekAgo);
  const weekLogs = useMemo(
    () => allTimeLogs.filter((log) => log.dateKey >= weekStart),
    [allTimeLogs, weekStart]
  );
  const { totalCount: weekChaptersRead } = useReadingStats(weekLogs);

  const monthLogs = useMemo(
    () => allTimeLogs.filter((log) => log.dateKey >= monthStart && log.dateKey <= yearEnd),
    [allTimeLogs, monthStart, yearEnd]
  );
  const { totalCount: monthChaptersRead } = useReadingStats(monthLogs);

  const { readingDays, yearReadingDays, avgChaptersPerReadingDay } = useMemo(() => {
    const rd = new Set(allTimeLogs.map((log) => log.dateKey)).size;
    const yrd = new Set(yearLogs.map((log) => log.dateKey)).size;
    return {
      readingDays: rd,
      yearReadingDays: yrd,
      avgChaptersPerReadingDay: yrd > 0 ? (yearChaptersRead / yrd).toFixed(1) : 0,
    };
  }, [allTimeLogs, yearLogs, yearChaptersRead]);

  const { markRead, undoRead, isMarkingRead, isUndoingRead } = useToggleChapterRead({ user, allLogs: allTimeLogs });
  const { markAllRead, isMarkingAll } = useMarkAllRead({ user, allLogs: allTimeLogs });

  const recentBooks = useMostRecentBooks(allTimeLogs);

  const hasPlan = !!plan?.startDate && !!plan?.endDate;
  const showPrompt = !hasPlan && !promptDismissed && !localStorage.getItem('bb_plan_prompt_seen');

  // ── Missed day recovery ──────────────────────────────────────────────────
  const queryClient = useQueryClient();
  const { completeToday, isCompleting: isCatchingUp } = useCompleteTodaysAssignment();

  // Track which missed-day dateKeys the user has explicitly skipped/handled
  const [skippedDays, setSkippedDays] = useState(() => {
    const skipped = new Set();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('bb_missed_skip_')) {
        skipped.add(key.replace('bb_missed_skip_', ''));
      }
    }
    return skipped;
  });

  const missedDay = useMemo(
    () => getOldestMissedDay({ plan, logs: allTimeLogs, todayKey: today }),
    [plan, allTimeLogs, today]
  );

  const showMissedBanner = !!missedDay && !skippedDays.has(missedDay?.dateKey);

  const handleCatchUp = useCallback(() => {
    if (!missedDay || !userId) return;
    completeToday({
      userId,
      plan,
      allTimeLogs,
      todayKey: today,          // log as today so streak is preserved
      assignedChapters: missedDay.assignment,
    });
    // The banner disappears naturally once the chapters are marked read
  }, [missedDay, userId, plan, allTimeLogs, today, completeToday]);

  const handleSkipMissedDay = useCallback(() => {
    if (!missedDay) return;
    localStorage.setItem(`bb_missed_skip_${missedDay.dateKey}`, '1');
    setSkippedDays((prev) => new Set([...prev, missedDay.dateKey]));
  }, [missedDay]);

  const handleAddDay = useCallback(async () => {
    if (!plan?.id || !missedDay) return;
    const newEndDate = addDaysKey(plan.endDate, 1);
    try {
      await base44.entities.ReadingPlan.update(plan.id, { endDate: newEndDate });
      queryClient.invalidateQueries({ queryKey: ['readingPlan', userId] });
      // Dismiss banner — user acknowledged the miss and extended the plan
      localStorage.setItem(`bb_missed_skip_${missedDay.dateKey}`, '1');
      setSkippedDays((prev) => new Set([...prev, missedDay.dateKey]));
      toast.success(`Plan extended to ${formatDateKey(newEndDate)}`);
    } catch {
      toast.error('Failed to extend plan');
    }
  }, [plan, missedDay, userId, queryClient]);

  const { totalCount: lifetimeTotalCount } = useReadingStats(allTimeLogs);
  const uniqueDays = new Set(allTimeLogs.map((log) => log.dateKey));
  const daysWithReadingDistinct = uniqueDays.size;

  const { bookChaptersRead, totalBooksCompletedDistinct } = useMemo(() => {
    const booksRead = {};
    allTimeLogs.forEach((log) => {
      if (!booksRead[log.book]) booksRead[log.book] = new Set();
      booksRead[log.book].add(log.chapter);
    });
    let completed = 0;
    Object.keys(booksRead).forEach((bookName) => {
      const bookData = BIBLE_BOOKS.find((b) => b.name === bookName);
      if (bookData && booksRead[bookName].size >= bookData.chapters) completed++;
    });
    return { bookChaptersRead: booksRead, totalBooksCompletedDistinct: completed };
  }, [allTimeLogs]);

  const handleDismissPrompt = () => {
    localStorage.setItem('bb_plan_prompt_seen', 'true');
    setPromptDismissed(true);
  };

  const filteredBooks = BIBLE_BOOKS.filter((book) => {
    if (selectedTestamentFilter === 'OT') return book.testament === 'OT';
    if (selectedTestamentFilter === 'NT') return book.testament === 'NT';
    return true;
  });

  // Pre-computed maps: O(n) once per allTimeLogs change instead of O(n) per book/chapter render
  const bookStatsMap = useMemo(() => {
    // Per book: track read count per chapter, then take the minimum (= full completions)
    const perBookChapterCounts = {};
    allTimeLogs.forEach((log) => {
      if (!perBookChapterCounts[log.bookIndex]) perBookChapterCounts[log.bookIndex] = {};
      const counts = perBookChapterCounts[log.bookIndex];
      counts[log.chapter] = (counts[log.chapter] || 0) + 1;
    });
    const map = {};
    BIBLE_BOOKS.forEach((book) => {
      const counts = perBookChapterCounts[book.index] || {};
      const allCounts = Array.from({ length: book.chapters }, (_, i) => counts[i + 1] || 0);
      map[book.index] = { completions: allCounts.length ? Math.min(...allCounts) : 0 };
    });
    return map;
  }, [allTimeLogs]);

  const chapterStatsMap = useMemo(() => {
    const map = {};
    allTimeLogs.forEach((log) => {
      map[log.chapterId] = (map[log.chapterId] || 0) + 1;
    });
    return map;
  }, [allTimeLogs]);

  const getBookStats = (book) => bookStatsMap[book.index] || { completions: 0 };

  const getChapterStats = (bookIndex, chapter) => {
    const chapterId = generateChapterId(bookIndex, chapter);
    const optimisticCount = optimisticLogs.filter((log) => log.chapterId === chapterId).length;
    return { timesRead: (chapterStatsMap[chapterId] || 0) + optimisticCount };
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
    return (
      <AuthRecoveryScreen
        errorType="session_missing"
        onRetry={retryAuth}
        onLogout={() => logout(true)}
      />
    );
  }

  const getWeeklyQuote = () => {
    const startOfYear = new Date(currentYear, 0, 1);
    const weeksSinceStartOfYear = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
    return WEEKLY_QUOTES[weeksSinceStartOfYear % WEEKLY_QUOTES.length];
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

            <AnimatePresence>
              {showMissedBanner && (
                <MissedDayBanner
                  missedDay={missedDay}
                  onCatchUp={handleCatchUp}
                  onSkip={handleSkipMissedDay}
                  onAddDay={handleAddDay}
                  isSaving={isCatchingUp}
                />
              )}
            </AnimatePresence>

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
              <button
                onClick={() => setSelectedTestamentFilter('OT')}
                className="flex-1 h-10 text-sm font-semibold rounded-xl transition-all"
                style={selectedTestamentFilter === 'OT' ? {
                  background: 'rgba(34,197,94,0.12)',
                  border: '2px solid #22C55E',
                  color: '#16A34A',
                  boxShadow: '0 0 0 1px rgba(34,197,94,0.2)'
                } : {
                  background: 'hsl(var(--muted))',
                  border: '2px solid transparent',
                  color: 'hsl(var(--muted-foreground))'
                }}
              >
                Old Testament
              </button>
              <button
                onClick={() => setSelectedTestamentFilter('NT')}
                className="flex-1 h-10 text-sm font-semibold rounded-xl transition-all"
                style={selectedTestamentFilter === 'NT' ? {
                  background: 'rgba(34,197,94,0.12)',
                  border: '2px solid #22C55E',
                  color: '#16A34A',
                  boxShadow: '0 0 0 1px rgba(34,197,94,0.2)'
                } : {
                  background: 'hsl(var(--muted))',
                  border: '2px solid transparent',
                  color: 'hsl(var(--muted-foreground))'
                }}
              >
                New Testament
              </button>
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
            <div className="flex flex-col mb-5" style={{ gap: '8px' }}>
              <div className="flex items-center gap-3">
                <button
                  className="h-9 w-9 p-0 shrink-0 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
                  onClick={() => setSelectedBook(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-foreground flex-1">{selectedBook.name}</h2>
              </div>

              {/* Segmented Control */}
              <div
                className="relative flex rounded-full border border-border overflow-hidden"
                style={{ background: 'var(--btn-inactive-bg)', padding: '2px' }}
              >
                {/* Sliding pill */}
                <div
                  className="absolute top-[2px] bottom-[2px] rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #16A34A, #22C55E)',
                    width: 'calc(50% - 2px)',
                    left: isReadModeActive ? '50%' : '2px',
                    transition: 'left 140ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
                {/* Mark Complete */}
                <button
                  onClick={() => { if (isReadModeActive) { handleToggleReadMode(); triggerHaptic('light'); } }}
                  className="relative flex-1 flex items-center justify-center gap-1.5 h-10 text-sm font-semibold z-10 whitespace-nowrap"
                  style={{ color: !isReadModeActive ? '#fff' : 'var(--btn-inactive-text)', transition: 'color 140ms' }}
                >
                  <CheckSquare className="w-4 h-4 shrink-0" />
                  Mark Complete
                </button>
                {/* Read Chapter */}
                <button
                  onClick={() => { if (!isReadModeActive) { handleToggleReadMode(); triggerHaptic('light'); } }}
                  className="relative flex-1 flex items-center justify-center gap-1.5 h-10 text-sm font-semibold z-10 whitespace-nowrap"
                  style={{ color: isReadModeActive ? '#fff' : 'var(--btn-inactive-text)', transition: 'color 140ms' }}
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  Read Chapter
                </button>
              </div>

              {/* Mark All as Read */}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowMarkAllConfirm(true)}
                  disabled={isMarkingAll || isMarkingRead || isUndoingRead}
                  className="flex items-center gap-1.5 px-5 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 active:scale-[0.97]"
                  style={{ background: 'var(--btn-inactive-bg)' }}
                >
                  <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: '#16A34A' }} />
                  <span style={{ color: 'var(--btn-inactive-text)' }}>{isMarkingAll ? 'Marking...' : 'Mark All as Read'}</span>
                </button>
              </div>
            </div>
            <p key={isReadModeActive ? 'read' : 'mark'} className="text-xs text-center mb-5 animate-in fade-in duration-200" style={{ opacity: 0.55, color: 'inherit' }}>
              {isReadModeActive ? '📖 Tap a chapter to read' : '✅ Tap a chapter to mark complete'}
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