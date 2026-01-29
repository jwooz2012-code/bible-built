import React from 'react';
import { Sparkles, Cloud, Shirt, Scroll as ScrollIcon, Sword, Music, Flame, Key, Ship, Check, Zap, Wheat, Heart, BookMarked } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  stars: Sparkles,
  storm: Cloud,
  coat: Shirt,
  tablets: ScrollIcon,
  sword: Sword,
  harp: Music,
  fire: Flame,
  lion: Sparkles,
  keys: Key,
  scroll: Ship,
  torch: Zap,
  wheat: Wheat,
  prayer: Heart,
  crown: Sparkles,
};

const COLOR_MAP = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  red: 'bg-red-500/10 text-red-600 dark:text-red-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
};

const ELITE_PLAN = {
  id: 'TWELVE_VOICES_ONE_HOLY_GOD',
  name: '12 Voices · 1 Holy God',
  description: 'Minor Prophets · Elite',
  isElite: true,
  chapters: 84,
  days: 21,
  pace: 4
};

const PEOPLE_OPTIONS = [
  { id: 'Abraham', name: 'Abraham', description: 'Father of faith', iconKey: 'stars', colorKey: 'blue' },
  { id: 'Job', name: 'Job', description: 'Patient in Suffering', iconKey: 'storm', colorKey: 'slate' },
  { id: 'Joseph', name: 'Joseph', description: 'From pit to palace', iconKey: 'coat', colorKey: 'emerald' },
  { id: 'Moses', name: 'Moses', description: 'Deliverer and lawgiver', iconKey: 'tablets', colorKey: 'purple' },
  { id: 'Joshua', name: 'Joshua', description: 'Conqueror and leader', iconKey: 'sword', colorKey: 'orange' },
  { id: 'David', name: 'David', description: 'Man after God\'s heart', iconKey: 'harp', colorKey: 'cyan' },
  { id: 'Elijah', name: 'Elijah', description: 'Prophet of fire', iconKey: 'fire', colorKey: 'red' },
  { id: 'Daniel', name: 'Daniel', description: 'Faithful in exile', iconKey: 'lion', colorKey: 'amber' },
  { id: 'Peter', name: 'Peter', description: 'Rock of the church', iconKey: 'keys', colorKey: 'indigo' },
  { id: 'Paul', name: 'Paul', description: 'Apostle to the Gentiles', iconKey: 'scroll', colorKey: 'rose' },
  { id: 'Deborah', name: 'Deborah', description: 'Judge in dark times', iconKey: 'torch', colorKey: 'indigo' },
  { id: 'Ruth', name: 'Ruth', description: 'Faithfulness in obscurity', iconKey: 'wheat', colorKey: 'amber' },
  { id: 'Hannah', name: 'Hannah', description: 'Prayer shapes destiny', iconKey: 'prayer', colorKey: 'cyan' },
  { id: 'Esther', name: 'Esther', description: 'Courage under pressure', iconKey: 'crown', colorKey: 'rose' },
];

export default function PeopleTab({ onPersonClick, selectedPerson, onElitePlanClick }) {
  return (
    <div className="space-y-3">
      {/* Elite Plan Card - Full Width */}
      <button
        onClick={() => onElitePlanClick(ELITE_PLAN.id)}
        className="w-full text-left bg-gradient-to-br from-amber-500/5 via-background to-background border-2 border-amber-500/20 rounded-2xl p-4 hover:border-amber-500/30 transition-all shadow-sm hover:shadow-md"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20">
            <BookMarked className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-foreground mb-0.5">{ELITE_PLAN.name}</div>
            <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mb-2">{ELITE_PLAN.description}</div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-2 py-0.5 rounded-md bg-amber-500/10 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                {ELITE_PLAN.days} days
              </div>
              <div className="px-2 py-0.5 rounded-md bg-amber-500/10 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                {ELITE_PLAN.pace} ch/day
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* Regular People Grid */}
      <div className="grid grid-cols-2 gap-3">
      {PEOPLE_OPTIONS.map((person) => {
        const Icon = ICON_MAP[person.iconKey] || Sparkles;
        const colorClass = COLOR_MAP[person.colorKey] || COLOR_MAP.blue;
        const isSelected = selectedPerson === person.id;
        
        return (
          <button
            key={person.id}
            onClick={() => onPersonClick(person.id)}
            className={cn(
              "text-left p-3 rounded-xl border-2 transition-all relative",
              isSelected 
                ? "border-primary bg-primary/5 shadow-md" 
                : "border-border bg-card hover:bg-accent/50"
            )}
          >
            <div className="flex items-start gap-2">
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                <Icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{person.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{person.description}</div>
              </div>
              
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                </div>
              )}
            </div>
          </button>
        );
      })}
      </div>
    </div>
  );
}