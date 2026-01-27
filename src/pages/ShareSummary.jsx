import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import html2canvas from 'html2canvas';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parse } from 'date-fns';
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

  // Use centralized badge engine with timeframe logs
  // This ensures consistency with Stats page
  const badgeState = computeBadgeState(readingLogs, user, { debug: false });
  const badges = badgeState.badges;

  // Get ONLY earned badges - strict filter to match app state
  const earnedBadges = badges.filter(b => b.achieved === true);

  // Secondary stats - only 4 for spacious layout
  const secondaryStats = [
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
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-0 pb-[calc(5rem+env(safe-area-inset-bottom))]"
      style={{ backgroundColor: theme.background }}
    >
      {/* Screenshot-ready content - designed to fit in ONE viewport */}
      <div
        ref={screenshotRef}
        className="w-full h-[calc(100vh-5rem-env(safe-area-inset-bottom))] max-w-md relative"
        style={{ backgroundColor: theme.cardBg }}
      >
        {/* Container that fits ALL content in one viewport without scrolling */}
        <div 
          className="w-full h-full flex flex-col px-6 py-6"
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
            <p 
              className="text-[10px] text-center mt-1 font-semibold uppercase tracking-wider"
              style={{ color: theme.secondaryText }}
            >
              {displaySubtitle}
            </p>
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

          {/* Key Stats Row - 4 Even Stats */}
          <div className="grid grid-cols-4 gap-2.5 flex-shrink-0 mb-5">
            {secondaryStats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl"
                style={{ backgroundColor: theme.statBg }}
              >
                <div 
                  className="text-xl font-bold"
                  style={{ color: theme.statValue }}
                >
                  {stat.value}
                </div>
                <div 
                  className="text-[8px] text-center font-semibold uppercase tracking-wide mt-0.5 leading-tight"
                  style={{ color: theme.statLabel }}
                >
                  {stat.label.replace(' ', '\n')}
                </div>
              </div>
            ))}
          </div>

          {/* Badges Section - All Earned Badges */}
          <div className="flex flex-col">
            <div 
              className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-center mb-2.5"
              style={{ color: theme.badgeSectionLabel }}
            >
              Badges Earned
            </div>
            {earnedBadges && earnedBadges.length > 0 ? (
              <div 
                className="flex items-start justify-center rounded-xl py-3 px-2"
                style={{ backgroundColor: theme.badgeSectionBg }}
              >
                <div 
                  className={`grid ${
                    earnedBadges.length === 1 ? 'grid-cols-1' :
                    earnedBadges.length === 2 ? 'grid-cols-2 gap-3' :
                    earnedBadges.length <= 4 ? 'grid-cols-2 gap-2.5' :
                    earnedBadges.length <= 6 ? 'grid-cols-3 gap-2.5' :
                    earnedBadges.length <= 9 ? 'grid-cols-3 gap-2' :
                    earnedBadges.length <= 12 ? 'grid-cols-4 gap-2' :
                    earnedBadges.length <= 16 ? 'grid-cols-4 gap-1.5' :
                    'grid-cols-5 gap-1.5'
                  } max-w-full`}
                >
                  {earnedBadges.map((badge) => {
                    const color = getAchievementColor(badge.title);
                    const isBlackWhite = color === 'BLACK_WHITE';
                    return (
                      <div
                        key={badge.id}
                        className="flex items-center justify-center"
                      >
                        <div 
                          className={`${
                            earnedBadges.length <= 4 ? 'w-13 h-13' :
                            earnedBadges.length <= 9 ? 'w-11 h-11' :
                            earnedBadges.length <= 16 ? 'w-9 h-9' :
                            'w-7.5 h-7.5'
                          } flex items-center justify-center rounded-full shadow-sm border border-border/30 ${
                            isBlackWhite ? 'bg-gray-900' : `bg-gradient-to-br ${color}`
                          }`}
                        >
                          {getAchievementIcon(badge.title, true, earnedBadges.length <= 9 ? 'large' : 'default')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p 
                  className="text-xs font-medium"
                  style={{ color: theme.secondaryText }}
                >
                  No badges earned yet
                </p>
              </div>
            )}
            
            {/* Achievement Signature Line */}
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
          </div>
        </div>
      </div>
    </div>
  );
}