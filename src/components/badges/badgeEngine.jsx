import { TOTAL_CHAPTERS, OT_CHAPTERS, NT_CHAPTERS, BIBLE_BOOKS } from '@/components/bible/bibleData';

/**
 * BADGE ENGINE — SINGLE SOURCE OF TRUTH
 * 
 * This is the ONLY place badge achievement logic exists.
 * All screens (Stats, Share Summary, Home, Badges page) must consume from here.
 * 
 * Input: raw reading logs + timeframe
 * Output: canonical metrics + badge states
 */

/**
 * Computes canonical metrics from reading logs
 * These are the ONLY metrics badges can reference
 */
function computeCanonicalMetrics(logs, user = null) {
  // Raw counts
  const totalChaptersRead = logs.length;
  const uniqueChapterIds = new Set(logs.map(l => l.chapterId));
  const uniqueChaptersRead = uniqueChapterIds.size;
  
  // Days
  const uniqueDays = new Set(logs.map(l => l.dateKey));
  const totalDaysRead = uniqueDays.size;
  
  // Testament breakdown
  const otChapters = logs.filter(l => l.testament === 'OT').length;
  const ntChapters = logs.filter(l => l.testament === 'NT').length;
  
  // Unique chapters by testament
  const otUniqueChapters = new Set(logs.filter(l => l.testament === 'OT').map(l => l.chapterId)).size;
  const ntUniqueChapters = new Set(logs.filter(l => l.testament === 'NT').map(l => l.chapterId)).size;
  
  // NT read-through count (based on total chapters, not unique)
  const ntReadThroughCount = Math.floor(ntChapters / NT_CHAPTERS);
  
  // OT or NT completed flag
  const otOrNtCompleted = otUniqueChapters >= OT_CHAPTERS || ntUniqueChapters >= NT_CHAPTERS;
  
  // Master Builder: Count UNIQUE books where ALL chapters have been read
  const bookChaptersRead = {};
  logs.forEach(log => {
    if (!bookChaptersRead[log.book]) {
      bookChaptersRead[log.book] = new Set();
    }
    bookChaptersRead[log.book].add(log.chapter);
  });
  
  let booksCompleted = 0;
  Object.keys(bookChaptersRead).forEach(bookName => {
    const bookData = BIBLE_BOOKS.find(b => b.name === bookName);
    if (bookData && bookChaptersRead[bookName].size >= bookData.chapters) {
      booksCompleted++;
    }
  });
  
  // Swordsmen: Count how many times the MOST-READ BOOK was FULLY COMPLETED
  // (Total chapters read of that book ÷ total chapters in book = completion count)
  const bookChapterCounts = {};
  logs.forEach(log => {
    bookChapterCounts[log.book] = (bookChapterCounts[log.book] || 0) + 1;
  });
  
  let mostCompletedBookCount = 0;
  Object.keys(bookChapterCounts).forEach(bookName => {
    const bookData = BIBLE_BOOKS.find(b => b.name === bookName);
    if (bookData) {
      const completionCount = Math.floor(bookChapterCounts[bookName] / bookData.chapters);
      mostCompletedBookCount = Math.max(mostCompletedBookCount, completionCount);
    }
  });
  mostCompletedBookCount = Math.max(0, mostCompletedBookCount);
  
  // Unique books touched
  const uniqueBooksRead = new Set(logs.map(l => l.book)).size;
  
  // User-specific metrics (accountability)
  const statsSharedCount = user?.statsSharedCount || 0;
  const statsReceivedCount = user?.statsReceivedCount || 0;
  
  // Streak computations derived from full log history
  const todayKey = new Date().toISOString().split('T')[0];
  const sortedAsc = [...uniqueDays].sort();
  let longestStreak = 0;
  let runLen = 0;
  let prevDateKey = null;
  for (const key of sortedAsc) {
    if (!prevDateKey) {
      runLen = 1;
    } else {
      const gap = Math.round((new Date(key) - new Date(prevDateKey)) / 86400000);
      runLen = gap === 1 ? runLen + 1 : 1;
    }
    if (runLen > longestStreak) longestStreak = runLen;
    prevDateKey = key;
  }
  const latestDateKey = sortedAsc[sortedAsc.length - 1] || null;
  const daysAgo = latestDateKey
    ? Math.round((new Date(todayKey) - new Date(latestDateKey)) / 86400000)
    : Infinity;
  const currentStreak = daysAgo <= 1 ? runLen : 0;

  return {
    totalChaptersRead,
    uniqueChaptersRead,
    totalDaysRead,
    otChapters,
    ntChapters,
    otUniqueChapters,
    ntUniqueChapters,
    ntReadThroughCount,
    otOrNtCompleted,
    booksCompleted,
    mostCompletedBookCount,
    uniqueBooksRead,
    statsSharedCount,
    statsReceivedCount,
    longestStreak,
    currentStreak
  };
}

