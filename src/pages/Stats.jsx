import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import StatsTopActions from '@/components/stats/StatsTopActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { createPageUrl } from '@/utils';
import { ChevronRight } from 'lucide-react';
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
  Swords
} from 'lucide-react';
import { toast } from 'sonner';
import VelocityMeter from '@/components/trackers/VelocityMeter';
import CoverageRadar from '@/components/trackers/CoverageRadar';
import BookCompletionBars from '@/components/trackers/BookCompletionBars';
import PersonalRecordsCard from '@/components/trackers/PersonalRecordsCard';
import BadgeRowHorizontal from '@/components/badges/BadgeRowHorizontal';
import { defineBadges } from '@/components/badges/badgeUtils';
import { getAchievementIcon, getAchievementColor } from '@/components/badges/badgeIcons';
import { groupByDateKey, computeVelocity, computeBookProgress, computeSectionCoverage, computeRecords } from '@/components/trackers/deriveStats';
import { BOOK_TO_SECTION, computeSectionTotals } from '@/components/bible/bibleSections';
import { getDateKey } from '@/components/bible/utils/dateUtils';

export default function Stats() {
  const [user, setUser] = useState(null);
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

  // Use centralized badge definition
  const achievements = defineBadges({
    totalChaptersRead,
    daysWithReadingDistinct,
    totalBooksCompletedDistinct,
    lifetimeUniqueChapters: lifetimeStats.uniqueChapters,
    ntReadThroughCount,
    otOrNtCompletedFlag,
    mostCompletedBookCount: trackerStats.records.mostCompletedBook.count,
    statsSharedCount: user?.statsSharedCount || 0,
    statsReceivedCount: user?.statsReceivedCount || 0
  });


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
      <div className="max-w-2xl mx-auto px-5 py-8">
        <PageHeader title="Statistics" subtitle="Your reading progress" />

        {/* Top Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 gap-3">
            <StatsTopActions />
            <Link 
              to={createPageUrl('accountability')} 
              className="flex items-center justify-center gap-2 bg-card border border-border rounded-xl px-4 h-10 hover:bg-accent transition-colors text-sm font-medium text-foreground"
            >
              Accountability
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="bg-card border border-border rounded-2xl p-5 mb-8">

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              This Year ({currentYear})
            </h2>
          </div>

          {yearLoading ?
          <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div> :

          <div className="space-y-4">
              <div className="text-center pb-4 border-b border-border">
                <p className="text-sm text-muted-foreground mb-2">Chapters Read</p>
                <p className="text-5xl font-bold text-foreground mb-3">{yearStats.totalCount}</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground font-medium">{yearStats.totalCount} / {TOTAL_CHAPTERS}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground font-medium">{yearStats.totalPercent}%</span>
                </div>
                <div className="relative w-full h-1 bg-secondary rounded-full overflow-hidden">
                  <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.max(0, Math.min(100, yearStats.totalPercent || 0))}%`,
                    background: 'linear-gradient(90deg, #F97316 0%, #FACC15 50%, #FB923C 100%)',
                    boxShadow: '0 0 8px var(--energy-glow)'
                  }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1.5">Old Testament</p>
                  <p className="text-xl font-semibold text-foreground">{yearStats.otCount}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{yearStats.otPercent}%</p>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1.5">New Testament</p>
                  <p className="text-xl font-semibold text-foreground">{yearStats.ntCount}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{yearStats.ntPercent}%</p>
                </div>
              </div>

              {(() => {
              const uniqueReadingDays = new Set(yearLogs.map((log) => log.dateKey)).size;
              if (uniqueReadingDays === 0) return null;
              const avgChaptersPerDay = yearStats.totalCount / uniqueReadingDays;
              const remainingChapters = TOTAL_CHAPTERS - yearStats.totalCount;
              const estimatedDays = Math.ceil(remainingChapters / avgChaptersPerDay);
              return (
                <p className="text-xs text-muted-foreground/80 text-center pt-1">
                    At this pace: ~{estimatedDays} days to finish
                  </p>);

            })()}
            </div>
          }
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.05 }}
          className="bg-card border border-border rounded-2xl p-5 mb-8">

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">Lifetime</h2>
            <p className="text-sm text-muted-foreground">All-time reading history</p>
          </div>

          {lifetimeLoading ?
          <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div> :

          <div className="space-y-4">
              <div className="text-center rounded-xl p-4 relative" style={{
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(250, 204, 21, 0.12) 100%)',
              boxShadow: '0 0 16px var(--energy-glow)'
            }}>
                <Button
                variant="ghost"
                size="sm"
                onClick={handleEditBaseline} className="text-muted-foreground text-xs font-medium opacity-100 rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent absolute top-2 right-2 h-8 w-8 p-0 hover:text-foreground">


                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <p className="text-xs text-muted-foreground mb-1.5">Times Through the Bible</p>
                <p className="text-5xl font-bold mb-2" style={{ color: '#F97316' }}>{lifetimeTotal}</p>
                <div className="space-y-1.5 mt-3">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <span>{lifetimeStats.progressToNext} / {TOTAL_CHAPTERS}</span>
                    <span>•</span>
                    <span>{lifetimeStats.percentToNext}% to next</span>
                  </div>
                  <div className="relative w-full h-1 bg-background/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${lifetimeStats.percentToNext}%`,
                        background: 'linear-gradient(90deg, #F97316 0%, #FACC15 100%)'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Chapters Read</p>
                <p className="text-3xl font-semibold text-foreground mb-3">{lifetimeStats.totalCount}</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1.5">Old Testament</p>
                    <p className="text-xl font-semibold text-foreground">{lifetimeStats.otCount}</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1.5">New Testament</p>
                    <p className="text-xl font-semibold text-foreground">{lifetimeStats.ntCount}</p>
                  </div>
                </div>
              </div>
            </div>
          }
        </motion.div>

        {/* Reading Velocity Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.1 }}
          className="mb-8">
          <VelocityMeter avg7={trackerStats.velocity.avg7} trend={trackerStats.velocity.trend} />
        </motion.div>

        {/* Bible Coverage Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.12 }}
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
          transition={{ duration: 0.15, delay: 0.14 }}
          className="mb-8">
          <BookCompletionBars
            bookProgressYear={trackerStats.bookProgressYear}
            bookProgressLifetime={trackerStats.bookProgressLifetime} />
        </motion.div>

        {/* Records Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.16 }}
          className="mb-8">
          <PersonalRecordsCard records={trackerStats.records} currentStreak={currentStreak} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.18 }}>
          <div className="mb-4">
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
                <p className="text-xs text-muted-foreground mb-3">Unlocked Badges</p>
                <BadgeRowHorizontal badges={achievements} mode="earned" maxVisible={10} />
              </div>
            )}

          {lifetimeLoading ?
          <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div> :

          <div className="grid grid-cols-1 gap-3">
              {achievements.map((achievement) => {
                const color = getAchievementColor(achievement.title);
                const isBW = color === 'BLACK_WHITE';
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className={`rounded-xl p-4 border transition-all ${
                      achievement.achieved ?
                      'bg-card border-[#F97316]' :
                      'bg-secondary border-border/50'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          achievement.achieved
                            ? isBW
                              ? 'bg-foreground'
                              : `bg-gradient-to-br ${color}`
                            : 'bg-muted'
                        }`}
                        style={{ 
                          opacity: achievement.achieved ? 1 : 0.5,
                          boxShadow: achievement.achieved 
                            ? '0 1px 3px rgba(0,0,0,0.1), inset 0 0.5px 0 rgba(255,255,255,0.1)'
                            : 'none',
                          border: '1.5px solid',
                          borderColor: achievement.achieved 
                            ? 'color-mix(in srgb, var(--border) 60%, transparent)'
                            : 'var(--border)'
                        }}>
                        <div 
                          style={{ 
                            color: achievement.achieved && isBW ? 'hsl(var(--background))' : undefined,
                            filter: achievement.achieved ? 'drop-shadow(0 0.5px 0.5px rgba(0,0,0,0.15))' : 'none',
                            opacity: achievement.achieved ? 0.95 : 1
                          }}>
                          {getAchievementIcon(achievement.title, achievement.achieved)}
                        </div>
                      </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-[15px] ${
                  achievement.achieved ? 'text-foreground' : 'text-muted-foreground'}`
                  }>
                        {achievement.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.subtitle.split('.')[0]}.</p>
                      {!achievement.achieved &&
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                          {achievement.current} / {achievement.target}
                        </p>
                  }
                    </div>
                    {achievement.achieved &&
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #F97316, #FACC15)' }} />

                    }
                    </div>
                  </motion.div>
                );
              })}
            </div>
            }
            </div>
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