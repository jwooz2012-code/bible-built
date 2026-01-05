import React from 'react';
import { Trophy, TrendingUp, Calendar, BookOpen } from 'lucide-react';

export default function PersonalRecordsCard({ records }) {
  const items = [
    { icon: Trophy, label: 'Longest Streak', value: `${records.longestStreak} days` },
    { icon: TrendingUp, label: 'Best Week', value: `${records.bestRolling7} chapters` },
    { icon: Calendar, label: 'Best Month', value: `${records.bestMonth} chapters` },
    { icon: BookOpen, label: 'Most Read', value: records.mostReadBook.name }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5 energy-card energy-border">
      <h3 className="text-base font-semibold text-foreground mb-4">Personal Records</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <div key={i} className="bg-secondary rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <item.icon className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
            <div className="text-sm font-semibold text-foreground">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}