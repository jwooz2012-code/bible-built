import React, { useRef, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import html2canvas from 'html2canvas';
import { Loader2, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
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
    if (readingLogs.length === 0) return null;
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
    return tied.reduce((a, b) => bookLatest[a] >= bookLatest[b] ? a : b);
  }, [readingLogs]);

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
  const secondaryStats = [
        { label: 'Days', value: uniqueDays },
        { label: 'Books', value: booksRead },
        { label: 'Most Read Book', value: mostReadBook || '—', isText: true },
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
    await new Promise(resolve => setTimeout(resolve, 80));
    
    try {
      const el = screenshotRef.current;
      const canvas = await html2canvas(el, {
        backgroundColor: theme.cardBg,
        scale: 3,
        useCORS: true,
        width: el.offsetWidth,
        height: el.offsetHeight,
        scrollY: 0,
        scrollX: 0,
        windowWidth: el.offsetWidth,
        windowHeight: el.offsetHeight,
        logging: false,
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
        }, 'image/png', 1.0);
      } else {
        // Fallback: download
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png', 1.0);
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
      style={{ backgroundColor: theme.background }}
    >
      <div className="flex flex-col items-center justify-start py-6 gap-6 px-4">

        {/* 9:16 Instagram Story Card */}
        <div
          ref={screenshotRef}
          style={{
            width: '100%',
            maxWidth: '390px',
            aspectRatio: '9 / 16',
            backgroundColor: theme.cardBg,
            backgroundImage: theme.energyAccent,
            display: 'flex',
            flexDirection: 'column',
            padding: '36px 28px 32px',
            boxSizing: 'border-box',
            borderRadius: isShareCaptureMode ? '0' : '24px',
            overflow: 'hidden',
          }}
        >
          {/* Top Branding */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6953bfa67629f34f674461da/6d21a8071_AppIcon.png"
              alt="Bible Built"
              style={{ width: '20px', height: '20px', borderRadius: '5px', opacity: theme.logoOpacity }}
            />
            <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em', color: theme.brandingText }}>Bible Built</span>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: theme.primaryText, lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
              {displayTitle}
            </h1>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.secondaryText, marginTop: '8px' }}>
              {displaySubtitle}
            </p>
          </div>

          {/* Hero Stat */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '24px',
              padding: '32px 24px',
              marginBottom: '20px',
              backgroundColor: theme.heroBg,
              boxShadow: theme.energyGlow || '0 8px 32px rgba(0,0,0,0.18)',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: '80px', fontWeight: 900, color: theme.heroText, lineHeight: 1, letterSpacing: '-0.04em' }}>
              {totalChapters}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.heroLabel, marginTop: '12px' }}>
              Chapters Read
            </div>
          </div>

          {/* 2x2 Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', flexShrink: 0 }}>
            {secondaryStats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '18px 12px',
                  borderRadius: '18px',
                  backgroundColor: theme.statBg,
                  minHeight: '90px',
                }}
              >
                <div style={{
                  fontSize: stat.isText
                    ? ((stat.value || '').length > 14 ? '13px' : (stat.value || '').length > 10 ? '15px' : '24px')
                    : '36px',
                  fontWeight: 900,
                  color: theme.statValue,
                  textAlign: 'center',
                  lineHeight: 1.1,
                  letterSpacing: stat.isText ? '0' : '-0.02em',
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.statLabel, marginTop: '6px', textAlign: 'center' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.badgeSectionLabel, marginBottom: '14px' }}>
              {mode === 'monthly' || mode === 'weekly' ? 'Earned Badges' : 'Badges Earned'}
            </div>
            {earnedBadges && earnedBadges.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {earnedBadges.slice(0, 8).map((badge, idx) => {
                    const color = getAchievementColor(badge.title);
                    const isBlackWhite = color === 'BLACK_WHITE';
                    return (
                      <div key={badge.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div
                          className={isBlackWhite ? '' : `bg-gradient-to-br ${color}`}
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isBlackWhite ? '#111' : undefined,
                            border: isBlackWhite ? '1px solid rgba(255,255,255,0.2)' : undefined,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            flexShrink: 0,
                          }}
                        >
                          {getAchievementIcon(badge.title, true, 'default')}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {earnedBadges.length > 8 && (
                  <div style={{ fontSize: '11px', fontWeight: 600, color: theme.secondaryText, marginTop: '4px' }}>
                    +{earnedBadges.length - 8} more
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '16px 0' }}>
                <p style={{ fontSize: '13px', fontWeight: 500, color: theme.secondaryText }}>No badges earned yet.</p>
              </div>
            )}
          </div>

          {/* Bottom tagline */}
          <div style={{ textAlign: 'center', marginTop: '20px', flexShrink: 0 }}>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: theme.brandingTagline }}>Track what matters</div>
          </div>
        </div>

        {/* Month Navigation (outside card) */}
        {mode === 'monthly' && (
          <div className="w-full max-w-[390px]">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-full hover:bg-accent transition-colors active:scale-95"
                  style={{ color: theme.secondaryText }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-sm font-semibold px-4 py-2 rounded-full" style={{ color: theme.primaryText }}>
                  {format(selectedMonthDate, 'MMMM yyyy')}
                </div>
                <button
                  onClick={handleNextMonth}
                  disabled={isCurrentMonthSelected}
                  className="p-2 rounded-full hover:bg-accent transition-colors active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                  style={{ color: theme.secondaryText }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Week Navigation (outside card) */}
        {mode === 'weekly' && (
          <div className="w-full max-w-[390px]">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setWeekOffset(prev => prev - 1)}
                  className="p-2 rounded-full hover:bg-accent transition-colors active:scale-95"
                  style={{ color: theme.secondaryText }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-sm font-semibold px-4 py-2 rounded-full text-center" style={{ color: theme.primaryText, minWidth: '160px' }}>
                  {weekOffset === 0 ? 'This Week' : weekOffset === -1 ? 'Last Week' : weeklyRange.label}
                </div>
                <button
                  onClick={() => setWeekOffset(prev => prev + 1)}
                  disabled={weekOffset >= 0}
                  className="p-2 rounded-full hover:bg-accent transition-colors active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                  style={{ color: theme.secondaryText }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Button */}
        <div className="w-full max-w-[390px] pb-8">
          <Button
            onClick={handleShare}
            disabled={isExporting}
            className="w-full h-12 text-base font-semibold rounded-2xl"
          >
            {isExporting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Share2 className="w-5 h-5 mr-2" />
            )}
            {isExporting ? 'Preparing...' : 'Share Summary'}
          </Button>
        </div>
      </div>
    </div>
  );
}