import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import html2canvas from 'html2canvas';
import { Share2, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parse } from 'date-fns';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { getBadgesForRow } from '@/components/badges/badgeUtils';
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

  // Get badges
  const { data: badgeData = {} } = useQuery({
    queryKey: ['badges', user?.id, readingLogs],
    queryFn: async () => {
      if (!user || !readingLogs.length) return {};
      // Return data that would be used to calculate badges
      // For now, return empty - badges are calculated client-side
      return {
        totalChapters,
        uniqueDays,
        booksRead,
        otChapters,
        ntChapters,
      };
    },
    enabled: !!user && !!readingLogs.length,
  });

  // Build badge list for BOTH monthly and yearly
  const badges = getBadgesForRow({
    totalChapters,
    uniqueDays,
    booksRead,
    longestStreak,
    otChapters,
    ntChapters,
  });

  const earnedBadges = badges.filter((b) => b.achieved);

  // Stats for display - story-driven
  const statTiles = [
    {
      label: 'Chapters',
      value: totalChapters.toString(),
      accent: true,
    },
    {
      label: 'Days',
      value: uniqueDays.toString(),
      accent: false,
    },
    {
      label: 'Books',
      value: booksRead.toString(),
      accent: false,
    },
    {
      label: 'Best Streak',
      value: longestStreak.toString(),
      accent: false,
    },
    {
      label: 'OT',
      value: otChapters.toString(),
      accent: false,
    },
    {
      label: 'NT',
      value: ntChapters.toString(),
      accent: false,
    },
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 pb-[calc(7rem+env(safe-area-inset-bottom))]">
      {/* Actual screenshot-ready content */}
      <div
        ref={screenshotRef}
        className="w-full max-w-md bg-white relative"
        style={{ aspectRatio: '9/16', minHeight: '600px' }}
      >
        {/* Container that fits content in one viewport */}
        <div className="w-full h-full flex flex-col relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)'
        }}>
          {/* Header - The Moment */}
          <div className="pt-12 px-8 pb-8 flex-shrink-0">
            <h1 className="text-4xl font-bold text-gray-900 text-center leading-tight">
              {displayTitle}
            </h1>
            <p className="text-sm text-gray-500 text-center mt-2 font-medium">
              Reading Summary
            </p>
          </div>

          {/* Main Content - The Story */}
          <div className="flex-1 flex flex-col px-8 pb-6 gap-8 overflow-hidden">
            {/* Hero Stat */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-lg flex-shrink-0">
              <div className="text-6xl font-bold text-white mb-2">
                {totalChapters}
              </div>
              <div className="text-sm text-gray-300 font-medium uppercase tracking-wider">
                Chapters Read
              </div>
            </div>

            {/* Secondary Stats - Visual Rhythm */}
            <div className="grid grid-cols-3 gap-3 flex-shrink-0">
              {statTiles.slice(1).map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200"
                >
                  <div className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-gray-500 text-center font-medium uppercase tracking-wide mt-1.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Badges Grid - The Milestones */}
            {earnedBadges.length > 0 && (
              <div className="flex-1 flex flex-col gap-3 overflow-hidden min-h-0">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  Milestones
                </div>
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                  <div 
                    className={`grid gap-2 ${
                      mode === 'monthly' 
                        ? earnedBadges.length <= 3 ? 'grid-cols-3' : 'grid-cols-4'
                        : 'grid-cols-6'
                    }`}
                  >
                    {earnedBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center justify-center"
                        title={badge.title}
                      >
                        <div 
                          className={`${
                            mode === 'monthly' ? 'w-12 h-12' : 'w-10 h-10'
                          } flex items-center justify-center bg-white rounded-full border-2 border-gray-200 shadow-sm`}
                        >
                          {getAchievementIcon(badge.title, true, mode === 'monthly' ? 'large' : 'default')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer - The Signature */}
          <div className="flex-shrink-0 px-8 py-5 border-t border-gray-200 flex flex-col items-center gap-0.5">
            <div className="text-xs font-bold text-gray-900 tracking-wide">
              BIBLE BUILT
            </div>
            <div className="text-[10px] text-gray-500 font-medium">Track what matters</div>
          </div>
        </div>
      </div>

      {/* Share Button - Outside screenshot */}
      <div className="fixed right-6 flex gap-2" style={{ bottom: `calc(6.5rem + env(safe-area-inset-bottom))` }}>
        <Button
          onClick={handleShare}
          disabled={isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          Share
        </Button>
      </div>
    </div>
  );
}