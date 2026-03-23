import React, { useRef, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import html2canvas from 'html2canvas';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, isSameMonth } from 'date-fns';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { computeBadgeState } from '@/components/badges/badgeEngine';
import { getBadgesForRow } from '@/components/badges/badgeUtils';
import { getAchievementIcon, getAchievementColor } from '@/components/badges/badgeIcons';
import { useTheme } from '@/components/ThemeProvider';

// Theme tokens for Share Summary (screenshot-optimized)
const getShareSummaryTheme = (resolvedTheme, energyMode) => {
  const isEnergy = energyMode;
  
  if (resolvedTheme === 'dark') {
    return {
      background: '#0A0A0A',
      cardBg: '#1A1A1A',
      heroBg: '#1F1F1F',
      heroText: '#FFFFFF',
      heroLabel: '#94A3B8',
      statBg: '#171717',
      statValue: '#FFFFFF',
      statLabel: '#71717A',
      divider: '#262626',
      primaryText: '#FAFAFA',
      secondaryText: '#A1A1AA',
      badgeSectionBg: 'rgba(23, 23, 23, 0.4)',
      badgeSectionLabel: '#94A3B8',
      logoOpacity: 0.85,
      brandingText: '#D4D4D8',
      brandingTagline: '#71717A',
      energyAccent: isEnergy ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(250, 204, 21, 0.15) 100%)' : 'none',
      energyGlow: isEnergy ? '0 0 24px rgba(249, 115, 22, 0.15)' : 'none'
    };
  }
  
  // Light mode (default)
  return {
    background: '#F9FAFB',
    cardBg: '#FFFFFF',
    heroBg: '#111827',
    heroText: '#FFFFFF',
    heroLabel: '#9CA3AF',
    statBg: '#F3F4F6',
    statValue: '#111827',
    statLabel: '#6B7280',
    divider: '#E5E7EB',
    primaryText: '#111827',
    secondaryText: '#6B7280',
    badgeSectionBg: 'rgba(249, 250, 251, 0.5)',
    badgeSectionLabel: '#9CA3AF',
    logoOpacity: 0.9,
    brandingText: '#374151',
    brandingTagline: '#9CA3AF',
    energyAccent: isEnergy ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(250, 204, 21, 0.08) 100%)' : 'none',
    energyGlow: isEnergy ? '0 0 32px rgba(249, 115, 22, 0.12)' : 'none'
  };
};

