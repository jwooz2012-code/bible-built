import React from 'react';
import { Sparkles, Cloud, Shirt, Scroll as ScrollIcon, Sword, Music, Flame, Key, Ship } from 'lucide-react';

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
];

export default function PeopleTab({ onPersonClick }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PEOPLE_OPTIONS.map((person) => {
        const Icon = ICON_MAP[person.iconKey] || Sparkles;
        const colorClass = COLOR_MAP[person.colorKey] || COLOR_MAP.blue;
        
        return (
          <button
            key={person.id}
            onClick={() => onPersonClick(person.id)}
            className="text-left p-3 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all"
          >
            <div className="flex items-start gap-2">
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                <Icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{person.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{person.description}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}