/**
 * Badge definitions with achievement rules
 * Each badge explicitly declares which metric it uses
 */
function getBadgeDefinitions(metrics) {
  return [
    {
      id: 0,
      title: 'Battle',
      subtitle: 'You showed up knowing the Christian life is a fight. The Word of God is your weapon — and this is where faithfulness begins.',
      metric: 'always',
      achieved: true,
      current: 1,
      target: 1
    },
    {
      id: 1,
      title: 'First Rep',
      subtitle: 'Read your first chapter',
      metric: 'totalChaptersRead',
      achieved: metrics.totalChaptersRead >= 1,
      current: metrics.totalChaptersRead,
      target: 1
    },
    {
      id: 2,
      title: 'Locked In',
      subtitle: 'Completed a book',
      metric: 'booksCompleted',
      achieved: metrics.booksCompleted >= 1,
      current: metrics.booksCompleted,
      target: 1
    },
    {
      id: 3,
      title: 'Habit Forming',
      subtitle: 'Read for 7 days',
      metric: 'totalDaysRead',
      achieved: metrics.totalDaysRead >= 7,
      current: metrics.totalDaysRead,
      target: 7
    },
    {
      id: 4,
      title: 'Fifty Down',
      subtitle: 'Read 50 chapters',
      metric: 'totalChaptersRead',
      achieved: metrics.totalChaptersRead >= 50,
      current: metrics.totalChaptersRead,
      target: 50
    },
    {
      id: 5,
      title: 'Triple Digits',
      subtitle: 'Read 100 chapters',
      metric: 'totalChaptersRead',
      achieved: metrics.totalChaptersRead >= 100,
      current: metrics.totalChaptersRead,
      target: 100
    },
    {
      id: 6,
      title: 'All In',
      subtitle: 'Read 250 chapters',
      metric: 'totalChaptersRead',
      achieved: metrics.totalChaptersRead >= 250,
      current: metrics.totalChaptersRead,
      target: 250
    },
    {
      id: 7,
      title: 'Built to Last',
      subtitle: 'Read 500 chapters',
      metric: 'totalChaptersRead',
      achieved: metrics.totalChaptersRead >= 500,
      current: metrics.totalChaptersRead,
      target: 500
    },
    {
      id: 8,
      title: 'Cover to Cover',
      subtitle: 'Completed 10 books',
      metric: 'booksCompleted',
      achieved: metrics.booksCompleted >= 10,
      current: metrics.booksCompleted,
      target: 10
    },
    {
      id: 9,
      title: 'Testament Strong',
      subtitle: 'Finished OT or NT',
      metric: 'otOrNtCompleted',
      achieved: metrics.otOrNtCompleted,
      current: Math.max(metrics.otUniqueChapters, metrics.ntUniqueChapters),
      target: Math.min(OT_CHAPTERS, NT_CHAPTERS)
    },
    {
      id: 10,
      title: 'The Whole Word',
      subtitle: 'Read the entire Bible',
      metric: 'uniqueChaptersRead',
      achieved: metrics.uniqueChaptersRead >= TOTAL_CHAPTERS,
      current: metrics.uniqueChaptersRead,
      target: TOTAL_CHAPTERS
    },
    {
      id: 11,
      title: 'Back for More',
      subtitle: 'Read the Bible twice',
      metric: 'totalChaptersRead',
      achieved: metrics.totalChaptersRead >= TOTAL_CHAPTERS * 2,
      current: Math.floor(metrics.totalChaptersRead / TOTAL_CHAPTERS),
      target: 2
    },
    {
      id: 12,
      title: 'Deep Roots',
      subtitle: 'Read NT 5 times',
      metric: 'ntReadThroughCount',
      achieved: metrics.ntReadThroughCount >= 5,
      current: metrics.ntReadThroughCount,
      target: 5
    },
    {
      id: 13,
      title: 'Iron Discipline',
      subtitle: 'Read for 250 days',
      metric: 'totalDaysRead',
      achieved: metrics.totalDaysRead >= 250,
      current: metrics.totalDaysRead,
      target: 250
    },
    {
      id: 14,
      title: 'Master Builder',
      subtitle: 'Completed 30 unique books',
      metric: 'booksCompleted',
      achieved: metrics.booksCompleted >= 30,
      current: metrics.booksCompleted,
      target: 30
    },
    {
      id: 15,
      title: 'Built for a Lifetime',
      subtitle: 'Read 1000 chapters',
      metric: 'totalChaptersRead',
      achieved: metrics.totalChaptersRead >= 1000,
      current: metrics.totalChaptersRead,
      target: 1000
    },
    {
      id: 16,
      title: 'Swordsmen',
      subtitle: 'Read one book 30 times',
      metric: 'mostCompletedBookCount',
      achieved: metrics.mostCompletedBookCount >= 30,
      current: metrics.mostCompletedBookCount,
      target: 30
    },
    {
      id: 17,
      title: 'Opened the Door',
      subtitle: 'Shared your stats once',
      metric: 'statsSharedCount',
      achieved: metrics.statsSharedCount >= 1,
      current: metrics.statsSharedCount,
      target: 1,
      isAccountability: true
    },
    {
      id: 18,
      title: 'Walking Accountably',
      subtitle: 'Shared your stats 5 times',
      metric: 'statsSharedCount',
      achieved: metrics.statsSharedCount >= 5,
      current: metrics.statsSharedCount,
      target: 5,
      isAccountability: true
    },
    {
      id: 19,
      title: 'Living Examined',
      subtitle: 'Shared your stats 12 times',
      metric: 'statsSharedCount',
      achieved: metrics.statsSharedCount >= 12,
      current: metrics.statsSharedCount,
      target: 12,
      isAccountability: true
    },
    {
      id: 20,
      title: 'Lifted a Brother',
      subtitle: 'Received stats once',
      metric: 'statsReceivedCount',
      achieved: metrics.statsReceivedCount >= 1,
      current: metrics.statsReceivedCount,
      target: 1,
      isAccountability: true
    },
    {
      id: 21,
      title: 'Faithful Encourager',
      subtitle: 'Received stats 5 times',
      metric: 'statsReceivedCount',
      achieved: metrics.statsReceivedCount >= 5,
      current: metrics.statsReceivedCount,
      target: 5,
      isAccountability: true
    },
    {
      id: 22,
      title: 'Strengthened Many',
      subtitle: 'Received stats 12 times',
      metric: 'statsReceivedCount',
      achieved: metrics.statsReceivedCount >= 12,
      current: metrics.statsReceivedCount,
      target: 12,
      isAccountability: true
    },
    {
      id: 23,
      title: 'First Flame',
      subtitle: 'Read 7 days in a row',
      metric: 'longestStreak',
      achieved: metrics.longestStreak >= 7,
      current: metrics.longestStreak,
      target: 7,
      isStreak: true
    },
    {
      id: 24,
      title: 'Burning Bright',
      subtitle: 'Read 30 days in a row',
      metric: 'longestStreak',
      achieved: metrics.longestStreak >= 30,
      current: metrics.longestStreak,
      target: 30,
      isStreak: true
    },
    {
      id: 25,
      title: 'Unbroken',
      subtitle: 'Read 100 days in a row',
      metric: 'longestStreak',
      achieved: metrics.longestStreak >= 100,
      current: metrics.longestStreak,
      target: 100,
      isStreak: true
    },
    {
      id: 26,
      title: 'Iron Streak',
      subtitle: 'Read 250 days in a row',
      metric: 'longestStreak',
      achieved: metrics.longestStreak >= 250,
      current: metrics.longestStreak,
      target: 250,
      isStreak: true
    },
    {
      id: 27,
      title: 'Year of the Word',
      subtitle: 'Read 365 days in a row',
      metric: 'longestStreak',
      achieved: metrics.longestStreak >= 365,
      current: metrics.longestStreak,
      target: 365,
      isStreak: true
    }
  ];
}

