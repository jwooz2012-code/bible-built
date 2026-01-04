import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { useReadingStats } from '@/components/bible/hooks/useReadingStats';
import { TOTAL_CHAPTERS, OT_CHAPTERS, NT_CHAPTERS } from '@/components/bible/bibleData';
import { Trophy } from 'lucide-react';

export default function Stats() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    base44.auth.me()
      .then(u => { if (mounted) { setUser(u); setIsLoading(false); } })
      .catch(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const userId = user?.id;
  const currentYear = new Date().getFullYear();
  const yearStart = `${currentYear}-01-01`;
  const yearEnd = `${currentYear}-12-31`;

  const { data: yearLogs = [], isLoading: yearLoading } = useReadingLogsRange(userId, yearStart, yearEnd);
  const { data: lifetimeLogs = [], isLoading: lifetimeLoading } = useReadingLogsRange(userId, '2000-01-01', '2099-12-31');

  const yearStats = useReadingStats(yearLogs);
  const lifetimeStats = useReadingStats(lifetimeLogs);

  // Calculate additional stats for achievements
  const totalChaptersRead = lifetimeStats.totalCount;
  const bibleReadThroughCount = lifetimeStats.timesThroughBible;
  
  // Count distinct books completed (unique book names from lifetime logs)
  const uniqueBooks = new Set(lifetimeLogs.map(log => log.book));
  const totalBooksCompletedDistinct = uniqueBooks.size;
  
  // Count distinct days with reading
  const uniqueDays = new Set(lifetimeLogs.map(log => log.dateKey));
  const daysWithReadingDistinct = uniqueDays.size;
  
  // NT read through count
  const ntReadThroughCount = Math.floor(lifetimeStats.ntCount / NT_CHAPTERS);
  
  // Check if OT or NT completed at least once
  const otOrNtCompletedFlag = lifetimeStats.otCount >= OT_CHAPTERS || lifetimeStats.ntCount >= NT_CHAPTERS;

  // Define achievements with simple threshold checks
  const achievements = [
    { id: 1, title: 'First Rep', subtitle: 'Read your first chapter', achieved: totalChaptersRead >= 1 },
    { id: 2, title: 'Locked In', subtitle: 'Completed a book', achieved: totalBooksCompletedDistinct >= 1 },
    { id: 3, title: 'Habit Forming', subtitle: 'Read for 7 days', achieved: daysWithReadingDistinct >= 7 },
    { id: 4, title: 'Fifty Down', subtitle: 'Read 50 chapters', achieved: totalChaptersRead >= 50 },
    { id: 5, title: 'Triple Digits', subtitle: 'Read 100 chapters', achieved: totalChaptersRead >= 100 },
    { id: 6, title: 'All In', subtitle: 'Read 250 chapters', achieved: totalChaptersRead >= 250 },
    { id: 7, title: 'Built to Last', subtitle: 'Read 500 chapters', achieved: totalChaptersRead >= 500 },
    { id: 8, title: 'Cover to Cover', subtitle: 'Completed 10 books', achieved: totalBooksCompletedDistinct >= 10 },
    { id: 9, title: 'Testament Strong', subtitle: 'Finished OT or NT', achieved: otOrNtCompletedFlag },
    { id: 10, title: 'The Whole Word', subtitle: 'Read the entire Bible', achieved: bibleReadThroughCount >= 1 },
    { id: 11, title: 'Back for More', subtitle: 'Read the Bible twice', achieved: bibleReadThroughCount >= 2 },
    { id: 12, title: 'Deep Roots', subtitle: 'Read NT 5 times', achieved: ntReadThroughCount >= 5 },
    { id: 13, title: 'Iron Discipline', subtitle: 'Read for 250 days', achieved: daysWithReadingDistinct >= 250 },
    { id: 14, title: 'Master Builder', subtitle: 'Completed 30 books', achieved: totalBooksCompletedDistinct >= 30 },
    { id: 15, title: 'Built for a Lifetime', subtitle: 'Read 1000 chapters', achieved: totalChaptersRead >= 1000 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-20 w-64" />
      </div>
    );
  }

  if (!user || !userId) {
    base44.auth.redirectToLogin();
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-5 py-8">
        <PageHeader title="Statistics" subtitle="Your reading progress" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="bg-card border border-border rounded-2xl p-5 mb-5"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              This Year ({currentYear})
            </h2>
            <div className="w-16 h-[1px] bg-border" />
          </div>

          {yearLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total Progress</span>
                  <span className="text-2xl font-semibold text-foreground">
                    {yearStats.totalCount} <span className="text-sm text-muted-foreground">/ {TOTAL_CHAPTERS}</span>
                  </span>
                </div>
                <div className="relative w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${Math.max(0, Math.min(100, yearStats.totalPercent || 0))}%`,
                      background: 'linear-gradient(90deg, #F97316 0%, #FACC15 50%, #FB923C 100%)',
                      boxShadow: '0 0 12px var(--energy-glow)'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Old Testament</p>
                  <p className="text-2xl font-semibold text-foreground">{yearStats.otCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">{yearStats.otPercent}%</p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">New Testament</p>
                  <p className="text-2xl font-semibold text-foreground">{yearStats.ntCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">{yearStats.ntPercent}%</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.05 }}
          className="bg-card border border-border rounded-2xl p-5 mb-5"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Lifetime</h2>
            <div className="w-16 h-[1px] bg-border" />
          </div>

          {lifetimeLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center rounded-xl p-6" style={{ 
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(250, 204, 21, 0.12) 100%)',
                boxShadow: '0 0 16px var(--energy-glow)'
              }}>
                <p className="text-sm text-muted-foreground mb-2">Times Through the Bible</p>
                <p className="text-5xl font-bold" style={{ color: '#F97316' }}>{lifetimeStats.timesThroughBible}</p>
                <p className="text-xs text-foreground/70 mt-3">
                  {lifetimeStats.percentToNext}% to next ({lifetimeStats.progressToNext}/{TOTAL_CHAPTERS})
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Chapters Read</p>
                <p className="text-4xl font-semibold text-foreground mb-4">{lifetimeStats.totalCount}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Old Testament</p>
                    <p className="text-2xl font-semibold text-foreground">{lifetimeStats.otCount}</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">New Testament</p>
                    <p className="text-2xl font-semibold text-foreground">{lifetimeStats.ntCount}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <div className="mb-6 flex items-center gap-3">
            <Trophy className="w-6 h-6" style={{ color: '#FACC15' }} />
            <div>
              <h2 className="text-xl font-semibold text-foreground">Achievements</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {achievements.filter(a => a.achieved).length} / {achievements.length} unlocked
              </p>
            </div>
          </div>

          {lifetimeLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className={`rounded-xl p-4 border transition-all ${
                    achievement.achieved
                      ? 'bg-gradient-to-br from-[#F97316]/8 via-[#FACC15]/8 to-[#FB923C]/8 border-[#F97316]/30'
                      : 'bg-secondary border-border/50'
                  }`}
                  style={achievement.achieved ? {
                    boxShadow: '0 0 14px var(--energy-glow)'
                  } : {}}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        achievement.achieved 
                          ? 'bg-gradient-to-br from-[#F97316] to-[#FACC15]' 
                          : 'bg-muted border-2 border-border'
                      }`}
                    >
                      <Trophy 
                        className="w-5 h-5" 
                        style={{ color: achievement.achieved ? '#FFFFFF' : '#6B7280' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${
                        achievement.achieved ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{achievement.subtitle}</p>
                    </div>
                    {achievement.achieved && (
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #F97316, #FACC15)' }}
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}