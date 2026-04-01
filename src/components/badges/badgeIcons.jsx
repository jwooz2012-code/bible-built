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
  Handshake,
  ArrowUpFromLine
} from 'lucide-react';

export const getAchievementIcon = (title, achieved, iconSize = 'default') => {
  const sizeClass = iconSize === 'xl' ? 'w-12 h-12' : iconSize === 'large' ? 'w-5 h-5' : 'w-4 h-4';
  const iconProps = { className: sizeClass, strokeWidth: iconSize === 'xl' ? 1.5 : 2 };
  const color = achieved ? '#FFFFFF' : '#9CA3AF';

  // Battle badge uses theme-aware color, no inline style
  const battleColor = title === 'Battle' ? undefined : color;

  // Locked badges: blurred + grayscale emblem
  const lockedStyle = !achieved ? {
    filter: 'blur(2px) grayscale(1)',
    opacity: 0.45,
    display: 'inline-flex',
  } : { display: 'inline-flex' };

  const wrap = (icon) => <span style={lockedStyle}>{icon}</span>;

  switch(title) {
    case 'Battle':
      return wrap(<Sword {...iconProps} style={{ color: '#FFFFFF' }} />);
    case 'First Rep':
      return wrap(<Zap {...iconProps} style={{ color: battleColor }} />);
    case 'Locked In':
      return wrap(<BookMarked {...iconProps} style={{ color }} />);
    case 'Habit Forming':
      return wrap(<CalendarCheck {...iconProps} style={{ color }} />);
    case 'Fifty Down':
      return wrap(<Library {...iconProps} style={{ color }} />);
    case 'Triple Digits':
      return wrap(<Award {...iconProps} style={{ color }} />);
    case 'All In':
      return wrap(<Flame {...iconProps} style={{ color }} />);
    case 'Built to Last':
      return wrap(<Blocks {...iconProps} style={{ color }} />);
    case 'Cover to Cover':
      return wrap(<BookCopy {...iconProps} style={{ color }} />);
    case 'Testament Strong':
      return wrap(<ScrollText {...iconProps} style={{ color }} />);
    case 'The Whole Word':
      return wrap(<Crown {...iconProps} style={{ color }} />);
    case 'Back for More':
      return wrap(<RefreshCw {...iconProps} style={{ color }} />);
    case 'Deep Roots':
      return wrap(<TreePine {...iconProps} style={{ color }} />);
    case 'Iron Discipline':
      return wrap(<Hammer {...iconProps} style={{ color }} />);
    case 'Master Builder':
      return wrap(<Ruler {...iconProps} style={{ color }} />);
    case 'Built for a Lifetime':
      return wrap(<Columns {...iconProps} style={{ color }} />);
    case 'Swordsmen':
      return wrap(<Swords {...iconProps} style={{ color }} />);
    case 'Opened the Door':
      return wrap(<DoorOpen {...iconProps} style={{ color }} />);
    case 'Walking Accountably':
      return wrap(<Users {...iconProps} style={{ color }} />);
    case 'Living Examined':
      return wrap(<Heart {...iconProps} style={{ color }} />);
    case 'Lifted a Brother':
      return wrap(<ArrowUpFromLine {...iconProps} style={{ color }} />);
    case 'Faithful Encourager':
      return wrap(<Users {...iconProps} style={{ color }} />);
    case 'Strengthened Many':
      return wrap(<Handshake {...iconProps} style={{ color }} />);
    default:
      return wrap(<Circle {...iconProps} style={{ color }} />);
  }
};

export const getAchievementColor = (title) => {
  switch(title) {
    case 'Battle': return 'BLACK_WHITE';
    case 'First Rep': return 'from-[#0EA5E9] to-[#0284C7]';
    case 'Locked In': return 'from-[#10B981] to-[#059669]';
    case 'Habit Forming': return 'from-[#F59E0B] to-[#D97706]';
    case 'Fifty Down': return 'from-[#EA580C] to-[#C2410C]';
    case 'Triple Digits': return 'from-[#7C3AED] to-[#6D28D9]';
    case 'All In': return 'from-[#DC2626] to-[#B91C1C]';
    case 'Built to Last': return 'from-[#06B6D4] to-[#0891B2]';
    case 'Built for a Lifetime': return 'from-[#1E40AF] to-[#1E3A8A]';
    case 'Swordsmen': return 'from-[#DB2777] to-[#BE185D]';
    case 'Cover to Cover': return 'from-[#059669] to-[#047857]';
    case 'Testament Strong': return 'from-[#8B5CF6] to-[#7C3AED]';
    case 'The Whole Word': return 'from-[#FBBF24] to-[#F59E0B]';
    case 'Back for More': return 'from-[#14B8A6] to-[#0D9488]';
    case 'Deep Roots': return 'from-[#06B6D4] to-[#0891B2]';
    case 'Iron Discipline': return 'from-[#6366F1] to-[#4F46E5]';
    case 'Master Builder': return 'from-[#A855F7] to-[#9333EA]';
    case 'Opened the Door': return 'from-[#9CA3AF] to-[#78716C]';
    case 'Walking Accountably': return 'from-[#A1A1AA] to-[#71717A]';
    case 'Living Examined': return 'from-[#B4B4B8] to-[#6B7280]';
    case 'Lifted a Brother': return 'from-[#2563EB] to-[#1D4ED8]';
    case 'Faithful Encourager': return 'from-[#A1A1AA] to-[#75838A]';
    case 'Strengthened Many': return 'from-[#B4B4B8] to-[#7C8A99]';
    default: return 'from-[#F59E0B] to-[#D97706]';
  }
};