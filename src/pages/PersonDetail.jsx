import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Cloud, Shirt, ScrollText, Sword, Music, Flame, Crown as LionCrown, Key, Book, ChevronLeft, Loader2, Crown, Wheat, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { getDateKey, addDaysKey } from '@/components/bible/utils/dateUtils';
import { CHARACTER_LIBRARY, flattenCharacterSections } from '@/components/bible/plans/characterLibrary';
import { generatePlanSchedule } from '@/components/bible/plans/planGenerator';

const ICON_MAP = {
  stars: Sparkles,
  storm: Cloud,
  coat: Shirt,
  tablets: ScrollText,
  sword: Sword,
  harp: Music,
  fire: Flame,
  lion: LionCrown,
  keys: Key,
  scroll: Book,
  crown: Crown,
  wheat: Wheat,
  heart: Heart,
  flame: Flame,
};

const COLOR_MAP = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
  slate: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/20' },
  red: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/20' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
};

export default function PersonDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const personId = searchParams.get('id');
  const queryClient = useQueryClient();
  const [isStarting, setIsStarting] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: existingPlan } = useQuery({
    queryKey: ['reading-plan', user?.id],
    queryFn: () => base44.entities.ReadingPlan.filter({ userId: user.id }),
    enabled: !!user?.id,
    select: (data) => data?.[0] || null,
  });

  const character = CHARACTER_LIBRARY[personId];

  if (!character) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Character not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(createPageUrl('PeopleLibrary'))}>
            Back to People
          </Button>
        </div>
      </div>
    );
  }

  const Icon = ICON_MAP[character.iconKey];
  const colors = COLOR_MAP[character.accentColorKey];
  
  const totalChapters = character.sections.reduce((sum, section) => sum + section.chapters.length, 0);
  const allChapters = flattenCharacterSections(personId);

  // Generate plan schedule
  const todayKey = getDateKey();
  const chaptersPerDay = 3; // Default for character plans
  const schedule = generatePlanSchedule({
    chapters: allChapters,
    startDate: todayKey,
    timeframe: { type: 'finish_in_days', days: Math.ceil(totalChapters / chaptersPerDay) },
    skipSundays: false,
    maxPerDay: null,
  });

  const durationDays = schedule.summary.totalDays;

  const handleStartPlan = async () => {
    if (!user?.id) {
      toast.error('Please log in to start a plan');
      return;
    }

    setIsStarting(true);

    try {
      // Create the plan
      const planData = {
        userId: user.id,
        scope: 'CUSTOM',
        startDate: todayKey,
        endDate: addDaysKey(todayKey, durationDays - 1),
        chaptersPerDay,
      };

      let planId;
      if (existingPlan) {
        await base44.entities.ReadingPlan.update(existingPlan.id, planData);
        planId = existingPlan.id;
      } else {
        const newPlan = await base44.entities.ReadingPlan.create(planData);
        planId = newPlan.id;
      }

      // Delete existing plan days for this plan
      const existingDays = await base44.entities.PlanDay.filter({ planId });
      for (const day of existingDays) {
        await base44.entities.PlanDay.delete(day.id);
      }

      // Create plan days
      const planDays = schedule.days.map((day, idx) => ({
        planId,
        userId: user.id,
        date: day.date,
        assignments: day.assignments,
      }));

      for (const dayData of planDays) {
        await base44.entities.PlanDay.create(dayData);
      }

      queryClient.invalidateQueries({ queryKey: ['reading-plan'] });
      queryClient.invalidateQueries({ queryKey: ['plan-days'] });
      toast.success('Plan started!');
      navigate(createPageUrl('Home'));
    } catch (error) {
      toast.error('Failed to start plan');
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(createPageUrl('PeopleLibrary'))}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground truncate">{personId}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center border ${colors.bg} ${colors.border}`}>
            <Icon className={`w-10 h-10 ${colors.text}`} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{personId}</h2>
            <p className="text-sm text-muted-foreground italic">{character.hook}</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-foreground leading-relaxed">{character.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{chaptersPerDay}</div>
            <div className="text-xs text-muted-foreground mt-1">Chapters / Day</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{durationDays}</div>
            <div className="text-xs text-muted-foreground mt-1">Days</div>
          </div>
        </div>

        {/* Sections */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="text-sm font-semibold text-foreground">Reading Journey</div>
          <div className="space-y-2">
            {character.sections.map((section, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{section.title}</div>
                  <div className="text-xs text-muted-foreground">{section.chapters.length} chapters</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            className="w-full h-12 text-base" 
            onClick={handleStartPlan}
            disabled={isStarting}
          >
            {isStarting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting Plan...
              </>
            ) : (
              'Start This Plan'
            )}
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              // TODO: Pre-select person in Custom Plan Builder
              navigate(createPageUrl('CustomPlanBuilder'));
            }}
          >
            Customize Plan
          </Button>
        </div>
      </div>
    </div>
  );
}