/**
 * MAIN BADGE ENGINE
 * 
 * Computes badge state from reading logs
 * 
 * @param {Array} logs - Reading log entries
 * @param {Object} user - User object (for accountability counters)
 * @param {Object} options - { debug: boolean }
 * @returns {Object} - { badges, metrics, earnedBadgeIds, progressByBadgeId }
 */
export function computeBadgeState(logs = [], user = null, options = {}) {
  const { debug = false } = options;
  
  // Step 1: Compute canonical metrics
  const metrics = computeCanonicalMetrics(logs, user);
  
  // Step 2: Get badge definitions with computed achievement states
  const badges = getBadgeDefinitions(metrics);
  
  // Step 3: Extract earned badge IDs and progress map
  const earnedBadgeIds = badges.filter(b => b.achieved).map(b => b.id);
  const progressByBadgeId = {};
  badges.forEach(b => {
    progressByBadgeId[b.id] = {
      current: b.current,
      target: b.target,
      achieved: b.achieved,
      metric: b.metric
    };
  });
  
  // Step 4: Debug output if requested
  if (debug) {
    console.group('🏆 BADGE ENGINE DEBUG');
    console.log('Total logs:', logs.length);
    console.log('Canonical Metrics:', metrics);
    console.log('Earned Badges:', earnedBadgeIds.length, '/', badges.length);
    console.table(badges.map(b => ({
      id: b.id,
      title: b.title,
      metric: b.metric,
      current: b.current,
      target: b.target,
      achieved: b.achieved ? '✓' : '✗'
    })));
    console.groupEnd();
  }
  
  return {
    badges,
    metrics,
    earnedBadgeIds,
    progressByBadgeId
  };
}

