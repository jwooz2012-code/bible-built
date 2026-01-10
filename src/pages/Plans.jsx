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
        title="Choose Your Path" 
        subtitle="Start a new reading plan"
      />

      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Active Plan */}
        {hasActivePlan && (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Active Plan</div>
                <div className="text-lg font-semibold text-foreground">{scopeName}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(createPageUrl('Settings'))}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            {todayAssignment.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Today · {formatDateKey(todayKey)}
                </div>
                <div className="text-sm text-foreground">{todayParts.join(' • ')}</div>
                <div className="text-xs text-muted-foreground">
                  {todayCompleted}/{todayTotal} complete
                </div>
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={() => navigate(createPageUrl('Home'))}
            >
              Go to Today
            </Button>
          </div>
        )}

        {/* Main Entry Cards */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(createPageUrl('ThemesLibrary'))}
            className="w-full text-left bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-border rounded-2xl p-6 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-foreground">Themes</div>
                <div className="text-sm text-muted-foreground">Focused topical studies</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>

          <button
            onClick={() => navigate(createPageUrl('PeopleLibrary'))}
            className="w-full text-left bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-border rounded-2xl p-6 hover:from-cyan-500/20 hover:to-blue-500/20 transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-400" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-foreground">People of the Bible</div>
                <div className="text-sm text-muted-foreground">Walk with biblical characters</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>

          <button
            onClick={() => navigate(createPageUrl('CustomPlanBuilder'))}
            className="w-full text-left bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-border rounded-2xl p-6 hover:from-orange-500/20 hover:to-red-500/20 transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Compass className="w-6 h-6 text-orange-600 dark:text-orange-400" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-foreground">Custom Plan Builder</div>
                <div className="text-sm text-muted-foreground">Create your own plan</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>
        </div>

        {/* Secondary Options */}
        <div className="pt-2 space-y-2">
          <button
            onClick={() => navigate(createPageUrl('Settings'))}
            className="w-full text-left px-4 py-3 rounded-xl bg-card border border-border hover:bg-accent transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-foreground">Manual Tracking</div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Track reading without a plan</div>
          </button>
        </div>
      </div>
    </div>
  );
}