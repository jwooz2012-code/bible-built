import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, Compass, Crown, Heart, Lamp, Leaf, Hourglass, Scroll, ChevronRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDateKey, formatDateKey, addDaysKey, formatDateRange } from '@/components/bible/utils/dateUtils';
import { computeTodayAssignment, buildScopeChapters, getAssignmentForDate } from '@/components/bible/plans/planUtils';
import { PLAN_PRESETS } from '@/components/bible/plans/planPresets';
import { useUpsertReadingPlan } from '@/components/bible/hooks/useReadingPlan';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';

export default function PlanModal({ open, onClose, userId, existingPlan, logs, editMode = false }) {
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
        <SheetHeader>
          <SheetTitle>{editMode ? 'Edit Reading Plan' : 'Set Reading Plan'}</SheetTitle>
          <SheetDescription>
            {editMode ? 'Adjust your plan schedule while preserving progress' : 'Choose a preset or customize your own reading plan'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 pb-28">
          {/* Edit Mode: Show Current Plan Details */}
          {editMode && existingPlan && planDetails && !planDetails.isNoPlan && (
            <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-5 mb-4">
              <div className="text-sm font-semibold text-muted-foreground mb-1">Current Plan</div>
              <div className="text-xl font-bold text-foreground mb-2">{planDetails.scopeName}</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Chapters/Day</div>
                  <div className="font-semibold text-foreground">{planDetails.chaptersPerDay}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Days Left</div>
                  <div className="font-semibold text-foreground">{planDetails.daysLeft}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Remaining</div>
                  <div className="font-semibold text-foreground">{planDetails.remaining} chapters</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Progress</div>
                  <div className="font-semibold text-foreground">
                    {Math.round(((1 - planDetails.remaining / (planDetails.remaining + logs.filter(l => 
                      buildScopeChapters(existingPlan.scope).some(ch => ch.chapterId === l.chapterId)
                    ).length)) * 100))}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Mode: Quick Date Adjustments */}
          {editMode && existingPlan && !planDetails?.isNoPlan && (
            <div className="space-y-3 mb-4">
              <div className="text-sm font-semibold text-foreground">Adjust Schedule</div>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">End Date</Label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
                  />
                </div>
                {preview.perDay > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <div className="text-muted-foreground mb-1">Updated Pace</div>
                    <div className="text-lg font-bold text-foreground">{preview.perDay} chapters/day</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {preview.remaining} chapters in {preview.daysLeft} days
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Readings Modal */}
          {showUpcoming && (
            <Sheet open={showUpcoming} onOpenChange={setShowUpcoming}>
              <SheetContent side="bottom" className="h-[70vh]">
                <SheetHeader>
                  <SheetTitle>Upcoming Readings</SheetTitle>
                  <SheetDescription>
                    Next 7 days in your current plan
                  </SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-3 pb-8 overflow-y-auto max-h-[calc(70vh-120px)]">
                  {isLoadingPlanDays ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-sm">Loading upcoming readings…</span>
                    </div>
                  ) : upcomingReadings.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No upcoming readings found for this plan.
                    </div>
                  ) : (
                    upcomingReadings.map((day, idx) => (
                      <div 
                        key={day.dateKey}
                        className={cn(
                          "p-4 rounded-lg border",
                          day.isToday 
                            ? "border-primary bg-primary/5" 
                            : "border-border bg-card"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold text-foreground">
                            {day.isToday ? 'Today' : formatDateKey(day.dateKey)}
                          </div>
                          {day.completed === day.total && day.total > 0 && (
                            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <Check className="w-3 h-3" />
                              <span>Done</span>
                            </div>
                          )}
                        </div>
                        <div className="text-base text-foreground mb-1">
                          {day.summary}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {day.completed}/{day.total} chapters read
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUpcoming(false)}
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* Options - Hide in Edit Mode */}
          {!editMode && (
          <div>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  setScope('NONE');
                  setStartDate(todayKey);
                  setEndDate(todayKey);
                }}
                className={cn(
                  "text-left p-3 rounded-lg border-2 transition-all relative",
                  scope === 'NONE'
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:bg-accent"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">No Plan (Manual Tracking)</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Track your reading without a plan</div>
                  </div>
                  {scope === 'NONE' && (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate(createPageUrl('CustomPlanBuilder'));
                }}
                className="text-left p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
              >
                <div className="font-medium text-sm text-foreground">Custom Plan Builder</div>
                <div className="text-xs text-muted-foreground mt-0.5">Choose themes, books, or people to build your plan.</div>
              </button>
            </div>
          </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={isPending}>
              {isPending ? 'Saving...' : (editMode ? 'Save Changes' : 'Save Plan')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}