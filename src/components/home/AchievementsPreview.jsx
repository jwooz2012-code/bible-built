import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Zap, 
  BookMarked, 
  CalendarCheck, 
  Library, 
  Award, 
  Flame, 
  Blocks, 
  Columns, 
  BookCopy, 
  Ruler, 
  ScrollText, 
  Crown, 
  RefreshCw, 
  TreePine, 
  Hammer,
  Sword
} from 'lucide-react';

const getAchievementIcon = (title) => {
  const iconProps = { className: "w-4 h-4", strokeWidth: 2 };
  
  switch(title) {
    case 'Battle': return <Sword {...iconProps} />;
    case 'First Rep': return <Zap {...iconProps} />;
    case 'Locked In': return <BookMarked {...iconProps} />;
    case 'Habit Forming': return <CalendarCheck {...iconProps} />;
    case 'Fifty Down': return <Library {...iconProps} />;
    case 'Triple Digits': return <Award {...iconProps} />;
    case 'All In': return <Flame {...iconProps} />;
    case 'Built to Last': return <Blocks {...iconProps} />;
    case 'Cover to Cover': return <BookCopy {...iconProps} />;
    case 'Testament Strong': return <ScrollText {...iconProps} />;
    case 'The Whole Word': return <Crown {...iconProps} />;
    case 'Back for More': return <RefreshCw {...iconProps} />;
    case 'Deep Roots': return <TreePine {...iconProps} />;
    case 'Iron Discipline': return <Hammer {...iconProps} />;
    case 'Master Builder': return <Ruler {...iconProps} />;
    case 'Built for a Lifetime': return <Columns {...iconProps} />;
    default: return <Award {...iconProps} />;
  }
};

const getAchievementColor = (title) => {
  switch(title) {
    case 'Battle': return 'BLACK_WHITE';
    case 'First Rep': return 'from-[#60A5FA] to-[#3B82F6]';
    case 'Locked In': return 'from-[#10B981] to-[#059669]';
    case 'Habit Forming': return 'from-[#10B981] to-[#059669]';
    case 'Fifty Down': return 'from-[#F97316] to-[#EA580C]';
    case 'Triple Digits': return 'from-[#FBBF24] to-[#F59E0B]';
    case 'All In': return 'from-[#EF4444] to-[#DC2626]';
    case 'Built to Last': return 'from-[#D4A574] to-[#B8956A]';
    case 'Built for a Lifetime': return 'from-[#64748B] to-[#475569]';
    case 'Cover to Cover': return 'from-[#14B8A6] to-[#0D9488]';
    case 'Testament Strong': return 'from-[#A855F7] to-[#9333EA]';
    case 'The Whole Word': return 'from-[#FBBF24] to-[#F59E0B]';
    case 'Back for More': return 'from-[#0EA5E9] to-[#0284C7]';
    case 'Deep Roots': return 'from-[#84CC16] to-[#65A30D]';
    case 'Iron Discipline': return 'from-[#6B7280] to-[#4B5563]';
    case 'Master Builder': return 'from-[#6366F1] to-[#4F46E5]';
    default: return 'from-[#F97316] to-[#FACC15]';
  }
};

export default function AchievementsPreview({ unlockedAchievements }) {
  const totalSlots = 5;
  const earned = unlockedAchievements || [];
  const placeholderCount = Math.max(0, totalSlots - earned.length);

  return (
    <Link 
      to={createPageUrl('Stats')} 
      className="block mt-3 mb-1">
      <div className="text-center">
        <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-2">
          Badges
        </p>
        <div className="flex items-center justify-center gap-2">
          {earned.slice(0, totalSlots).map((achievement, idx) => {
            const color = getAchievementColor(achievement.title);
            const isBW = color === 'BLACK_WHITE';
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  isBW 
                    ? 'bg-foreground' 
                    : `bg-gradient-to-br ${color}`
                }`}
                title={achievement.title}>
                <div className={isBW ? 'text-background' : 'text-white'}>
                  {getAchievementIcon(achievement.title)}
                </div>
              </motion.div>
            );
          })}
          {Array.from({ length: placeholderCount }).map((_, idx) => (
            <div
              key={`placeholder-${idx}`}
              className="w-9 h-9 rounded-full flex-shrink-0 border border-border/40 bg-muted/20"
            />
          ))}
        </div>
      </div>
    </Link>
  );
}