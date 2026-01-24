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
  Circle,
  Sword,
  Swords
} from 'lucide-react';

export const getAchievementIcon = (title, achieved, iconSize = 'default') => {
  const sizeClass = iconSize === 'large' ? 'w-5 h-5' : 'w-4 h-4';
  const iconProps = { className: sizeClass, strokeWidth: 2 };
  const color = achieved ? '#FFFFFF' : '#9CA3AF';
  
  // Battle badge uses theme-aware color, no inline style
  const battleColor = title === 'Battle' ? undefined : color;
  
  switch(title) {
    case 'Battle':
      return <Sword {...iconProps} />;
    case 'First Rep':
      return <Zap {...iconProps} style={{ color: battleColor }} />;
    case 'Locked In':
      return <BookMarked {...iconProps} style={{ color }} />;
    case 'Habit Forming':
      return <CalendarCheck {...iconProps} style={{ color }} />;
    case 'Fifty Down':
      return <Library {...iconProps} style={{ color }} />;
    case 'Triple Digits':
      return <Award {...iconProps} style={{ color }} />;
    case 'All In':
      return <Flame {...iconProps} style={{ color }} />;
    case 'Built to Last':
      return <Blocks {...iconProps} style={{ color }} />;
    case 'Cover to Cover':
      return <BookCopy {...iconProps} style={{ color }} />;
    case 'Testament Strong':
      return <ScrollText {...iconProps} style={{ color }} />;
    case 'The Whole Word':
      return <Crown {...iconProps} style={{ color }} />;
    case 'Back for More':
      return <RefreshCw {...iconProps} style={{ color }} />;
    case 'Deep Roots':
      return <TreePine {...iconProps} style={{ color }} />;
    case 'Iron Discipline':
      return <Hammer {...iconProps} style={{ color }} />;
    case 'Master Builder':
      return <Ruler {...iconProps} style={{ color }} />;
    case 'Built for a Lifetime':
      return <Columns {...iconProps} style={{ color }} />;
    case 'Swordsmen':
      return <Swords {...iconProps} style={{ color }} />;
    default:
      return <Circle {...iconProps} style={{ color }} />;
  }
};

export const getAchievementColor = (title) => {
  switch(title) {
    case 'Battle': return 'BLACK_WHITE';
    case 'First Rep': return 'from-[#D1D5DB] to-[#9CA3AF]';
    case 'Locked In': return 'from-[#10B981] to-[#059669]';
    case 'Habit Forming': return 'from-[#10B981] to-[#059669]';
    case 'Fifty Down': return 'from-[#F97316] to-[#EA580C]';
    case 'Triple Digits': return 'from-[#FBBF24] to-[#F59E0B]';
    case 'All In': return 'from-[#EF4444] to-[#DC2626]';
    case 'Built to Last': return 'from-[#D4A574] to-[#B8956A]';
    case 'Built for a Lifetime': return 'from-[#64748B] to-[#475569]';
    case 'Swordsmen': return 'from-[#94A3B8] to-[#64748B]';
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