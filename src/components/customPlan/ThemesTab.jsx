import React from 'react';
import { Shield, Lamp, Leaf, Compass, Crown, Heart } from 'lucide-react';

const ICON_MAP = {
  shield: Shield,
  lamp: Lamp,
  leaf: Leaf,
  compass: Compass,
  crown: Crown,
  heart: Heart,
};

const COLOR_MAP = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  green: 'bg-green-500/10 text-green-600 dark:text-green-400',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

const THEME_OPTIONS = [
  {
    id: 'LEADERSHIP_INTENSIVE',
    name: 'Leadership Intensive',
    iconKey: 'shield',
    colorKey: 'blue',
    description: 'Biblical leadership principles'
  },
  {
    id: 'WISDOM_PLUNGE',
    name: 'Wisdom Plunge',
    iconKey: 'lamp',
    colorKey: 'purple',
    description: 'Dive deep into wisdom literature'
  },
  {
    id: 'INTENTIONAL_MOTHERHOOD',
    name: 'The Intentional Mom',
    iconKey: 'leaf',
    colorKey: 'pink',
    description: 'Biblical motherhood and family'
  },
  {
    id: 'GODLY_MAN',
    name: 'The Godly Man',
    iconKey: 'shield',
    colorKey: 'green',
    description: 'Biblical masculinity and character'
  },
  {
    id: 'LIVE_WITH_PURPOSE',
    name: 'Live With Purpose',
    iconKey: 'compass',
    colorKey: 'orange',
    description: 'Discover God\'s purpose for your life'
  },
  {
    id: 'KNOW_KING_DAVID',
    name: 'Know King David',
    iconKey: 'crown',
    colorKey: 'cyan',
    description: 'Journey through David\'s life'
  },
  {
    id: 'HEART_OF_GOD',
    name: 'Heart of God',
    iconKey: 'heart',
    colorKey: 'rose',
    description: 'Understand God\'s character and love'
  },
];

export default function ThemesTab({ onThemeClick }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {THEME_OPTIONS.map((theme) => {
        const Icon = ICON_MAP[theme.iconKey] || Shield;
        const colorClass = COLOR_MAP[theme.colorKey] || COLOR_MAP.blue;
        
        return (
          <button
            key={theme.id}
            onClick={() => onThemeClick(theme.id)}
            className="text-left p-3 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all"
          >
            <div className="flex items-start gap-2">
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                <Icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{theme.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{theme.description}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export { THEME_OPTIONS, ICON_MAP, COLOR_MAP };