export default function ShareSummary() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const screenshotRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isShareCaptureMode, setIsShareCaptureMode] = useState(false);

  const mode = searchParams.get('mode') || 'yearly'; // 'monthly', 'yearly', or 'weekly'
  const yearParam = searchParams.get('year') || new Date().getFullYear().toString();
  const monthParam = searchParams.get('month'); // 1-12 for monthly view

  const year = parseInt(yearParam);
  const month = monthParam ? parseInt(monthParam) : null;

  // Selected month state for navigation
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => {
    if (mode === 'monthly' && month) {
      return new Date(year, month - 1, 1);
    }
    return new Date();
  });

  // Weekly navigation: 0 = current week, -1 = last week, etc.
  const [weekOffset, setWeekOffset] = useState(0);

  const currentMonth = new Date();
  const isCurrentMonthSelected = isSameMonth(selectedMonthDate, currentMonth);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setSelectedMonthDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    if (!isCurrentMonthSelected) {
      setSelectedMonthDate(prev => addMonths(prev, 1));
    }
  };

  // Weekly date range based on offset (0 = current week, -1 = last week, etc.)
  const weeklyRange = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sundayOfCurrentWeek = new Date(today);
    sundayOfCurrentWeek.setDate(today.getDate() - dayOfWeek);
    sundayOfCurrentWeek.setHours(0, 0, 0, 0);
    const sunday = new Date(sundayOfCurrentWeek);
    sunday.setDate(sundayOfCurrentWeek.getDate() + weekOffset * 7);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    const pad = (n) => String(n).padStart(2, '0');
    const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const startKey = toKey(sunday);
    const endKey = toKey(saturday);
    const label = `${format(sunday, 'MMM d')} – ${format(saturday, 'MMM d')}`;
    return { startKey, endKey, label, sunday, saturday };
  }, [weekOffset]);

  // Determine date range
  let startDate, endDate, displayTitle, displaySubtitle;
  if (mode === 'monthly') {
    const firstDay = startOfMonth(selectedMonthDate);
    const lastDay = endOfMonth(selectedMonthDate);
    startDate = getDateKey(firstDay);
    endDate = getDateKey(lastDay);
    displayTitle = format(firstDay, 'MMMM yyyy');
    displaySubtitle = 'Reading Summary';
  } else if (mode === 'weekly') {
    startDate = weeklyRange.startKey;
    endDate = weeklyRange.endKey;
    displayTitle = weekOffset === 0 ? 'This Week' : weekOffset === -1 ? 'Last Week' : weeklyRange.label;
    displaySubtitle = weekOffset <= -1 ? weeklyRange.label : weeklyRange.label;
  } else {
    const firstDay = new Date(year, 0, 1);
    const lastDay = new Date(year, 11, 31);
    startDate = getDateKey(firstDay);
    endDate = getDateKey(lastDay);
    displayTitle = year.toString();
    displaySubtitle = 'Reading Summary';
  }

  // Fetch reading logs for the period (for display stats)
  const { data: readingLogs = [] } = useQuery({
    queryKey: ['readingLogs', startDate, endDate],
    queryFn: async () => {
      const logs = await base44.entities.ReadingLog.filter(
        { dateKey: { $gte: startDate, $lte: endDate } },
        '-dateKey',
        1000
      );
      return logs || [];
    },
  });

  // Fetch LIFETIME reading logs (for accurate badge determination)
  const { data: lifetimeLogs = [] } = useQuery({
    queryKey: ['lifetimeReadingLogs'],
    queryFn: async () => {
      const logs = await base44.entities.ReadingLog.list('-dateKey', 10000);
      return logs || [];
    },
  });

  // Calculate stats
  const totalChapters = readingLogs.length;
  const uniqueDays = new Set(readingLogs.map((l) => l.dateKey)).size;
  const booksRead = new Set(readingLogs.map((l) => l.bookIndex)).size;
  const otChapters = readingLogs.filter((l) => l.testament === 'OT').length;
  const ntChapters = readingLogs.filter((l) => l.testament === 'NT').length;

  // Calculate consecutive days (streak within the period)
  let longestStreak = 0;
  if (readingLogs.length > 0) {
    const sortedDates = Array.from(
      new Set(readingLogs.map((l) => l.dateKey))
    ).sort();
    let currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor(
        (currDate - prevDate) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
  }

  // Calculate best day (most chapters in one day)
  const chaptersPerDay = {};
  readingLogs.forEach((log) => {
    chaptersPerDay[log.dateKey] = (chaptersPerDay[log.dateKey] || 0) + 1;
  });
  const bestDay = Math.max(0, ...Object.values(chaptersPerDay));

  // Calculate unique chapters for the timeframe
  const uniqueChapters = new Set(readingLogs.map((l) => l.chapterId)).size;

  // Calculate most completed book count for timeframe
  const bookCompletionCounts = {};
  readingLogs.forEach((log) => {
    const key = log.book;
    bookCompletionCounts[key] = (bookCompletionCounts[key] || 0) + 1;
  });
  const mostCompletedBookCount = Math.max(0, ...Object.values(bookCompletionCounts));

  // Fetch user data for badges
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  // Weekly: Most Read Book
  const mostReadBook = useMemo(() => {
    if (mode !== 'weekly' || readingLogs.length === 0) return null;
    const bookCounts = {};
    const bookLatest = {};
    readingLogs.forEach((log) => {
      bookCounts[log.book] = (bookCounts[log.book] || 0) + 1;
      const ts = log.timestamp || log.dateKey;
      if (!bookLatest[log.book] || ts > bookLatest[log.book]) {
        bookLatest[log.book] = ts;
      }
    });
    const maxCount = Math.max(...Object.values(bookCounts));
    const tied = Object.keys(bookCounts).filter(b => bookCounts[b] === maxCount);
    if (tied.length === 1) return tied[0];
    // Tie-break: most recently read
    return tied.reduce((a, b) => bookLatest[a] >= bookLatest[b] ? a : b);
  }, [readingLogs, mode]);

  // For monthly/weekly view, badges are LIFETIME; for yearly, filtered by timeframe
  const badgeDataForCalculation = (mode === 'monthly' || mode === 'weekly') ? lifetimeLogs : readingLogs;
  const badgeState = computeBadgeState(badgeDataForCalculation, user, { debug: false });
  const badges = badgeState.badges;

  // Get ONLY earned badges - strict filter to match app state
  // Sort by earnedAt (most recent first) if available
  const earnedBadges = badges
    .filter(b => b.achieved === true)
    .sort((a, b) => {
      if (a.earnedAt && b.earnedAt) {
        return new Date(b.earnedAt) - new Date(a.earnedAt);
      }
      return 0;
    });

  // Secondary stats - only 4 for spacious layout
  const secondaryStats = mode === 'weekly'
    ? [
        { label: 'Days', value: uniqueDays },
        { label: 'Books', value: booksRead },
        { label: 'Most Read Book', value: mostReadBook || '—', isText: true },
        { label: 'Best Day', value: bestDay },
      ]
    : [
        { label: 'Days', value: uniqueDays },
        { label: 'Books', value: booksRead },
        { label: 'Best Streak', value: longestStreak },
        { label: 'Best Day', value: bestDay },
      ];

  // Theme support
  const { resolvedTheme, energyMode } = useTheme();
  const theme = getShareSummaryTheme(resolvedTheme, energyMode);

  // Share/Export handler
  const handleShare = async () => {
    setIsExporting(true);
    setIsShareCaptureMode(true);
    
    // Wait for UI to update before capturing
    await new Promise(resolve => setTimeout(resolve, 50));
    
    try {
      const canvas = await html2canvas(screenshotRef.current, {
        backgroundColor: theme.cardBg,
        scale: 2,
        useCORS: true,
      });

      // Try native share first
      if (navigator.share) {
        canvas.toBlob(async (blob) => {
          const file = new File([blob], `${displayTitle}-summary.png`, {
            type: 'image/png',
          });
          try {
            await navigator.share({
              files: [file],
              title: `${displayTitle} Reading Summary`,
            });
          } catch (err) {
            // User cancelled share
          }
        });
      } else {
        // Fallback: download
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${displayTitle}-summary.png`;
        link.click();
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
      setIsShareCaptureMode(false);
    }
  };

  return (
    <div 
      className="min-h-screen overflow-y-auto pb-[calc(8rem+env(safe-area-inset-bottom))]"
      style={{ backgroundColor: theme.cardBg }}
    >
      <div className="flex flex-col items-center justify-center py-6 gap-8">
        {/* Screenshot-ready content - ONLY this section is captured */}
        <div
          ref={screenshotRef}
          className="w-full max-w-md"
          style={{ backgroundColor: theme.cardBg }}
        >
          {/* Share Content - Everything visible in screenshot */}
          <div 
            className="w-full flex flex-col px-6 py-6"
            style={{ 
              backgroundColor: theme.cardBg,
              backgroundImage: theme.energyAccent
            }}
          >
          {/* Header - Compact */}
          <div className="flex-shrink-0 mb-4">
            <h1 
              className="text-2xl font-bold text-center leading-tight"
              style={{ color: theme.primaryText }}
            >
              {displayTitle}
            </h1>
            {(mode !== 'monthly') && (
              <p 
                className="text-[10px] text-center mt-1 font-semibold uppercase tracking-wider"
                style={{ color: theme.secondaryText }}
              >
                {displaySubtitle}
              </p>
            )}
            {mode === 'monthly' && (
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6953bfa67629f34f674461da/6d21a8071_AppIcon.png"
                  alt="Bible Built"
                  className="w-4 h-4 rounded-[4px]"
                  style={{ opacity: 0.85 }}
                />
                <div 
                  className="text-[10px] font-semibold tracking-wide"
                  style={{ color: theme.primaryText, opacity: 0.85 }}
                >
                  Bible Built
                </div>
              </div>
            )}
          </div>

          {/* Hero Stat - Anchor */}
          <div 
            className="flex flex-col items-center justify-center rounded-2xl p-5 flex-shrink-0 mb-3"
            style={{ 
              backgroundColor: theme.heroBg,
              boxShadow: theme.energyGlow
            }}
          >
            <div 
              className="text-6xl font-bold mb-1 tracking-tight"
              style={{ color: theme.heroText }}
            >
              {totalChapters}
            </div>
            <div 
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: theme.heroLabel }}
            >
              Chapters Read
            </div>
          </div>

          {/* Key Stats Grid - 2x2 Layout */}
          <div className="grid grid-cols-2 gap-3 flex-shrink-0 mb-5">
            {secondaryStats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-between py-4 px-3 rounded-xl min-h-[80px]"
                style={{ backgroundColor: theme.statBg }}
              >
                <div 
                  className={stat.isText
                    ? `font-bold text-center leading-tight flex items-center justify-center flex-1 w-full ${
                        (stat.value || '').length > 14
                          ? 'text-sm'
                          : (stat.value || '').length > 10
                          ? 'text-base'
                          : 'text-xl'
                      }`
                    : 'text-3xl font-bold flex items-center justify-center flex-1'}
                  style={{ color: theme.statValue }}
                >
                  {stat.value}
                </div>
                <div 
                  className="text-[8px] text-center font-semibold uppercase tracking-wide mt-1 leading-tight"
                  style={{ color: theme.statLabel }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Badges Section - Clean 5-across layout */}
          <div className="flex flex-col items-center">
            <div 
              className="text-[9px] font-extrabold uppercase tracking-[0.15em] mb-2.5 text-center"
              style={{ color: theme.badgeSectionLabel }}
            >
              {mode === 'monthly' || mode === 'weekly' ? 'Earned Badges' : 'Badges Earned'}
            </div>
            {earnedBadges && earnedBadges.length > 0 ? (
              <div className="flex flex-col items-center gap-1">
                <div className="grid grid-cols-5 gap-2.5">
                  {earnedBadges.slice(0, 10).map((badge, idx) => {
                    const color = getAchievementColor(badge.title);
                    const isBlackWhite = color === 'BLACK_WHITE';
                    return (
                      <div
                        key={badge.id || idx}
                        className="flex items-center justify-center"
                      >
                        <div 
                          className={`w-10 h-10 flex items-center justify-center rounded-full shadow-sm ${
                            isBlackWhite ? 'bg-gray-900 border border-white/10' : `bg-gradient-to-br ${color} border border-black/5`
                          }`}
                        >
                          {getAchievementIcon(badge.title, true, 'default')}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {earnedBadges.length > 10 && (
                  <div 
                    className="text-[9px] font-medium mt-0.5"
                    style={{ color: theme.secondaryText }}
                  >
                    +{earnedBadges.length - 10} more
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4">
                <p 
                  className="text-xs font-medium"
                  style={{ color: theme.secondaryText }}
                >
                  No badges earned yet.
                </p>
              </div>
            )}
            
            {/* Achievement Signature Line - Only show in yearly/weekly mode */}
            {mode !== 'monthly' && (
              <div className="flex flex-col items-center justify-center gap-1 pt-4">
                <div className="flex items-center gap-1.5">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6953bfa67629f34f674461da/6d21a8071_AppIcon.png"
                    alt="Bible Built"
                    className="w-5 h-5 rounded-md"
                    style={{ opacity: theme.logoOpacity }}
                  />
                  <div 
                    className="text-xs font-semibold tracking-wide"
                    style={{ color: theme.brandingText }}
                  >
                    Bible Built
                  </div>
                </div>
                <div 
                  className="text-[9px] font-medium tracking-wide"
                  style={{ color: theme.brandingTagline }}
                >
                  Track what matters
                </div>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Month Navigation */}
        {mode === 'monthly' && (
          <div className="w-full max-w-md px-6">
            <div 
              className="h-px w-full mb-6"
              style={{ backgroundColor: theme.divider }}
            />
            <div className="flex items-center justify-center pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-full hover:bg-accent transition-colors active:scale-95"
                  style={{ color: theme.secondaryText, backgroundColor: theme.cardBg }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div 
                  className="text-sm font-semibold px-4 py-2 rounded-full shadow-sm"
                  style={{ 
                    color: theme.primaryText,
                    backgroundColor: theme.cardBg
                  }}
                >
                  {format(selectedMonthDate, 'MMMM yyyy')}
                </div>
                <button
                  onClick={handleNextMonth}
                  disabled={isCurrentMonthSelected}
                  className="p-2 rounded-full hover:bg-accent transition-colors active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                  style={{ color: theme.secondaryText, backgroundColor: theme.cardBg }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Week Navigation */}
        {mode === 'weekly' && (
          <div className="w-full max-w-md px-6">
            <div 
              className="h-px w-full mb-6"
              style={{ backgroundColor: theme.divider }}
            />
            <div className="flex items-center justify-center pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setWeekOffset(prev => prev - 1)}
                  className="p-2 rounded-full hover:bg-accent transition-colors active:scale-95"
                  style={{ color: theme.secondaryText, backgroundColor: theme.cardBg }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div 
                  className="text-sm font-semibold px-4 py-2 rounded-full shadow-sm text-center"
                  style={{ 
                    color: theme.primaryText,
                    backgroundColor: theme.cardBg,
                    minWidth: '160px'
                  }}
                >
                  {weekOffset === 0 ? 'This Week' : weekOffset === -1 ? 'Last Week' : weeklyRange.label}
                </div>
                <button
                  onClick={() => setWeekOffset(prev => prev + 1)}
                  disabled={weekOffset >= 0}
                  className="p-2 rounded-full hover:bg-accent transition-colors active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                  style={{ color: theme.secondaryText, backgroundColor: theme.cardBg }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}