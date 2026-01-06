import React, { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, BookOpen } from 'lucide-react';
import { getDateKey, formatDateKey, addDaysKey, formatDateRange } from '@/components/bible/utils/dateUtils';
import { computeTodayAssignment, buildScopeChapters, getAssignmentForDate } from '@/components/bible/plans/planUtils';
import { PLAN_PRESETS } from '@/components/bible/plans/planPresets';
import { useUpsertReadingPlan } from '@/components/bible/hooks/useReadingPlan';

export default function PlanModal({ open, onClose, userId, existingPlan, logs }) {
  const todayKey = getDateKey();
  
  const [scope, setScope] = useState('BIBLE');
  const [startDate, setStartDate] = useState(todayKey);
  const [endDate, setEndDate] = useState(todayKey);

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
      scopeName: {
        BIBLE: 'Whole Bible',
        OT: 'Old Testament',
        NT: 'New Testament',
        PSALMS: 'Psalms',
        LEADERSHIP_INTENSIVE: 'Leadership Intensive',
        WISDOM_PLUNGE: 'Wisdom Plunge',
        INTENTIONAL_MOTHERHOOD: 'The Intentional Mom',
        GODLY_MAN: 'The Godly Man',
        LIVE_WITH_PURPOSE: 'Live With Purpose'
      }[existingPlan.scope] || existingPlan.scope
    };
  }, [existingPlan, logs, todayKey]);

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
            toast.error(error?.message || 'Failed to save plan');
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
          toast.error(error?.message || 'Failed to save plan');
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Set Reading Plan</SheetTitle>
          <SheetDescription>
            Choose a preset or customize your own reading plan
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Plan Details */}
          {planDetails && existingPlan && (
            <div className="bg-muted/50 rounded-lg p-4 border border-border space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Current Plan</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>{planDetails.scopeName}</div>
                  {!planDetails.isNoPlan && (
                    <>
                      <div>{formatDateRange(existingPlan.startDate, existingPlan.endDate)}</div>
                      <div>{planDetails.chaptersPerDay}/day • {planDetails.daysLeft} days left • {planDetails.remaining} remaining</div>
                    </>
                  )}
                  {planDetails.isNoPlan && (
                    <div>No plan selected</div>
                  )}
                </div>
              </div>

              {!planDetails.isNoPlan && (
                <div className="border-t border-border pt-3 space-y-3">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Today · {formatDateKey(todayKey)}
                    </div>
                    <div className="text-sm text-foreground">{planDetails.todaySummary}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {planDetails.doneToday}/{planDetails.totalToday} complete
                    </div>
                    <div className="text-xs text-muted-foreground/60 mt-0.5">
                      Read today: {planDetails.readTodayCount} chapter{planDetails.readTodayCount !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {planDetails.tomorrowSummary && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Next Up · {formatDateKey(planDetails.nextKey)}
                      </div>
                      <div className="text-sm text-foreground">{planDetails.tomorrowSummary}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {planDetails.doneTomorrow}/{planDetails.totalTomorrow} complete
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground/70 pt-2 border-t border-border">
                    Reading ahead counts toward future days.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Suggested Plans */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Suggested Plans</h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  setScope('NONE');
                  setStartDate(todayKey);
                  setEndDate(todayKey);
                }}
                className="text-left p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
              >
                <div className="font-medium text-sm text-foreground">No Plan (Manual Tracking)</div>
                <div className="text-xs text-muted-foreground mt-0.5">Track your reading without a plan</div>
              </button>
              {PLAN_PRESETS.map((preset) => {
                const isLeadership = preset.id === 'leadership_intensive';
                const isWisdom = preset.id === 'wisdom_plunge';
                const isMotherhood = preset.id === 'intentional_motherhood';
                const isGodlyMan = preset.id === 'godly_man';
                const isPurpose = preset.id === 'live_with_purpose';
                const isCustomPlan = isLeadership || isWisdom || isMotherhood || isGodlyMan || isPurpose;
                
                const Icon = isLeadership ? Shield : isWisdom ? BookOpen : isMotherhood ? BookOpen : isGodlyMan ? Shield : isPurpose ? BookOpen : null;
                const accentColor = isLeadership 
                  ? 'rgba(59, 130, 246, 0.1)' // blue tint for leadership
                  : isWisdom 
                  ? 'rgba(139, 92, 246, 0.08)' // purple tint for wisdom
                  : isMotherhood
                  ? 'rgba(236, 72, 153, 0.08)' // pink tint for motherhood
                  : isGodlyMan
                  ? 'rgba(34, 197, 94, 0.08)' // green tint for godly man
                  : isPurpose
                  ? 'rgba(249, 115, 22, 0.08)' // orange tint for purpose
                  : null;
                
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset)}
                    className="text-left p-3.5 rounded-lg border border-border bg-card hover:bg-accent transition-all group"
                    style={accentColor ? { backgroundColor: accentColor } : undefined}
                  >
                    {isCustomPlan ? (
                      <div className="flex gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                          isLeadership 
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                            : isWisdom
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : isMotherhood
                            ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
                            : isGodlyMan
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                        }`}>
                          <Icon className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-semibold text-sm text-foreground">{preset.name}</div>
                            <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              isLeadership
                                ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                                : isWisdom
                                ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
                                : isMotherhood
                                ? 'bg-pink-500/15 text-pink-700 dark:text-pink-300'
                                : isGodlyMan
                                ? 'bg-green-500/15 text-green-700 dark:text-green-300'
                                : 'bg-orange-500/15 text-orange-700 dark:text-orange-300'
                            }`}>
                              {preset.chaptersPerDay} ch/day
                            </div>
                          </div>
                          {preset.subtitle && (
                            <div className="text-xs text-muted-foreground mb-1.5 font-medium">
                              {preset.subtitle}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                            {preset.description}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="font-medium text-sm text-foreground">{preset.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{preset.description}</div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Plan */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Customize Plan</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="scope" className="text-xs">Scope</Label>
                <Select value={scope} onValueChange={setScope}>
                  <SelectTrigger id="scope" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BIBLE">Whole Bible</SelectItem>
                    <SelectItem value="OT">Old Testament</SelectItem>
                    <SelectItem value="NT">New Testament</SelectItem>
                    <SelectItem value="PSALMS">Psalms</SelectItem>
                    <SelectItem value="LEADERSHIP_INTENSIVE">Leadership Intensive</SelectItem>
                    <SelectItem value="WISDOM_PLUNGE">Wisdom Plunge</SelectItem>
                    <SelectItem value="INTENTIONAL_MOTHERHOOD">The Intentional Mom</SelectItem>
                    <SelectItem value="GODLY_MAN">The Godly Man</SelectItem>
                    <SelectItem value="LIVE_WITH_PURPOSE">Live With Purpose</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                />
              </div>

              <div>
                <Label htmlFor="endDate" className="text-xs">End Date</Label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                />
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">Preview</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">{preview.perDay}</div>
                <div className="text-xs text-muted-foreground">per day</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{preview.daysLeft}</div>
                <div className="text-xs text-muted-foreground">days left</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{preview.remaining}</div>
                <div className="text-xs text-muted-foreground">remaining</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Plan'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}