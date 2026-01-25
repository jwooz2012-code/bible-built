import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import html2canvas from 'html2canvas';
import { Share2, Download, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parse } from 'date-fns';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { getBadgesForRow, defineBadges } from '@/components/badges/badgeUtils';
import { getAchievementIcon } from '@/components/badges/badgeIcons';

export default function ShareSummary() {
  const [searchParams] = useSearchParams();
  const screenshotRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  const mode = searchParams.get('mode') || 'yearly'; // 'monthly' or 'yearly'
  const yearParam = searchParams.get('year') || new Date().getFullYear().toString();
  const monthParam = searchParams.get('month'); // 1-12 for monthly view

  const year = parseInt(yearParam);
  const month = monthParam ? parseInt(monthParam) : null;

  // Determine date range
  let startDate, endDate, displayTitle, displaySubtitle;
  if (mode === 'monthly' && month) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    startDate = getDateKey(firstDay);
    endDate = getDateKey(lastDay);
    displayTitle = format(firstDay, 'MMMM yyyy');
    displaySubtitle = 'Reading Summary';
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

  // Calculate LIFETIME stats for badge determination
  const lifetimeTotalChapters = lifetimeLogs.length;
  const lifetimeUniqueDays = new Set(lifetimeLogs.map((l) => l.dateKey)).size;
  const lifetimeUniqueChapters = new Set(lifetimeLogs.map((l) => l.chapterId)).size;
  const lifetimeBooksCompleted = new Set(lifetimeLogs.map((l) => l.bookIndex)).size;
  const lifetimeOtChapters = lifetimeLogs.filter((l) => l.testament === 'OT').length;
  const lifetimeNtChapters = lifetimeLogs.filter((l) => l.testament === 'NT').length;
  
  // Calculate most completed book count
  const bookCompletionCounts = {};
  lifetimeLogs.forEach((log) => {
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

  // Define badges using LIFETIME stats - source of truth
  const badges = defineBadges({
    totalChaptersRead: lifetimeTotalChapters,
    daysWithReadingDistinct: lifetimeUniqueDays,
    totalBooksCompletedDistinct: lifetimeBooksCompleted,
    lifetimeUniqueChapters: lifetimeUniqueChapters,
    ntReadThroughCount: Math.floor(lifetimeNtChapters / 260),
    otOrNtCompletedFlag: lifetimeUniqueChapters >= 929 || lifetimeUniqueChapters >= 260,
    mostCompletedBookCount: mostCompletedBookCount,
    statsSharedCount: user?.statsSharedCount || 0,
    statsReceivedCount: user?.statsReceivedCount || 0
  });

  // Get earned badges for display (ALL earned badges, not filtered by timeframe)
  const earnedBadges = getBadgesForRow(badges, 'earned');

  // Secondary stats - only 4 for spacious layout
  const secondaryStats = [
    { label: 'Days', value: uniqueDays },
    { label: 'Books', value: booksRead },
    { label: 'Best Streak', value: longestStreak },
    { label: 'Best Day', value: bestDay },
  ];

  // Share/Export handler
  const handleShare = async () => {
    setIsExporting(true);
    try {
      const canvas = await html2canvas(screenshotRef.current, {
        backgroundColor: 'rgb(255, 255, 255)',
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pb-[calc(7rem+env(safe-area-inset-bottom))]">
      {/* Actual screenshot-ready content */}
      <div
        ref={screenshotRef}
        className="w-full max-w-md bg-white relative shadow-2xl"
        style={{ aspectRatio: '9/16', minHeight: '600px' }}
      >
        {/* Container that fits content in one viewport */}
        <div className="w-full h-full flex flex-col relative overflow-hidden bg-white">
          {/* Header - Compact */}
          <div className="pt-8 px-6 pb-4 flex-shrink-0">
            <h1 className="text-3xl font-bold text-gray-900 text-center leading-tight">
              {displayTitle}
            </h1>
            <p className="text-xs text-gray-500 text-center mt-1.5 font-medium uppercase tracking-wide">
              {displaySubtitle}
            </p>
          </div>

          {/* Main Content - Spacious Hierarchy */}
          <div className="flex-1 flex flex-col px-6 pb-3 gap-5 overflow-hidden">
            {/* Hero Stat - Premium Card */}
            <div className="flex flex-col items-center justify-center bg-gray-900 rounded-2xl p-8 shadow-sm flex-shrink-0">
              <div className="text-7xl font-bold text-white mb-2 tracking-tight">
                {totalChapters}
              </div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                Chapters Read
              </div>
            </div>

            {/* Secondary Stats - 4 Tiles Only */}
            <div className="grid grid-cols-4 gap-2 flex-shrink-0">
              {secondaryStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center p-2.5 bg-gray-50 rounded-xl"
                >
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-[9px] text-gray-500 text-center font-semibold uppercase tracking-wide mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Badges Grid - Always Visible */}
            <div className="flex-1 flex flex-col gap-2 overflow-hidden min-h-0">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center">
                Badges Earned
              </div>
              {earnedBadges.length > 0 ? (
                <div className="flex-1 flex items-start justify-center overflow-hidden">
                  <div 
                    className={`grid ${
                      earnedBadges.length <= 3 ? 'grid-cols-3 gap-3' :
                      earnedBadges.length <= 6 ? 'grid-cols-3 gap-2.5' :
                      earnedBadges.length <= 12 ? 'grid-cols-4 gap-2' :
                      earnedBadges.length <= 18 ? 'grid-cols-5 gap-1.5' :
                      'grid-cols-6 gap-1.5'
                    }`}
                  >
                    {earnedBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center justify-center"
                      >
                        <div 
                          className={`${
                            earnedBadges.length <= 6 ? 'w-14 h-14 border-2' :
                            earnedBadges.length <= 12 ? 'w-11 h-11 border-2' :
                            'w-9 h-9 border-[1.5px]'
                          } flex items-center justify-center bg-white rounded-full border-gray-200 shadow-sm`}
                        >
                          {getAchievementIcon(badge.title, true, earnedBadges.length <= 6 ? 'large' : 'default')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xs text-gray-400 font-medium">No badges earned yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Signature with Logo */}
          <div className="flex-shrink-0 px-6 py-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6953bfa67629f34f674461da/6d21a8071_AppIcon.png"
                alt="Bible Built"
                className="w-7 h-7 rounded-lg"
              />
              <div className="flex flex-col gap-0.5">
                <div className="text-[10px] font-bold text-gray-900 tracking-wider uppercase leading-none">
                  Bible Built
                </div>
                <div className="text-[8px] text-gray-500 font-medium leading-none">Track what matters</div>
              </div>
            </div>
            <button
              onClick={handleShare}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-full bg-gray-900 text-white text-[10px] font-semibold uppercase tracking-wide flex items-center gap-1.5 hover:bg-gray-800 transition-colors"
            >
              {isExporting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Share2 className="w-3 h-3" />
              )}
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}