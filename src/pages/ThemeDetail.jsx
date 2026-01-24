import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Lamp, Leaf, Compass, Heart, Crown, Hourglass, Scroll, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { PLAN_PRESETS } from '@/components/bible/plans/planPresets';
import { CURATED_PLANS } from '@/components/bible/plans/curatedPlans';

const ICON_MAP = {
  Shield,
  Lamp,
  Leaf,
  Compass,
  Heart,
  Crown,
  Hourglass,
  Scroll,
};

const COLOR_MAP = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/20' },
  green: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/20' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/20' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
  red: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20' },
};

const THEME_META = {
  leadership_intensive: { iconKey: 'Shield', colorKey: 'blue' },
  wisdom_plunge: { iconKey: 'Lamp', colorKey: 'purple' },
  intentional_motherhood: { iconKey: 'Leaf', colorKey: 'pink' },
  godly_man: { iconKey: 'Shield', colorKey: 'green' },
  live_with_purpose: { iconKey: 'Compass', colorKey: 'orange' },
  know_king_david: { iconKey: 'Crown', colorKey: 'cyan' },
  heart_of_god: { iconKey: 'Heart', colorKey: 'rose' },
  chronological_bible: { iconKey: 'Hourglass', colorKey: 'purple' },
  chronological_gospels: { iconKey: 'Scroll', colorKey: 'red' },
};

export default function ThemeDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const themeId = searchParams.get('id');
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

  const preset = PLAN_PRESETS.find(p => p.id === themeId);
  const meta = THEME_META[themeId];

  if (!preset || !meta) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Theme not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(createPageUrl('ThemesLibrary'))}>
            Back to Themes
          </Button>
        </div>
      </div>
    );
  }

  const Icon = ICON_MAP[meta.iconKey];
  const colors = COLOR_MAP[meta.colorKey];
  
  const todayKey = getDateKey();
  const dates = preset.getDates(todayKey);
  const durationDays = Math.ceil((new Date(dates.endDate) - new Date(dates.startDate)) / (1000 * 60 * 60 * 24)) + 1;

  // Get first few chapters as preview
  const scopeKey = preset.scope.toUpperCase();
  const planChapters = CURATED_PLANS[scopeKey] || [];
  const previewChapters = planChapters.slice(0, 6);

  const handleStartPlan = async () => {
    if (!user?.id) {
      toast.error('Please log in to start a plan');
      return;
    }

    setIsStarting(true);

    try {
      const planData = {
        userId: user.id,
        scope: preset.scope,
        startDate: dates.startDate,
        endDate: dates.endDate,
        chaptersPerDay: preset.chaptersPerDay,
      };

      if (existingPlan) {
        await base44.entities.ReadingPlan.update(existingPlan.id, planData);
      } else {
        await base44.entities.ReadingPlan.create(planData);
      }

      queryClient.invalidateQueries({ queryKey: ['reading-plan'] });
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
            onClick={() => navigate(createPageUrl('ThemesLibrary'))}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground truncate">{preset.name}</h1>
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
            <h2 className="text-2xl font-bold text-foreground mb-2">{preset.name}</h2>
            <p className="text-sm text-muted-foreground italic">{preset.shortHook}</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-foreground leading-relaxed">{preset.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{preset.chaptersPerDay}</div>
            <div className="text-xs text-muted-foreground mt-1">Chapters / Day</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{durationDays}</div>
            <div className="text-xs text-muted-foreground mt-1">Days</div>
          </div>
        </div>

        {/* Preview */}
        {previewChapters.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="text-sm font-semibold text-foreground">Reading Preview</div>
            <div className="flex flex-wrap gap-2">
              {previewChapters.map((ch, idx) => (
                <div key={idx} className="px-2.5 py-1.5 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                  {ch.bookName} {ch.chapter}
                </div>
              ))}
              {planChapters.length > 6 && (
                <div className="px-2.5 py-1.5 text-xs text-muted-foreground">
                  +{planChapters.length - 6} more
                </div>
              )}
            </div>
          </div>
        )}

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
              // TODO: Pre-select theme in Custom Plan Builder
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