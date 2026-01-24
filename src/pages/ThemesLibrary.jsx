import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lamp, Leaf, Compass, Heart, Crown, Hourglass, Scroll, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { PLAN_PRESETS } from '@/components/bible/plans/planPresets';

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
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

const THEME_OPTIONS = [
  { 
    id: 'leadership_intensive', 
    preset: PLAN_PRESETS.find(p => p.id === 'leadership_intensive'),
    iconKey: 'Shield', 
    colorKey: 'blue',
  },
  { 
    id: 'wisdom_plunge', 
    preset: PLAN_PRESETS.find(p => p.id === 'wisdom_plunge'),
    iconKey: 'Lamp', 
    colorKey: 'purple',
  },
  { 
    id: 'intentional_motherhood', 
    preset: PLAN_PRESETS.find(p => p.id === 'intentional_motherhood'),
    iconKey: 'Leaf', 
    colorKey: 'pink',
  },
  { 
    id: 'godly_man', 
    preset: PLAN_PRESETS.find(p => p.id === 'godly_man'),
    iconKey: 'Shield', 
    colorKey: 'green',
  },
  { 
    id: 'live_with_purpose', 
    preset: PLAN_PRESETS.find(p => p.id === 'live_with_purpose'),
    iconKey: 'Compass', 
    colorKey: 'orange',
  },
  { 
    id: 'know_king_david', 
    preset: PLAN_PRESETS.find(p => p.id === 'know_king_david'),
    iconKey: 'Crown', 
    colorKey: 'cyan',
  },
  { 
    id: 'heart_of_god', 
    preset: PLAN_PRESETS.find(p => p.id === 'heart_of_god'),
    iconKey: 'Heart', 
    colorKey: 'rose',
  },
  { 
    id: 'chronological_bible', 
    preset: PLAN_PRESETS.find(p => p.id === 'chronological_bible'),
    iconKey: 'Hourglass', 
    colorKey: 'purple',
  },
  { 
    id: 'chronological_gospels', 
    preset: PLAN_PRESETS.find(p => p.id === 'chronological_gospels'),
    iconKey: 'Scroll', 
    colorKey: 'red',
  },
];

export default function ThemesLibrary() {
  const navigate = useNavigate();

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
            <h1 className="text-xl font-bold text-foreground">Themes</h1>
            <p className="text-xs text-muted-foreground">Choose a focused study</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {THEME_OPTIONS.map((theme) => {
          const Icon = ICON_MAP[theme.iconKey];
          const colorClass = COLOR_MAP[theme.colorKey];
          const preset = theme.preset;
          
          if (!preset) return null;

          return (
            <button
              key={theme.id}
              onClick={() => navigate(createPageUrl('ThemeDetail') + `?id=${theme.id}`)}
              className="w-full text-left bg-card border border-border rounded-2xl p-5 hover:bg-accent/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${colorClass}`}>
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-foreground mb-1">{preset.name}</div>
                  <div className="text-xs text-muted-foreground mb-2">{preset.shortHook}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="px-2 py-1 rounded-md bg-muted/50 text-[10px] font-medium text-muted-foreground">
                      {preset.chaptersPerDay} / day
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