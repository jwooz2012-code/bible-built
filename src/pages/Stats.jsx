import React, { useState, useEffect, useMemo } from 'react';

import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { createPageUrl } from '@/utils';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { useReadingStats } from '@/components/bible/hooks/useReadingStats';
import { useCurrentStreak } from '@/components/bible/hooks/useCurrentStreak';
import { TOTAL_CHAPTERS, OT_CHAPTERS, NT_CHAPTERS, BIBLE_BOOKS } from '@/components/bible/bibleData';
import { 
  Pencil, 
  Zap, 
  BookMarked, 
  CalendarCheck, 
  Library, 
  Award, 
  Flame, 
  Blocks, 
  Columns, 
  BookCopy, 
  Ruler, 
  ScrollText, 
  Crown, 
  RefreshCw, 
  TreePine, 
  Hammer,
  Circle,
  Sword,
  Swords,
  BarChart2
} from 'lucide-react';
import { toast } from 'sonner';
import VelocityMeter from '@/components/trackers/VelocityMeter';
import CoverageRadar from '@/components/trackers/CoverageRadar';
import BookCompletionBars from '@/components/trackers/BookCompletionBars';
import PersonalRecordsCard from '@/components/trackers/PersonalRecordsCard';
import BadgeStrip from '@/components/badges/BadgeStrip';
import BadgeListWithProgress from '@/components/trackers/BadgeListWithProgress';
import { computeBadgeState } from '@/components/badges/badgeEngine';
import { getAchievementIcon, getAchievementColor } from '@/components/badges/badgeIcons';
import { groupByDateKey, computeVelocity, computeBookProgress, computeSectionCoverage, computeRecords } from '@/components/trackers/deriveStats';
import { BOOK_TO_SECTION, computeSectionTotals } from '@/components/bible/bibleSections';
import { getDateKey } from '@/components/bible/utils/dateUtils';

