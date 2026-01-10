import React from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Shield, Lamp, Leaf, Compass, Heart, Crown, Hourglass, Scroll, Users, Sparkles, Settings, ChevronRight } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader 
        title="Set Reading" 
        subtitle="Choose your reading path"
      />

      <div className="max-w-2xl mx-auto px-4 space-y-8">
        {/* A) CURRENT PLAN (only if active) */}
        {hasActivePlan && (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Plan</div>
            <div className="text-lg font-bold text-foreground">{scopeName}</div>

            {todayAssignment.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  Today · {formatDateKey(todayKey)}
                </div>
                <div className="text-sm text-foreground font-medium">{todayParts.join(' • ')}</div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-foreground transition-all" 
                    style={{ width: `${(todayCompleted / todayTotal) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {todayCompleted} of {todayTotal} complete
                </div>
              </div>
            )}

            <Button 
              className="w-full mt-2" 
              onClick={() => navigate(createPageUrl('Home'))}
            >
              Continue Today
            </Button>
          </div>
        )}

        {/* B) START A NEW PLAN */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {hasActivePlan ? 'Start a New Plan' : 'Start a Plan'}
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate(createPageUrl('ThemesLibrary'))}
              className="w-full text-left bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-border rounded-2xl p-5 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-foreground mb-0.5">Themes</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    Guided studies focused on wisdom, faith, leadership, and life.
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
              </div>
            </button>

            <button
              onClick={() => navigate(createPageUrl('PeopleLibrary'))}
              className="w-full text-left bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-border rounded-2xl p-5 hover:from-cyan-500/20 hover:to-blue-500/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-400" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-foreground mb-0.5">People of the Bible</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    Deep dives into the lives of biblical men and women.
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
              </div>
            </button>

            <button
              onClick={() => navigate(createPageUrl('CustomPlanBuilder'))}
              className="w-full text-left bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-border rounded-2xl p-5 hover:from-orange-500/20 hover:to-red-500/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Compass className="w-6 h-6 text-orange-600 dark:text-orange-400" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-foreground mb-0.5">Custom Plan Builder</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    Build your own plan by books, topics, or timeline.
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
              </div>
            </button>
          </div>
        </div>

        {/* C) SECONDARY / ADVANCED (LOW VISUAL PRIORITY) */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60 pt-4">
          <button
            onClick={() => navigate(createPageUrl('Settings'))}
            className="hover:text-muted-foreground transition-colors"
          >
            Manual Tracking
          </button>
          <span>·</span>
          <button
            onClick={() => navigate(createPageUrl('Settings'))}
            className="hover:text-muted-foreground transition-colors"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}