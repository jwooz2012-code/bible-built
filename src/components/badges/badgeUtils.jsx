import { TOTAL_CHAPTERS, OT_CHAPTERS, NT_CHAPTERS } from '@/components/bible/bibleData';

/**
 * Defines all badge data in one place
 * This is the single source of truth for badge definitions
 */
export function defineBadges({ 
  totalChaptersRead, 
  daysWithReadingDistinct, 
  totalBooksCompletedDistinct,
  lifetimeUniqueChapters,
  ntReadThroughCount,
  otOrNtCompletedFlag,
  mostCompletedBookCount,
  statsSharedCount = 0,
  statsReceivedCount = 0
}) {
  return [
    { 
      id: 0, 
      title: 'Battle', 
      subtitle: 'You showed up knowing the Christian life is a fight. The Word of God is your weapon — and this is where faithfulness begins.',
      achieved: true,
      current: 1,
      target: 1
    },
    { 
      id: 1, 
      title: 'First Rep', 
      subtitle: 'Read your first chapter',
      achieved: totalChaptersRead >= 1,
      current: totalChaptersRead,
      target: 1
    },
    { 
      id: 2, 
      title: 'Locked In', 
      subtitle: 'Completed a book',
      achieved: totalBooksCompletedDistinct >= 1,
      current: totalBooksCompletedDistinct,
      target: 1
    },
    { 
      id: 3, 
      title: 'Habit Forming', 
      subtitle: 'Read for 7 days',
      achieved: daysWithReadingDistinct >= 7,
      current: daysWithReadingDistinct,
      target: 7
    },
    { 
      id: 4, 
      title: 'Fifty Down', 
      subtitle: 'Read 50 chapters',
      achieved: totalChaptersRead >= 50,
      current: totalChaptersRead,
      target: 50
    },
    { 
      id: 5, 
      title: 'Triple Digits', 
      subtitle: 'Read 100 chapters',
      achieved: totalChaptersRead >= 100,
      current: totalChaptersRead,
      target: 100
    },
    { 
      id: 6, 
      title: 'All In', 
      subtitle: 'Read 250 chapters',
      achieved: totalChaptersRead >= 250,
      current: totalChaptersRead,
      target: 250
    },
    { 
      id: 7, 
      title: 'Built to Last', 
      subtitle: 'Read 500 chapters',
      achieved: totalChaptersRead >= 500,
      current: totalChaptersRead,
      target: 500
    },
    { 
      id: 8, 
      title: 'Cover to Cover', 
      subtitle: 'Completed 10 books',
      achieved: totalBooksCompletedDistinct >= 10,
      current: totalBooksCompletedDistinct,
      target: 10
    },
    { 
      id: 9, 
      title: 'Testament Strong', 
      subtitle: 'Finished OT or NT',
      achieved: otOrNtCompletedFlag,
      current: Math.max(lifetimeUniqueChapters, 0),
      target: Math.min(OT_CHAPTERS, NT_CHAPTERS)
    },
    { 
      id: 10, 
      title: 'The Whole Word', 
      subtitle: 'Read the entire Bible',
      achieved: lifetimeUniqueChapters >= TOTAL_CHAPTERS,
      current: lifetimeUniqueChapters,
      target: TOTAL_CHAPTERS
    },
    { 
      id: 11, 
      title: 'Back for More', 
      subtitle: 'Read the Bible twice',
      achieved: totalChaptersRead >= TOTAL_CHAPTERS * 2,
      current: Math.floor(totalChaptersRead / TOTAL_CHAPTERS),
      target: 2
    },
    { 
      id: 12, 
      title: 'Deep Roots', 
      subtitle: 'Read NT 5 times',
      achieved: ntReadThroughCount >= 5,
      current: ntReadThroughCount,
      target: 5
    },
    { 
      id: 13, 
      title: 'Iron Discipline', 
      subtitle: 'Read for 250 days',
      achieved: daysWithReadingDistinct >= 250,
      current: daysWithReadingDistinct,
      target: 250
    },
    { 
      id: 14, 
      title: 'Master Builder', 
      subtitle: 'Completed 30 books',
      achieved: totalBooksCompletedDistinct >= 30,
      current: totalBooksCompletedDistinct,
      target: 30
    },
    { 
      id: 15, 
      title: 'Built for a Lifetime', 
      subtitle: 'Read 1000 chapters',
      achieved: totalChaptersRead >= 1000,
      current: totalChaptersRead,
      target: 1000
    },
    { 
      id: 16, 
      title: 'Swordsmen', 
      subtitle: 'Complete any book 30 times',
      achieved: mostCompletedBookCount >= 30,
      current: mostCompletedBookCount,
      target: 30
    }
  ];
}

/**
 * Returns badges for display in horizontal rows
 * Ensures consistent ordering across all screens
 */
export function getBadgesForRow(badges, mode = 'earned') {
  if (mode === 'earned') {
    // Return only earned badges, in the order they appear in the master list
    return badges.filter(b => b.achieved);
  }
  
  // mode === 'all': return all badges (earned first, then locked)
  const earned = badges.filter(b => b.achieved);
  const locked = badges.filter(b => !b.achieved);
  return [...earned, ...locked];
}