export default function Stats() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isLoading && !lifetimeLoading && window.location.hash === '#badges-section') {
      setTimeout(() => {
        document.getElementById('badges-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [isLoading, lifetimeLoading]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBaselineDialog, setShowBaselineDialog] = useState(false);
  const [baselineInput, setBaselineInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    base44.auth.me().
    then((u) => {if (mounted) {setUser(u);setIsLoading(false);}}).
    catch(() => {if (mounted) setIsLoading(false);});
    return () => {mounted = false;};
  }, []);

  const userId = user?.id;
  const currentYear = new Date().getFullYear();
  const yearStart = `${currentYear}-01-01`;
  const yearEnd = `${currentYear}-12-31`;

  const { data: yearLogs = [], isLoading: yearLoading } = useReadingLogsRange(userId, yearStart, yearEnd);
  const { data: lifetimeLogs = [], isLoading: lifetimeLoading } = useReadingLogsRange(userId, '2000-01-01', '2099-12-31');

  const yearStats = useReadingStats(yearLogs);
  const lifetimeStats = useReadingStats(lifetimeLogs);

  const today = getDateKey();
  
  // Single source of truth for current streak
  const currentStreak = useCurrentStreak(lifetimeLogs);

  const trackerStats = useMemo(() => {
    if (!lifetimeLogs.length) {
      return {
        velocity: { avg7: 0, trend: 'flat' },
        sectionCoverage: [],
        bookProgressYear: [],
        bookProgressLifetime: [],
        records: { longestStreak: 0, bestRolling7: 0, bestMonth: 0, mostReadBook: { name: 'None', count: 0 }, mostCompletedBook: { name: 'None', count: 0 } }
      };
    }

    const dateCountMap = groupByDateKey(lifetimeLogs);
    const velocity = computeVelocity(dateCountMap, today);
    const sectionTotals = computeSectionTotals(BIBLE_BOOKS, BOOK_TO_SECTION);
    const sectionCoverage = computeSectionCoverage(lifetimeLogs, BOOK_TO_SECTION, sectionTotals);
    const bookProgressYear = computeBookProgress(yearLogs, BIBLE_BOOKS, 'year');
    const bookProgressLifetime = computeBookProgress(lifetimeLogs, BIBLE_BOOKS, 'lifetime');
    const records = computeRecords(dateCountMap, lifetimeLogs);

    return { velocity, sectionCoverage, bookProgressYear, bookProgressLifetime, records };
  }, [lifetimeLogs, yearLogs, today]);

  const baselineCompletions = user?.baselineCompletions || 0;
  const trackedCompletions = lifetimeStats.timesThroughBible;
  const lifetimeTotal = baselineCompletions + trackedCompletions;

  // Calculate additional stats for achievements
  const totalChaptersRead = lifetimeStats.totalCount;
  const bibleReadThroughCount = lifetimeTotal;

  // Count distinct books completed (books where ALL chapters have been read)
  const totalBooksCompletedDistinct = (() => {
    const bookChaptersRead = {};
    lifetimeLogs.forEach((log) => {
      if (!bookChaptersRead[log.book]) {
        bookChaptersRead[log.book] = new Set();
      }
      bookChaptersRead[log.book].add(log.chapter);
    });

    let completedCount = 0;
    Object.keys(bookChaptersRead).forEach((bookName) => {
      const bookData = BIBLE_BOOKS.find((b) => b.name === bookName);
      if (bookData && bookChaptersRead[bookName].size >= bookData.chapters) {
        completedCount++;
      }
    });
    return completedCount;
  })();

  // Count distinct days with reading
  const uniqueDays = new Set(lifetimeLogs.map((log) => log.dateKey));
  const daysWithReadingDistinct = uniqueDays.size;

  // NT read through count
  const ntReadThroughCount = Math.floor(lifetimeStats.ntCount / NT_CHAPTERS);

  // Check if OT or NT completed at least once
  const otOrNtCompletedFlag = lifetimeStats.otCount >= OT_CHAPTERS || lifetimeStats.ntCount >= NT_CHAPTERS;

  // Use centralized badge engine
  const badgeState = computeBadgeState(lifetimeLogs, user, { debug: false });
  const achievements = badgeState.badges;


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>);

  }

  if (!user || !userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>);

  }

  const handleEditBaseline = () => {
    setBaselineInput(String(baselineCompletions));
    setShowBaselineDialog(true);
  };

  const handleSaveBaseline = async () => {
    const value = parseInt(baselineInput, 10);
    if (isNaN(value) || value < 0 || value > 99) {
      toast.error('Please enter a number between 0 and 99');
      return;
    }

    setIsSaving(true);
    try {
      await base44.auth.updateMe({ baselineCompletions: value });
      setUser({ ...user, baselineCompletions: value });
      setShowBaselineDialog(false);
      toast.success('Updated starting count.');
    } catch (error) {
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-5 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3"
        >
          <h1 className="text-3xl font-semibold text-foreground">Statistics</h1>
        </motion.div>



        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="bg-card border border-border/60 rounded-2xl p-5 mb-4"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'hsl(var(--primary)/0.07)' }}>
              <CalendarCheck className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
            </div>
            <p className="text-sm font-medium text-muted-foreground">This Year ({currentYear})</p>
          </div>

          {yearLoading ?
          <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div> :

          <div className="space-y-5">
              <div className="pb-5 border-b border-border/60">
                <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide mb-2">Unique Chapters Read</p>
                <p className="text-[3.25rem] font-bold text-foreground tracking-tight leading-none mb-3">{yearStats.totalCount}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[13px] text-muted-foreground/70">{yearStats.totalCount} / {TOTAL_CHAPTERS}</span>
                  <span className="text-[13px] text-muted-foreground/40">·</span>
                  <span className="text-[13px] text-muted-foreground/70">{yearStats.totalPercent}%</span>
                </div>
                <div className="relative w-full h-1 bg-secondary rounded-full overflow-hidden">
                  <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.max(0, Math.min(100, yearStats.totalPercent || 0))}%`,
                    background: 'linear-gradient(90deg, #F97316 0%, #FACC15 50%, #FB923C 100%)',
                  }} />
                </div>
                <p className="text-[11px] text-muted-foreground/50 mt-2">
                  Counts each chapter once this year toward reading the Bible through.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/60 border border-border/40 rounded-xl p-4">
                  <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide mb-2">Old Testament</p>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{yearStats.otCount}</p>
                  <p className="text-[13px] text-muted-foreground/60 mt-1">{yearStats.otPercent}%</p>
                  </div>
                  <div className="bg-secondary/60 border border-border/40 rounded-xl p-4">
                  <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide mb-2">New Testament</p>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{yearStats.ntCount}</p>
                  <p className="text-[13px] text-muted-foreground/60 mt-1">{yearStats.ntPercent}%</p>
                </div>
              </div>

              {(() => {
              const uniqueReadingDays = new Set(yearLogs.map((log) => log.dateKey)).size;
              if (uniqueReadingDays === 0) return null;
              const avgChaptersPerDay = yearStats.totalCount / uniqueReadingDays;
              const remainingChapters = TOTAL_CHAPTERS - yearStats.totalCount;
              const estimatedDays = Math.ceil(remainingChapters / avgChaptersPerDay);
              return (
                <p className="text-[13px] text-muted-foreground/60 text-center pt-1">
                    At this pace: ~{estimatedDays} days to finish
                  </p>);
            })()}
            </div>
          }
        </motion.div>

        {/* Total Chapters Read Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.05 }}
          className="bg-card border border-border/60 rounded-2xl p-5 mb-4"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)', backgroundColor: 'hsl(var(--primary)/0.025)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'hsl(var(--primary)/0.07)' }}>
              <BarChart2 className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Total Chapters Read</p>
          </div>
          <p className="text-[3.25rem] font-bold text-foreground tracking-tight leading-none">{lifetimeLogs.length}</p>
          <p className="text-[11px] font-medium text-muted-foreground/60 mt-2">Includes every chapter logged, including repeated readings.</p>
        </motion.div>

        {/* Reading Velocity Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.08 }}
          className="mb-8">
          <VelocityMeter avg7={trackerStats.velocity.avg7} trend={trackerStats.velocity.trend} />
        </motion.div>

        {/* Bible Coverage Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.1 }}
          className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">Bible Coverage</h2>
            <p className="text-sm text-muted-foreground">Where you've spent time in Scripture</p>
          </div>
          <CoverageRadar sectionData={trackerStats.sectionCoverage} />
        </motion.div>

        {/* Books Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.12 }}
          className="mb-8">
          <BookCompletionBars
            bookProgressYear={trackerStats.bookProgressYear}
            bookProgressLifetime={trackerStats.bookProgressLifetime} />
        </motion.div>

        {/* Records Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.14 }}
          className="mb-8">
          <PersonalRecordsCard records={trackerStats.records} currentStreak={currentStreak} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.16 }}>
          <div id="badges-section" className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">Badges</h2>
            <p className="text-sm text-muted-foreground">Milestones you've earned</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="mb-4 flex items-center gap-3">
              <Award className="w-6 h-6" style={{ color: '#FACC15' }} />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {achievements.filter((a) => a.achieved).length} / {achievements.length} unlocked
                </p>
              </div>
            </div>

            {!lifetimeLoading && achievements.filter((a) => a.achieved).length > 0 && (
              <div className="mb-6 pb-5 border-b border-border">
                <BadgeStrip badges={achievements} showLabel={false} />
              </div>
            )}

          {lifetimeLoading ?
          <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div> :

          <>
            <BadgeListWithProgress achievements={achievements} getAchievementColor={getAchievementColor} getAchievementIcon={getAchievementIcon} />
          </>
            }
            </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.18 }}
          className="bg-card border border-border/60 rounded-2xl p-5 mb-6 relative"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditBaseline}
            className="absolute top-3 right-3 h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'hsl(var(--primary)/0.07)' }}>
              <RefreshCw className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Times Through the Bible</p>
          </div>

          {lifetimeLoading ?
          <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div> :
          <div>
            <p className="text-[3.25rem] font-bold text-foreground tracking-tight leading-none mb-4" style={{ color: '#F97316' }}>{lifetimeTotal}</p>
            <p className="text-[13px] text-muted-foreground/70 mb-3">
              {lifetimeStats.progressToNext} / {TOTAL_CHAPTERS} · {lifetimeStats.percentToNext}% toward next completion
            </p>
            <div className="relative w-full h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${lifetimeStats.percentToNext}%`,
                  background: 'linear-gradient(90deg, #F97316 0%, #FACC15 100%)'
                }}
              />
            </div>
          </div>
          }
        </motion.div>
            </div>

            <Dialog open={showBaselineDialog} onOpenChange={setShowBaselineDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Starting Count</DialogTitle>
            <DialogDescription>
              Completions before using Bible Built. Does not change reading logs.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              min="0"
              max="99"
              value={baselineInput}
              onChange={(e) => setBaselineInput(e.target.value)}
              placeholder="0"
              className="text-center text-lg" />

          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBaselineDialog(false)}
              disabled={isSaving}>

              Cancel
            </Button>
            <Button
              onClick={handleSaveBaseline}
              disabled={isSaving}>

              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);

}