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
    case 'First Rep': return 'from-[#9CA3AF] to-[#6B7280]'; // Gray
    case 'Locked In': return 'from-[#2FA4A9] to-[#278A8E]'; // Green
    case 'Habit Forming': return 'from-[#E3A23A] to-[#C88B2E]'; // Orange
    case 'Fifty Down': return 'from-[#3A6FEA] to-[#2F5BC7]'; // Blue
    case 'Triple Digits': return 'from-[#E3A23A] to-[#C88B2E]'; // Orange
    case 'All In': return 'from-[#C94A4A] to-[#A93D3D]'; // Red
    case 'Built to Last': return 'from-[#E3A23A] to-[#C88B2E]'; // Orange
    case 'Built for a Lifetime': return 'from-[#6B7280] to-[#4B5563]'; // Gray
    case 'Swordsmen': return 'from-[#6B7280] to-[#4B5563]'; // Gray
    case 'Cover to Cover': return 'from-[#2FA4A9] to-[#278A8E]'; // Green
    case 'Testament Strong': return 'from-[#6B5BD2] to-[#5647B0]'; // Purple
    case 'The Whole Word': return 'from-[#E3A23A] to-[#C88B2E]'; // Orange
    case 'Back for More': return 'from-[#3A6FEA] to-[#2F5BC7]'; // Blue
    case 'Deep Roots': return 'from-[#2FA4A9] to-[#278A8E]'; // Green
    case 'Iron Discipline': return 'from-[#6B7280] to-[#4B5563]'; // Gray
    case 'Master Builder': return 'from-[#6B5BD2] to-[#5647B0]'; // Purple
    default: return 'from-[#E3A23A] to-[#C88B2E]';
  }
};