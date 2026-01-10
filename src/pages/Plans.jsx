import React from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Compass, Settings, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { getDateKey, formatDateKey } from '@/components/bible/utils/dateUtils';
import { getAssignmentForDate } from '@/components/bible/plans/planUtils';
import PageHeader from '@/components/shared/PageHeader';

export default function PlansPage() {
  const navigate = useNavigate();
  const todayKey = getDateKey();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: plan } = useQuery({
    queryKey: ['reading-plan', user?.id],
    queryFn: () => base44.entities.ReadingPlan.filter({ userId: user.id }),
    enabled: !!user?.id,
    select: (data) => data?.[0] || null,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['reading-logs', user?.id],
    queryFn: () => base44.entities.ReadingLog.filter({ userId: user.id }),
    enabled: !!user?.id,
  });

  const hasActivePlan = plan && plan.scope !== 'NONE';
  
  const todayAssignment = hasActivePlan 
    ? getAssignmentForDate({ plan, dateKey: todayKey })
    : [];

  const completedIds = new Set(logs.map(log => log.chapterId));
  const todayCompleted = todayAssignment.filter(ch => completedIds.has(ch.chapterId)).length;
  const todayTotal = todayAssignment.length;

  const todaySummary = todayAssignment.reduce((acc, ch) => {
    if (!acc[ch.book]) acc[ch.book] = [];
    acc[ch.book].push(ch.chapter);
    return acc;
  }, {});
  
  const todayParts = Object.entries(todaySummary).map(([book, chapters]) => {
    if (chapters.length === 1) return `${book} ${chapters[0]}`;
    const sorted = chapters.sort((a, b) => a - b);
    return `${book} ${sorted[0]}–${sorted[sorted.length - 1]}`;
  });

  const scopeName = {
    BIBLE: 'Whole Bible',
    OT: 'Old Testament',
    NT: 'New Testament',
    PSALMS: 'Psalms',
    LEADERSHIP_INTENSIVE: 'Leadership Intensive',
    WISDOM_PLUNGE: 'Wisdom Plunge',
    INTENTIONAL_MOTHERHOOD: 'The Intentional Mom',
    GODLY_MAN: 'The Godly Man',
    LIVE_WITH_PURPOSE: 'Live With Purpose',
    KNOW_KING_DAVID: 'Know King David',
    HEART_OF_GOD: 'Heart of God',
    CHRONOLOGICAL_BIBLE: 'Chronological Bible',
    CHRONOLOGICAL_GOSPELS: 'Chronological Gospels',
  }[plan?.scope] || 'Manual Tracking';

  const handleManualTracking = async () => {
    if (!user?.id) return;
    
    // Set plan scope to NONE for manual tracking
    if (plan?.id) {
      await base44.entities.ReadingPlan.update(plan.id, { scope: 'NONE' });
    } else {
      await base44.entities.ReadingPlan.create({ userId: user.id, scope: 'NONE' });
    }
    
    navigate(createPageUrl('Home'));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-1">Choose Your Reading Path</h1>
        <p className="text-sm text-muted-foreground">Pick the approach that fits this season.</p>
      </div>

      <div className="max-w-lg mx-auto px-6 space-y-8">
        {/* CURRENT PLAN (PRIMARY ANCHOR) */}
        <div className="bg-gradient-to-br from-card to-accent/5 border-2 border-border rounded-3xl p-6 shadow-sm">
          {hasActivePlan ? (
            <>
              <div className="text-2xl font-bold text-foreground mb-1">{scopeName}</div>
              {todayAssignment.length > 0 ? (
                <div className="text-sm text-muted-foreground mb-5">
                  Today: {todayParts.join(' • ')}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground mb-5">
                  No reading assigned for today
                </div>
              )}
              <Button 
                size="lg"
                className="w-full text-base h-12" 
                onClick={() => navigate(createPageUrl('Home'))}
              >
                Continue Today
              </Button>
            </>
          ) : (
            <>
              <div className="text-xl font-semibold text-muted-foreground mb-1">No Active Plan</div>
              <div className="text-sm text-muted-foreground/80 mb-5">
                Start a new plan to begin tracking your reading
              </div>
              <Button 
                size="lg"
                className="w-full text-base h-12" 
                onClick={() => navigate(createPageUrl('CustomPlanBuilder'))}
              >
                Choose a Plan
              </Button>
            </>
          )}
        </div>

        {/* CHOOSE A READING MODE */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
            Choose a Reading Mode
          </h2>
          
          <div className="space-y-3">
            {/* Custom Plan Builder */}
            <button
              onClick={() => navigate(createPageUrl('CustomPlanBuilder'))}
              className="w-full text-left bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                  <Compass className="w-7 h-7 text-orange-600 dark:text-orange-400" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-foreground mb-1">Custom Plan Builder</div>
                  <div className="text-xs text-muted-foreground">
                    Build a plan by books, people, or themes
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
              </div>
            </button>

            {/* Manual Tracking */}
            <button
              onClick={handleManualTracking}
              className="w-full text-left bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Settings className="w-7 h-7 text-muted-foreground" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-foreground mb-1">Manual Tracking</div>
                  <div className="text-xs text-muted-foreground">
                    Track chapters without a plan
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}