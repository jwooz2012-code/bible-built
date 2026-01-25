import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import html2canvas from 'html2canvas';
import { Share2, Download, Loader2 } from 'lucide-react';
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
  let startDate, endDate, displayTitle;
  if (mode === 'monthly' && month) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    startDate = getDateKey(firstDay);
    endDate = getDateKey(lastDay);
    displayTitle = format(firstDay, 'MMMM yyyy');
  } else {
    const firstDay = new Date(year, 0, 1);
    const lastDay = new Date(year, 11, 31);
    startDate = getDateKey(firstDay);
    endDate = getDateKey(lastDay);
    displayTitle = year.toString();
  }

  // Fetch reading logs for the period
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

  // Define badges array FIRST - single source of truth
  const badges = defineBadges({
    totalChaptersRead: totalChapters,
    daysWithReadingDistinct: uniqueDays,
    totalBooksCompletedDistinct: booksRead,
    lifetimeUniqueChapters: totalChapters,
    ntReadThroughCount: Math.floor(ntChapters / 260),
    otOrNtCompletedFlag: otChapters >= 929 || ntChapters >= 260,
    mostCompletedBookCount: 0,
    statsSharedCount: user?.statsSharedCount || 0,
    statsReceivedCount: user?.statsReceivedCount || 0
  });

  // Get earned badges for display
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
          <div className="pt-10 px-6 pb-6 flex-shrink-0">
            <h1 className="text-3xl font-bold text-gray-900 text-center leading-tight">
              {displayTitle}
            </h1>
            <p className="text-xs text-gray-500 text-center mt-1.5 font-medium uppercase tracking-wide">
              Reading Summary
            </p>
          </div>

          {/* Main Content - Spacious Hierarchy */}
          <div className="flex-1 flex flex-col px-6 pb-4 gap-6 overflow-hidden">
            {/* Hero Stat - Premium Card */}
            <div className="flex flex-col items-center justify-center bg-gray-900 rounded-2xl p-10 shadow-sm flex-shrink-0 relative">
              <div className="text-7xl font-bold text-white mb-3 tracking-tight">
                {totalChapters}
              </div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                Chapters Read
              </div>
              
              {/* Share button embedded in hero */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={handleShare}
                  disabled={isExporting}
                  className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Share2 className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Secondary Stats - 4 Tiles Only */}
            <div className="grid grid-cols-4 gap-2.5 flex-shrink-0">
              {secondaryStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl"
                >
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-[9px] text-gray-500 text-center font-semibold uppercase tracking-wide mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Badges Grid - Always Visible */}
            <div className="flex-1 flex flex-col gap-2.5 overflow-hidden min-h-0">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center">
                Badges Earned
              </div>
              {earnedBadges.length > 0 ? (
                <div className="flex-1 flex items-start justify-center overflow-hidden pt-1">
                  <div 
                    className={`grid gap-2.5 ${
                      earnedBadges.length <= 3 ? 'grid-cols-3' :
                      earnedBadges.length <= 6 ? 'grid-cols-3' :
                      earnedBadges.length <= 9 ? 'grid-cols-3' :
                      'grid-cols-4'
                    }`}
                  >
                    {earnedBadges.slice(0, 12).map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center justify-center"
                      >
                        <div 
                          className="w-14 h-14 flex items-center justify-center bg-white rounded-full border-2 border-gray-200 shadow-sm"
                        >
                          {getAchievementIcon(badge.title, true, 'large')}
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

          {/* Footer - Signature */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex flex-col items-center gap-0.5">
            <div className="text-[10px] font-bold text-gray-900 tracking-wider uppercase">
              Bible Built
            </div>
            <div className="text-[8px] text-gray-500 font-medium">Track what matters</div>
          </div>
        </div>
      </div>
    </div>
  );
}