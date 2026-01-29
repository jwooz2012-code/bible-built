import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Cloud, Shirt, ScrollText, Sword, Music, Flame, Crown as LionCrown, Key, Book, ChevronLeft, Crown, Wheat, Heart, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { CHARACTER_LIBRARY } from '@/components/bible/plans/characterLibrary';
import { PLAN_PRESETS } from '@/components/bible/plans/planPresets';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getDateKey } from '@/components/bible/utils/dateUtils';

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
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

export default function PeopleLibrary() {
  const navigate = useNavigate();
  const characterKeys = Object.keys(CHARACTER_LIBRARY);
  const todayKey = getDateKey();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: existingPlan } = useQuery({
    queryKey: ['readingPlan', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const plans = await base44.entities.ReadingPlan.filter({ userId: user.id });
      return plans.length > 0 ? plans[0] : null;
    },
    enabled: !!user?.id,
  });

  const twelvVoicesPlan = PLAN_PRESETS.find(p => p.id === 'twelve_voices_one_holy_god');

  const handleStartTwelveVoicesPlan = async () => {
    if (!user?.id) {
      toast.error('Please log in to start a plan');
      return;
    }

    const dates = twelvVoicesPlan.getDates(todayKey);
    
    try {
      if (existingPlan) {
        await base44.entities.ReadingPlan.update(existingPlan.id, {
          scope: twelvVoicesPlan.scope,
          startDate: dates.startDate,
          endDate: dates.endDate,
          chaptersPerDay: twelvVoicesPlan.chaptersPerDay,
          name: twelvVoicesPlan.name,
        });
      } else {
        await base44.entities.ReadingPlan.create({
          userId: user.id,
          scope: twelvVoicesPlan.scope,
          startDate: dates.startDate,
          endDate: dates.endDate,
          chaptersPerDay: twelvVoicesPlan.chaptersPerDay,
          name: twelvVoicesPlan.name,
        });
      }
      toast.success('Plan started successfully');
      navigate(createPageUrl('home'));
    } catch (error) {
      toast.error('Failed to start plan');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(createPageUrl('Plans'))}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">People of the Bible</h1>
            <p className="text-xs text-muted-foreground">Walk with biblical characters</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {/* Elite Plan Card */}
        <button
          onClick={handleStartTwelveVoicesPlan}
          className="w-full text-left bg-gradient-to-br from-amber-500/5 via-background to-background border-2 border-amber-500/20 rounded-2xl p-6 hover:border-amber-500/30 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20">
              <BookMarked className="w-7 h-7 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-foreground mb-1">12 Voices · 1 Holy God</div>
              <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2">Minor Prophets · Elite Plan</div>
              <div className="text-xs text-muted-foreground mb-3 line-clamp-2">
                An elite run through the Minor Prophets—with Scripture's own NT anchors. Hear the prophets. See the Holy God.
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <div className="px-2.5 py-1 rounded-md bg-amber-500/10 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  21 days
                </div>
                <div className="px-2.5 py-1 rounded-md bg-amber-500/10 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  4 ch/day
                </div>
              </div>
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-semibold">
                <span>Start Plan</span>
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </div>
            </div>
          </div>
        </button>
        {characterKeys.map((characterKey) => {
          const character = CHARACTER_LIBRARY[characterKey];
          const Icon = ICON_MAP[character.iconKey];
          const colorClass = COLOR_MAP[character.accentColorKey];
          
          const totalChapters = character.sections.reduce((sum, section) => sum + section.chapters.length, 0);

          return (
            <button
              key={characterKey}
              onClick={() => navigate(createPageUrl('PersonDetail') + `?id=${characterKey}`)}
              className="w-full text-left bg-card border border-border rounded-2xl p-5 hover:bg-accent/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${colorClass}`}>
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-foreground mb-1">{characterKey}</div>
                  <div className="text-xs text-muted-foreground mb-2">{character.hook}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="px-2 py-1 rounded-md bg-muted/50 text-[10px] font-medium text-muted-foreground">
                      {totalChapters} chapters
                    </div>
                    <div className="px-2 py-1 rounded-md bg-muted/50 text-[10px] font-medium text-muted-foreground">
                      {character.sections.length} sections
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}