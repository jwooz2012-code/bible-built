import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

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
import BibleCoverageCard from '@/components/trackers/BibleCoverageCard';
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
  const location = useLocation();
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

  useEffect(() => {
    if (!isLoading && !lifetimeLoading && location.hash === '#badges-section') {
      setTimeout(() => {
        document.getElementById('badges-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [isLoading, lifetimeLoading, location.hash]);

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

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.32, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] } })
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-5 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Statistics</h1>
        </motion.div>



        <motion.div
          custom={0} variants={cardVariants} initial="hidden" animate="visible"
          className="rounded-2xl p-5 mb-4 overflow-hidden relative"
          style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border)/0.7)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)' }} />

          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}>
              <CalendarCheck className="w-4 h-4" style={{ color: 'rgb(34,197,94)' }} />
            </div>
            <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-widest">This Year · {currentYear}</p>
          </div>

          {yearLoading ?
          <div className="flex justify-center py-12"><LoadingSpinner /></div> :

          <div className="space-y-5">
              <div className="pb-5 border-b border-border/60">
                <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-1">Unique Chapters</p>
                <p className="text-[3.5rem] font-black text-foreground tracking-tight leading-none mb-3">{yearStats.totalCount}</p>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[13px] text-muted-foreground/70">{yearStats.totalCount} / {TOTAL_CHAPTERS}</span>
                  <span className="text-[13px] text-muted-foreground/30">·</span>
                  <span className="text-[13px] font-semibold" style={{ color: 'rgb(34,197,94)' }}>{yearStats.totalPercent}%</span>
                </div>
                <div className="relative w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, yearStats.totalPercent || 0))}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, rgb(34,197,94) 0%, rgb(74,222,128) 100%)' }}
                  />
                </div>
                {(() => {
                  const uniqueReadingDays = new Set(yearLogs.map((log) => log.dateKey)).size;
                  if (uniqueReadingDays === 0) return null;
                  const avgChaptersPerDay = yearStats.totalCount / uniqueReadingDays;
                  const remainingChapters = TOTAL_CHAPTERS - yearStats.totalCount;
                  const estimatedDays = Math.ceil(remainingChapters / avgChaptersPerDay);
                  return (
                    <p className="text-[12px] text-muted-foreground/50 mt-2">At this pace: ~{estimatedDays} days to finish</p>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-2">Old Testament</p>
                  <p className="text-2xl font-black text-foreground tracking-tight">{yearStats.otCount}</p>
                  <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(34,197,94,0.12)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${yearStats.otPercent}%` }} transition={{ duration: 0.7, delay: 0.4 }}
                      className="h-full rounded-full" style={{ background: 'rgb(34,197,94)' }} />
                  </div>
                  <p className="text-[12px] mt-1" style={{ color: 'rgba(34,197,94,0.85)' }}>{yearStats.otPercent}%</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-2">New Testament</p>
                  <p className="text-2xl font-black text-foreground tracking-tight">{yearStats.ntCount}</p>
                  <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(34,197,94,0.12)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${yearStats.ntPercent}%` }} transition={{ duration: 0.7, delay: 0.5 }}
                      className="h-full rounded-full" style={{ background: 'rgb(34,197,94)' }} />
                  </div>
                  <p className="text-[12px] mt-1" style={{ color: 'rgba(34,197,94,0.85)' }}>{yearStats.ntPercent}%</p>
                </div>
              </div>
            </div>
          }
        </motion.div>

        {/* Total Chapters Read Card */}
        <motion.div
          custom={1} variants={cardVariants} initial="hidden" animate="visible"
          className="rounded-2xl p-5 mb-4 relative overflow-hidden"
          style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border)/0.7)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)' }} />
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}>
              <BarChart2 className="w-4 h-4" style={{ color: 'rgb(34,197,94)' }} />
            </div>
            <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-widest">Total Chapters Read</p>
          </div>
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            className="text-[3.5rem] font-black text-foreground tracking-tight leading-none"
            style={{ textShadow: '0 0 30px rgba(34,197,94,0.15)' }}
          >{lifetimeLogs.length}</motion.p>
          <p className="text-[13px] font-medium mt-2" style={{ color: 'hsl(var(--muted-foreground))' }}>Includes every chapter logged, including repeated readings.</p>
        </motion.div>

        {/* Reading Velocity Section */}
        <motion.div
          custom={2} variants={cardVariants} initial="hidden" animate="visible"
          className="mb-8">
          <VelocityMeter avg7={trackerStats.velocity.avg7} trend={trackerStats.velocity.trend} />
        </motion.div>

        {/* Bible Coverage + Books (unified) */}
        <motion.div
          custom={3} variants={cardVariants} initial="hidden" animate="visible"
          className="mb-8">
          <div className="mb-4">
            <h2 className="text-[19px] font-bold text-foreground tracking-tight mb-0.5">Bible Coverage</h2>
            <p className="text-[13px] text-muted-foreground">Your progress across Scripture</p>
          </div>
          <BibleCoverageCard
            sectionData={trackerStats.sectionCoverage}
            bookProgressLifetime={trackerStats.bookProgressLifetime} />
        </motion.div>

        {/* Records Section */}
        <motion.div
          custom={5} variants={cardVariants} initial="hidden" animate="visible"
          className="mb-8">
          <PersonalRecordsCard records={trackerStats.records} currentStreak={currentStreak} />
        </motion.div>

        <motion.div
          custom={6} variants={cardVariants} initial="hidden" animate="visible">
          <div id="badges-section" className="mb-4">
            <h2 className="text-[19px] font-bold text-foreground tracking-tight mb-0.5">Badges</h2>
            <p className="text-[13px] text-muted-foreground">Milestones you've earned</p>
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
          custom={7} variants={cardVariants} initial="hidden" animate="visible"
          className="rounded-2xl p-5 mb-6 relative overflow-hidden"
          style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border)/0.7)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)' }} />

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}>
                <RefreshCw className="w-4 h-4" style={{ color: 'rgb(34,197,94)' }} />
              </div>
              <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-widest">Through the Bible</p>
            </div>
            <button
              onClick={handleEditBaseline}
              className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          {lifetimeLoading ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : (
            <>
              <p className="text-[3.5rem] font-black tracking-tight leading-none mb-1" style={{ color: 'rgb(34,197,94)' }}>{lifetimeTotal}x</p>
              <p className="text-[13px] text-muted-foreground/60 mb-4">complete read-throughs</p>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[12px] text-muted-foreground/70">{lifetimeStats.progressToNext} / {TOTAL_CHAPTERS} chapters</p>
                  <p className="text-[12px] font-semibold" style={{ color: 'rgb(34,197,94)' }}>{lifetimeStats.percentToNext}%</p>
                </div>
                <div className="relative w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${lifetimeStats.percentToNext}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.4 }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, rgb(34,197,94) 0%, rgb(74,222,128) 100%)' }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground/40 mt-2">toward next completion</p>
              </div>
            </>
          )}
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