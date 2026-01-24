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
import { getBadgeIcon, getBadgeColor } from '@/components/badges/badgeIcons';

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

  // Build badge list (yearly only)
  const badges =
    mode === 'yearly'
      ? getBadgesForRow({
          totalChapters,
          uniqueDays,
          booksRead,
          longestStreak,
          otChapters,
          ntChapters,
        })
      : [];

  const earnedBadges = badges.filter((b) => b.achieved);

  // Stats for display
  const statTiles = [
    {
      label: 'Chapters Read',
      value: totalChapters.toString(),
    },
    {
      label: 'Reading Days',
      value: uniqueDays.toString(),
    },
    {
      label: 'Books',
      value: booksRead.toString(),
    },
    {
      label: 'OT Chapters',
      value: otChapters.toString(),
    },
    {
      label: 'NT Chapters',
      value: ntChapters.toString(),
    },
    {
      label: 'Best Streak',
      value: longestStreak.toString(),
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Actual screenshot-ready content */}
      <div
        ref={screenshotRef}
        className="w-full max-w-md bg-white relative"
        style={{ aspectRatio: '9/16', minHeight: '600px' }}
      >
        {/* Container that fits content in one viewport */}
        <div className="w-full h-full flex flex-col relative overflow-hidden bg-white">
          {/* Header */}
          <div className="pt-8 px-6 pb-6 flex-shrink-0">
            <h1 className="text-2xl font-bold text-foreground text-center">
              {displayTitle} Reading Summary
            </h1>
          </div>

          {/* Main Content - Flex to fill available space */}
          <div className="flex-1 flex flex-col px-6 pb-6 gap-6 overflow-hidden">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 flex-shrink-0">
              {statTiles.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-1 p-3 bg-muted/40 rounded-lg"
                >
                  <div className="text-2xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground text-center whitespace-nowrap">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Badges Grid - Yearly Only */}
            {mode === 'yearly' && earnedBadges.length > 0 && (
              <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Achievements
                </div>
                <div className="flex-1 grid gap-2 auto-rows-max overflow-hidden">
                  <div className="grid grid-cols-6 gap-1">
                    {earnedBadges.map((badge) => {
                      const Icon = getBadgeIcon(badge.title, true);
                      return (
                        <div
                          key={badge.id}
                          className="flex items-center justify-center"
                          title={badge.title}
                        >
                          {Icon && (
                            <div className="w-8 h-8 flex items-center justify-center">
                              {Icon}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Branding */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-border/50 flex flex-col items-center gap-1">
            <div className="text-xs font-semibold text-foreground">
              Bible Built
            </div>
            <div className="text-xs text-muted-foreground">Track what matters</div>
          </div>
        </div>
      </div>

      {/* Share Button - Outside screenshot */}
      <div className="fixed bottom-6 right-6 flex gap-2">
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