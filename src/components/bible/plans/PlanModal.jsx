import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, Compass, Crown, Heart, Lamp, Leaf, Hourglass, Scroll, ChevronRight, Check, Loader2, BookOpen, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDateKey, formatDateKey, addDaysKey, formatDateRange } from '@/components/bible/utils/dateUtils';
import { computeTodayAssignment, buildScopeChapters, getAssignmentForDate } from '@/components/bible/plans/planUtils';
import { PLAN_PRESETS } from '@/components/bible/plans/planPresets';
import { useUpsertReadingPlan } from '@/components/bible/hooks/useReadingPlan';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';

export default function PlanModal({ open, onClose, userId, existingPlan, logs }) {
  const navigate = useNavigate();
  const todayKey = getDateKey();
  
  const [scope, setScope] = useState('BIBLE');
  const [startDate, setStartDate] = useState(todayKey);
  const [endDate, setEndDate] = useState(todayKey);
  const [showUpcoming, setShowUpcoming] = useState(false);

  const { mutate: upsertPlan, isPending } = useUpsertReadingPlan();

  useEffect(() => {
    if (existingPlan) {
      setScope(existingPlan.scope);
      setStartDate(existingPlan.startDate);
      setEndDate(existingPlan.endDate);
    }
  }, [existingPlan]);

  const draftPlan = useMemo(() => ({
    scope,
    startDate,
    endDate,
  }), [scope, startDate, endDate]);

  const preview = useMemo(() => {
    try {
      return computeTodayAssignment({ plan: draftPlan, logs, todayKey });
    } catch (error) {
      return { perDay: 0, daysLeft: 0, remaining: 0, today: [] };
    }
  }, [draftPlan, logs, todayKey]);

  const planDetails = useMemo(() => {
    if (!existingPlan) return null;
    if (existingPlan.scope === 'NONE') {
      return {
        isNoPlan: true,
        scopeName: 'Manual Tracking'
      };
    }
    if (!existingPlan.startDate || !existingPlan.endDate) return null;

    // Today's assignment
    const assignedToday = getAssignmentForDate({ plan: existingPlan, dateKey: todayKey });
    const completedIds = new Set(logs.map(log => log.chapterId));
    const doneToday = assignedToday.filter(ch => completedIds.has(ch.chapterId)).length;
    const readTodayCount = logs.filter(log => log.dateKey === todayKey).length;

    const todaySummary = assignedToday.reduce((acc, ch) => {
      if (!acc[ch.book]) acc[ch.book] = [];
      acc[ch.book].push(ch.chapter);
      return acc;
    }, {});
    const todayParts = Object.entries(todaySummary).map(([book, chapters]) => {
      if (chapters.length === 1) return `${book} ${chapters[0]}`;
      const sorted = chapters.sort((a, b) => a - b);
      return `${book} ${sorted[0]}–${sorted[sorted.length - 1]}`;
    });

    // Tomorrow's assignment
    const nextKey = addDaysKey(todayKey, 1);
    const assignedTomorrow = getAssignmentForDate({ plan: existingPlan, dateKey: nextKey });
    const doneTomorrow = assignedTomorrow.filter(ch => completedIds.has(ch.chapterId)).length;

    const tomorrowSummary = assignedTomorrow.reduce((acc, ch) => {
      if (!acc[ch.book]) acc[ch.book] = [];
      acc[ch.book].push(ch.chapter);
      return acc;
    }, {});
    const tomorrowParts = Object.entries(tomorrowSummary).map(([book, chapters]) => {
      if (chapters.length === 1) return `${book} ${chapters[0]}`;
      const sorted = chapters.sort((a, b) => a - b);
      return `${book} ${sorted[0]}–${sorted[sorted.length - 1]}`;
    });

    // Plan stats
    const scopeChapters = buildScopeChapters(existingPlan.scope);
    const totalChapters = scopeChapters.length;
    const readChapterIds = new Set(logs.filter(log => 
      scopeChapters.some(ch => ch.chapterId === log.chapterId)
    ).map(log => log.chapterId));
    const remaining = totalChapters - readChapterIds.size;

    const today = new Date(todayKey);
    const endDate = new Date(existingPlan.endDate);
    const daysLeft = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

    return {
      todaySummary: todayParts.join(' • '),
      doneToday,
      totalToday: assignedToday.length,
      readTodayCount,
      tomorrowSummary: tomorrowParts.join(' • '),
      doneTomorrow,
      totalTomorrow: assignedTomorrow.length,
      nextKey,
      chaptersPerDay: existingPlan.chaptersPerDay || 0,
      daysLeft,
      remaining,
      scopeName: existingPlan.scope === 'CUSTOM' 
        ? (existingPlan.name || 'My Reading Plan')
        : ({
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
            WHO_IS_JESUS: 'Who Is Jesus',
            TWELVE_VOICES_ONE_HOLY_GOD: '12 Voices · 1 Holy God'
          }[existingPlan.scope] || 'My Reading Plan')
    };
  }, [existingPlan, logs, todayKey]);

  const endOfWeek = addDaysKey(todayKey, 6);
  const { data: planDays = [], isLoading: isLoadingPlanDays } = useQuery({
    queryKey: ['planDays', userId, existingPlan?.id, todayKey, endOfWeek],
    queryFn: async () => {
      if (!existingPlan?.id) return [];
      const days = await base44.entities.PlanDay.filter({
        planId: existingPlan.id,
        userId,
      });
      return days.filter(d => d.date >= todayKey && d.date <= endOfWeek).sort((a, b) => a.date.localeCompare(b.date));
    },
    enabled: !!existingPlan?.id && !!userId,
  });

  const upcomingReadings = useMemo(() => {
    if (!planDays.length) return [];

    const completedIds = new Set(logs.map(log => log.chapterId));

    return planDays.map(day => {
      const assigned = day.assignments || [];
      const completed = assigned.filter(ch => completedIds.has(generateChapterId(
        BIBLE_BOOKS.find(b => b.name === ch.bookName)?.index || 0,
        ch.chapter
      ))).length;

      const summary = assigned.reduce((acc, ch) => {
        if (!acc[ch.bookName]) acc[ch.bookName] = [];
        acc[ch.bookName].push(ch.chapter);
        return acc;
      }, {});

      const parts = Object.entries(summary).map(([book, chapters]) => {
        if (chapters.length === 1) return `${book} ${chapters[0]}`;
        const sorted = chapters.sort((a, b) => a - b);
        return `${book} ${sorted[0]}–${sorted[sorted.length - 1]}`;
      });

      return {
        dateKey: day.date,
        isToday: day.date === todayKey,
        summary: parts.join(' • '),
        completed,
        total: assigned.length
      };
    });
  }, [planDays, logs, todayKey]);

  const handlePresetClick = (preset) => {
    const dates = preset.getDates(todayKey);
    setScope(preset.scope);
    setStartDate(dates.startDate);
    setEndDate(dates.endDate);
  };

  const handleSave = () => {
    if (!userId) {
      toast.error('User not found');
      return;
    }

    // Handle "No Plan" mode
    if (scope === 'NONE') {
      upsertPlan(
        {
          existingPlan,
          planData: {
            userId,
            scope: 'NONE',
            startDate: null,
            endDate: null,
            chaptersPerDay: null,
          },
        },
        {
          onSuccess: () => {
            localStorage.setItem('bb_plan_prompt_seen', 'true');
            toast.success('Manual tracking mode enabled');
            onClose();
          },
          onError: (error) => {
            const msg = error?.message || error?.response?.data?.message || error?.data?.message || (typeof error === 'string' ? error : 'Failed to save plan');
            toast.error(msg);
          },
        }
      );
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    // Use preset chaptersPerDay if available, otherwise calculate
    const matchingPreset = PLAN_PRESETS.find(p => p.scope === scope);
    let chaptersPerDay;
    
    if (matchingPreset && matchingPreset.chaptersPerDay) {
      chaptersPerDay = matchingPreset.chaptersPerDay;
    } else {
      const scopeChapters = buildScopeChapters(scope);
      const totalChaptersInScope = scopeChapters.length;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDaysInPlan = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      chaptersPerDay = Math.ceil(totalChaptersInScope / totalDaysInPlan);
    }

    upsertPlan(
      {
        existingPlan,
        planData: {
          userId,
          scope,
          startDate,
          endDate,
          chaptersPerDay,
        },
      },
      {
        onSuccess: () => {
          localStorage.setItem('bb_plan_prompt_seen', 'true');
          toast.success('Reading plan saved');
          onClose();
        },
        onError: (error) => {
          const msg = error?.message || error?.response?.data?.message || error?.data?.message || (typeof error === 'string' ? error : 'Failed to save plan');
          toast.error(msg);
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center justify-center pt-8 pb-4">
          <h1 className="text-2xl font-bold text-foreground text-center">
            Let's Build Your Bible Rhythm
          </h1>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Track what matters—one day at a time.
          </p>
        </div>

        <div className="mt-8 space-y-4 pb-32 px-1">
          {/* Options */}
          <div className="grid grid-cols-1 gap-4">
            {/* Manual Reading (Secondary) */}
            <button
              onClick={() => {
                setScope('NONE');
                setStartDate(todayKey);
                setEndDate(todayKey);
              }}
              className={cn(
                "text-left p-5 rounded-2xl border-2 transition-all relative group",
                scope === 'NONE'
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border bg-card hover:bg-accent hover:border-muted-foreground/30"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base text-foreground mb-1">
                    Manual Reading
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    Read freely and track chapters as you go.
                  </div>
                </div>
                {scope === 'NONE' && (
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
                  </div>
                )}
              </div>
            </button>

            {/* Build a Reading Plan (Primary) */}
            <button
              onClick={() => {
                onClose();
                navigate(createPageUrl('CustomPlanBuilder'));
              }}
              className={cn(
                "text-left p-6 rounded-2xl border-2 transition-all relative group",
                "border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 shadow-lg"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-semibold text-base text-foreground">
                      Build a Reading Plan
                    </div>
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15">
                      Most popular
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    Choose books, pace, and finish strong.
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-3 pt-6">
            <Button 
              onClick={handleSave} 
              className="w-full max-w-md h-12 text-base font-semibold rounded-xl" 
              disabled={isPending}
            >
              {isPending ? 'Setting up...' : 'Continue →'}
            </Button>
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Not now
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}