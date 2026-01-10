import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Cloud, Shirt, ScrollText, Sword, Music, Flame, Crown as LionCrown, Key, Book, ChevronLeft, Crown, Wheat, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { CHARACTER_LIBRARY } from '@/components/bible/plans/characterLibrary';

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