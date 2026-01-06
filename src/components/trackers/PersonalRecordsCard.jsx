import React from 'react';
import { Trophy, TrendingUp, Calendar, BookOpen } from 'lucide-react';

export default function PersonalRecordsCard({ records, currentStreak }) {
  const items = [
    { icon: Trophy, label: 'Current Streak', value: `${currentStreak || 0} days`, color: '#FACC15' },
    { icon: TrendingUp, label: 'Best Week', value: `${records.bestRolling7} chapters`, color: '#10B981' },
    { icon: Calendar, label: 'Best Month', value: `${records.bestMonth} chapters`, color: '#3B82F6' },
    { icon: BookOpen, label: 'Most Read', value: records.mostReadBook.name, color: '#A855F7' }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">Personal Records</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <div key={i} className="bg-secondary rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <item.icon className="w-4 h-4" style={{ color: item.color }} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
            <div className="text-sm font-semibold text-foreground">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}