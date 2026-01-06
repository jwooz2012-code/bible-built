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
  Hammer 
} from 'lucide-react';

const getAchievementIcon = (title) => {
  const iconProps = { className: "w-4 h-4", strokeWidth: 2 };
  
  switch(title) {
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
  if (!unlockedAchievements || unlockedAchievements.length === 0) {
    return null;
  }

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Badges</h3>
        <Link 
          to={createPageUrl('Stats')} 
          className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          View all
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {unlockedAchievements.slice(0, 7).map((achievement, idx) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${getAchievementColor(achievement.title)} opacity-80`}
            title={achievement.title}>
            <div className="text-white">
              {getAchievementIcon(achievement.title)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}