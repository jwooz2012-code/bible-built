import React from 'react';
import { Shield, Lamp, Leaf, Compass, Crown, Heart } from 'lucide-react';

const THEME_OPTIONS = [
  {
    id: 'LEADERSHIP_INTENSIVE',
    name: 'Leadership Intensive',
    icon: Shield,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    description: 'Biblical leadership principles'
  },
  {
    id: 'WISDOM_PLUNGE',
    name: 'Wisdom Plunge',
    icon: Lamp,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    description: 'Dive deep into wisdom literature'
  },
  {
    id: 'INTENTIONAL_MOTHERHOOD',
    name: 'The Intentional Mom',
    icon: Leaf,
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    description: 'Biblical motherhood and family'
  },
  {
    id: 'GODLY_MAN',
    name: 'The Godly Man',
    icon: Shield,
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    description: 'Biblical masculinity and character'
  },
  {
    id: 'LIVE_WITH_PURPOSE',
    name: 'Live With Purpose',
    icon: Compass,
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    description: 'Discover God\'s purpose for your life'
  },
  {
    id: 'KNOW_KING_DAVID',
    name: 'Know King David',
    icon: Crown,
    color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    description: 'Journey through David\'s life'
  },
  {
    id: 'HEART_OF_GOD',
    name: 'Heart of God',
    icon: Heart,
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    description: 'Understand God\'s character and love'
  },
];

export default function ThemesTab({ selectedTheme, onThemeChange }) {
  return (
    <div className="space-y-3">
      {THEME_OPTIONS.map((theme) => {
        const Icon = theme.icon;
        const isSelected = selectedTheme === theme.id;
        
        return (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              isSelected
                ? 'border-foreground bg-accent'
                : 'border-border bg-card hover:bg-accent/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${theme.color}`}>
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