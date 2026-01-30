import React from 'react';
import { Shield, Lamp, Leaf, Compass, Crown, Heart, Cross, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChronologicalJourneyCard from './ChronologicalJourneyCard';

const ICON_MAP = {
  cross: Cross,
  shield: Shield,
  lamp: Lamp,
  leaf: Leaf,
  compass: Compass,
  crown: Crown,
  heart: Heart,
};

const COLOR_MAP = {
  gold: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
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
    id: 'CHRONOLOGICAL_OT_JOURNEY',
    name: 'Chronological OT Journey',
    iconKey: 'compass',
    colorKey: 'orange',
    description: 'Read the OT as one unfolding story in historical order'
  },
  {
    id: 'CHRONOLOGICAL_NT_JOURNEY',
    name: 'Chronological NT Journey',
    iconKey: 'compass',
    colorKey: 'cyan',
    description: 'Read the NT as one unfolding story in historical order'
  },
  {
    id: 'WHO_IS_JESUS',
    name: 'Who Is Jesus?',
    iconKey: 'cross',
    colorKey: 'gold',
    description: 'From Promise to Fulfillment'
  },
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
  {
    id: 'TWELVE_VOICES_ONE_HOLY_GOD',
    name: '12 Voices · 1 Holy God',
    iconKey: 'compass',
    colorKey: 'gold',
    description: 'Minor Prophets + NT cross-refs in 21 days'
  },
];

export default function ThemesTab({ onThemeClick, selectedTheme }) {
  const chronologicalThemes = THEME_OPTIONS.slice(0, 2);
  const standardThemes = THEME_OPTIONS.slice(2);
  
  return (
    <div className="space-y-4">
      {/* Full-width chronological journey cards */}
      <div className="space-y-3">
        {chronologicalThemes.map((theme) => {
          const Icon = ICON_MAP[theme.iconKey] || Shield;
          const colorClass = COLOR_MAP[theme.colorKey] || COLOR_MAP.blue;
          const isSelected = selectedTheme === theme.id;
          
          return (
            <ChronologicalJourneyCard
              key={theme.id}
              theme={theme}
              Icon={Icon}
              colorClass={colorClass}
              isSelected={isSelected}
              onThemeClick={onThemeClick}
            />
          );
        })}
      </div>
      
      {/* Standard theme grid */}
      <div className="grid grid-cols-2 gap-3">
        {standardThemes.map((theme) => {
          const Icon = ICON_MAP[theme.iconKey] || Shield;
          const colorClass = COLOR_MAP[theme.colorKey] || COLOR_MAP.blue;
          const isSelected = selectedTheme === theme.id;
          
          return (
            <button
              key={theme.id}
              onClick={() => onThemeClick(theme.id)}
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
                  <div className="text-sm font-semibold text-foreground">{theme.name}</div>
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

export { THEME_OPTIONS, ICON_MAP, COLOR_MAP };