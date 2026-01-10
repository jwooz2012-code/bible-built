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
      <PageHeader 
        title="Set Reading" 
        subtitle="Choose your reading path"
      />

      <div className="max-w-lg mx-auto px-4 space-y-4">
        {/* 1) CURRENT PLAN */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Current Plan</div>
          
          {hasActivePlan ? (
            <>
              <div className="text-lg font-bold text-foreground mb-2">{scopeName}</div>
              {todayAssignment.length > 0 && (
                <div className="text-xs text-muted-foreground mb-3">
                  Today: {todayParts.join(' • ')}
                </div>
              )}
              <Button 
                className="w-full" 
                onClick={() => navigate(createPageUrl('Home'))}
              >
                Continue Current Plan
              </Button>
            </>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-3">No plan selected</div>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate(createPageUrl('CustomPlanBuilder'))}
              >
                Choose a Plan
              </Button>
            </>
          )}
        </div>

        {/* 2) CUSTOM PLAN BUILDER */}
        <button
          onClick={() => navigate(createPageUrl('CustomPlanBuilder'))}
          className="w-full text-left bg-card border border-border rounded-2xl p-5 hover:bg-accent/50 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Compass className="w-6 h-6 text-orange-600 dark:text-orange-400" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-foreground mb-0.5">Custom Plan Builder</div>
              <div className="text-xs text-muted-foreground">
                Build your own plan by books, people, or themes
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
          </div>
        </button>

        {/* 3) MANUAL TRACKING */}
        <button
          onClick={handleManualTracking}
          className="w-full text-left bg-card border border-border rounded-2xl p-5 hover:bg-accent/50 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
              <Settings className="w-6 h-6 text-muted-foreground" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-foreground mb-0.5">Manual Tracking</div>
              <div className="text-xs text-muted-foreground">
                Track chapters without a reading plan
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
          </div>
        </button>
      </div>
    </div>
  );
}