/**
 * AUDIT UTILITY
 * 
 * Compares badge states between two timeframes/contexts
 */
export function auditBadgeConsistency(state1, state2, label1 = 'Context 1', label2 = 'Context 2') {
  const earned1 = new Set(state1.earnedBadgeIds);
  const earned2 = new Set(state2.earnedBadgeIds);
  
  const onlyIn1 = [...earned1].filter(id => !earned2.has(id));
  const onlyIn2 = [...earned2].filter(id => !earned1.has(id));
  
  if (onlyIn1.length > 0 || onlyIn2.length > 0) {
    console.group('⚠️ BADGE INCONSISTENCY DETECTED');
    console.log(`${label1} earned:`, earned1.size);
    console.log(`${label2} earned:`, earned2.size);
    
    if (onlyIn1.length > 0) {
      console.log(`Only in ${label1}:`, onlyIn1.map(id => {
        const badge = state1.badges.find(b => b.id === id);
        return `${badge.title} (${badge.metric})`;
      }));
    }
    
    if (onlyIn2.length > 0) {
      console.log(`Only in ${label2}:`, onlyIn2.map(id => {
        const badge = state2.badges.find(b => b.id === id);
        return `${badge.title} (${badge.metric})`;
      }));
    }
    
    console.groupEnd();
    return false;
  }
  
  console.log(`✓ Badge consistency verified: ${label1} ↔ ${label2}`);
  return true;
}