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
  Swords,
  DoorOpen,
  Users,
  Heart,
  Handshake
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
    case 'Opened the Door':
      return <DoorOpen {...iconProps} style={{ color }} />;
    case 'Walking Accountably':
      return <Users {...iconProps} style={{ color }} />;
    case 'Living Examined':
      return <Heart {...iconProps} style={{ color }} />;
    case 'Lifted a Brother':
      return <DoorOpen {...iconProps} style={{ color }} />;
    case 'Faithful Encourager':
      return <Users {...iconProps} style={{ color }} />;
    case 'Strengthened Many':
      return <Handshake {...iconProps} style={{ color }} />;
    default:
      return <Circle {...iconProps} style={{ color }} />;
  }
};

export const getAchievementColor = (title) => {
  switch(title) {
    case 'Battle': return 'BLACK_WHITE'; // Stays black and white — foundational anchor
    case 'First Rep': return 'from-[#0EA5E9] to-[#0284C7]'; // Electric blue — energy, motion
    case 'Locked In': return 'from-[#10B981] to-[#059669]'; // Rich emerald green — discipline, completion
    case 'Habit Forming': return 'from-[#F59E0B] to-[#D97706]'; // Golden amber — consistency, warmth
    case 'Fifty Down': return 'from-[#EA580C] to-[#C2410C]'; // Burnt orange — momentum, progress
    case 'Triple Digits': return 'from-[#7C3AED] to-[#6D28D9]'; // Vibrant purple — achievement
    case 'All In': return 'from-[#DC2626] to-[#B91C1C]'; // Bold crimson — intensity, commitment
    case 'Built to Last': return 'from-[#06B6D4] to-[#0891B2]'; // Teal — modern, fresh
    case 'Built for a Lifetime': return 'from-[#1E40AF] to-[#1E3A8A]'; // Midnight navy — elegance, finality
    case 'Swordsmen': return 'from-[#DB2777] to-[#BE185D]'; // Hot pink — precision, mastery
    case 'Cover to Cover': return 'from-[#059669] to-[#047857]'; // Deep emerald — deep mastery
    case 'Testament Strong': return 'from-[#8B5CF6] to-[#7C3AED]'; // Royal purple — prestige
    case 'The Whole Word': return 'from-[#FBBF24] to-[#F59E0B]'; // Rich gold — ultimate achievement
    case 'Back for More': return 'from-[#14B8A6] to-[#0D9488]'; // Aqua teal — fresh restart
    case 'Deep Roots': return 'from-[#06B6D4] to-[#0891B2]'; // Cyan — depth, connection
    case 'Iron Discipline': return 'from-[#6366F1] to-[#4F46E5]'; // Indigo — strength, discipline
    case 'Master Builder': return 'from-[#A855F7] to-[#9333EA]'; // Violet — mastery, craft
    default: return 'from-[#F59E0B] to-[#D97706]';
  }
};