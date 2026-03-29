import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

import { toast } from 'sonner';
import { Check, BookOpen, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { buildScopeChapters } from '@/components/bible/plans/planUtils';
import { PLAN_PRESETS } from '@/components/bible/plans/planPresets';
import { useUpsertReadingPlan } from '@/components/bible/hooks/useReadingPlan';
import { createPageUrl } from '@/utils';

export default function PlanModal({ open, onClose, userId, existingPlan, logs }) {
  const navigate = useNavigate();
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

  const [selectedMode, setSelectedMode] = useState(existingPlan?.scope || null);

  useEffect(() => {
    if (existingPlan?.scope) {
      setSelectedMode(existingPlan.scope);
    }
  }, [existingPlan]);

  const handleSelectMode = (mode) => {
    setSelectedMode(mode);
    // Haptic feedback
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}>
        <div className="flex flex-col items-center justify-center pt-12 pb-6">
          <h1 className="text-2xl font-bold text-foreground text-center">
            How do you want to read?
          </h1>
        </div>

        <div className="mt-10 space-y-4 pb-32 px-1">
          {/* Options */}
          <div className="grid grid-cols-1 gap-4">
            {/* Manual Reading */}
            <button
              onClick={() => {
                setScope('NONE');
                setStartDate(todayKey);
                setEndDate(todayKey);
                handleSelectMode('NONE');
              }}
              className={cn(
                "text-left p-4 rounded-2xl border-2 transition-all relative group active:scale-[0.98]",
                selectedMode === 'NONE'
                  ? "border-primary bg-primary/5 shadow-lg scale-[1.01]"
                  : "border-border bg-card hover:bg-accent hover:border-muted-foreground/30"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base text-foreground mb-1">
                    Read Freely
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Track chapters as you go.
                  </div>
                </div>
                {selectedMode === 'NONE' && (
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
                  </div>
                )}
              </div>
            </button>

            {/* Build a Reading Plan */}
            <button
              onClick={() => {
                handleSelectMode('PLAN');
                setTimeout(() => {
                  onClose();
                  navigate(createPageUrl('CustomPlanBuilder'));
                }, 150);
              }}
              className={cn(
                "text-left p-4 rounded-2xl border-2 transition-all relative group active:scale-[0.98]",
                selectedMode === 'PLAN'
                  ? "border-primary bg-primary/5 shadow-lg scale-[1.01]"
                  : "border-border bg-card hover:bg-accent hover:border-muted-foreground/30"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Zap className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base text-foreground mb-1">
                    Reading Plans
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Read with intention.
                  </div>
                </div>
                {selectedMode === 'PLAN' && (
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-3 pt-6">
            {selectedMode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full"
              >
                <Button 
                  onClick={handleSave} 
                  className="w-full max-w-md h-12 text-base font-semibold rounded-xl mx-auto block" 
                  disabled={isPending || !selectedMode}
                >
                  {isPending ? 'Setting up...' : 'Continue →'}
                </Button>
              </motion.div>
            )}
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors font-medium"
            >
              Not now
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}