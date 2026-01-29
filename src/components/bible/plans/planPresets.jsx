import { getDateKey, addDaysKey, addYearsKey } from '@/components/bible/utils/dateUtils';

export const PLAN_PRESETS = [
  {
    id: 'bible_year',
    name: 'Whole Bible in a Year',
    description: 'Read through the entire Bible in 365 days',
    scope: 'BIBLE',
    getDates: (startDate) => ({
      startDate,
      endDate: addYearsKey(startDate, 1),
    }),
  },
  {
    id: 'nt_30',
    name: 'New Testament in 30 Days',
    description: 'Complete the New Testament in one month',
    scope: 'NT',
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 29),
    }),
  },
  {
    id: 'psalms_week',
    name: 'Psalms in a Week',
    description: 'Read all 150 Psalms in 7 days',
    scope: 'PSALMS',
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 6),
    }),
  },
  {
    id: 'leadership_intensive',
    name: 'Leadership Intensive',
    subtitle: 'Train your heart for biblical leadership.',
    description: 'A high-commitment reading plan for those called to lead. This plan moves quickly through Scripture\'s most formative leadership passages—developing humility, courage, doctrine, and endurance. Expect challenge. Expect growth.',
    shortHook: 'Train your heart for biblical leadership.',
    scope: 'LEADERSHIP_INTENSIVE',
    chaptersPerDay: 5,
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 15), // 16 days = 80 chapters (78 chapters in plan)
    }),
  },
  {
    id: 'wisdom_plunge',
    name: 'Wisdom Plunge',
    subtitle: 'Learn what God calls wisdom.',
    description: 'A slower, reflective reading plan through Scripture\'s wisdom books. Designed to shape your thinking, speech, decisions, and fear of the Lord. Read carefully. Think deeply. Apply daily.',
    shortHook: 'Slow down and grow deep in God\'s wisdom.',
    scope: 'WISDOM_PLUNGE',
    chaptersPerDay: 3,
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 28), // 29 days = 87 chapters (85 chapters in plan)
    }),
  },
  {
    id: 'intentional_motherhood',
    name: 'The Intentional Mom',
    subtitle: 'Anchor your motherhood in Scripture.',
    description: 'A Scripture-focused plan centered on faithful, God-centered motherhood.',
    shortHook: 'Build a faithful, God-centered life as a mother.',
    scope: 'INTENTIONAL_MOTHERHOOD',
    chaptersPerDay: 2,
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 9), // 10 days
    }),
  },
  {
    id: 'godly_man',
    name: 'The Godly Man',
    subtitle: 'Biblical manhood anchored in Scripture.',
    description: 'A disciplined Scripture plan focused on biblical manhood, leadership, and responsibility before God.',
    shortHook: 'Strength, discipline, and responsibility before God.',
    scope: 'GODLY_MAN',
    chaptersPerDay: 2,
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 9), // 10 days
    }),
  },
  {
    id: 'live_with_purpose',
    name: 'Live With Purpose',
    subtitle: 'Align your daily life with God\'s will.',
    description: 'A focused Scripture plan designed to align daily life with God\'s will through obedience and direction.',
    shortHook: 'Align your daily life with God\'s will.',
    scope: 'LIVE_WITH_PURPOSE',
    chaptersPerDay: 2,
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 9), // 10 days
    }),
  },
  {
    id: 'know_king_david',
    name: 'Know King David',
    subtitle: 'Walk through the life of David.',
    description: 'A Scripture journey through the life, heart, failures, repentance, and worship of King David.',
    shortHook: 'Walk through the life and heart of a man after God.',
    scope: 'KNOW_KING_DAVID',
    chaptersPerDay: 2,
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 13), // 14 days
    }),
  },
  {
    id: 'heart_of_god',
    name: 'Heart of God',
    subtitle: 'Discover God\'s character.',
    description: 'A deep Scripture plan focused on knowing God\'s character, holiness, love, justice, and mercy.',
    shortHook: 'Know God deeply and be shaped by His character.',
    scope: 'HEART_OF_GOD',
    chaptersPerDay: 2,
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 20), // 21 days
    }),
  },
  {
    id: 'chronological_ot_journey',
    name: 'Chronological Old Testament Journey',
    subtitle: 'Read the OT as one unfolding story.',
    description: 'Experience the Old Testament in historical order, seeing how God\'s plan unfolds chronologically from creation to the exile and return. This journey takes you through the narrative as it happened in time.',
    shortHook: 'Read the OT as one unfolding story in historical order.',
    scope: 'CHRONOLOGICAL_OT_JOURNEY',
    chaptersPerDay: 4,
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 364), // 365 days
    }),
  },
  {
    id: 'chronological_nt_journey',
    name: 'Chronological New Testament Journey',
    subtitle: 'Read the NT as one unfolding story in historical order.',
    description: 'Read the New Testament as one unfolding story—from the birth of Christ to the growth of the Church and the hope of His return. This guided journey follows the historical flow of Acts and places each book in its biblical context.',
    shortHook: 'Read the NT as one unfolding story in historical order.',
    scope: 'CHRONOLOGICAL_NT_JOURNEY',
    chaptersPerDay: 4,
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 89), // ~90 days at 3 chapters/day
    }),
  },
  {
    id: 'twelve_voices_one_holy_god',
    name: '12 Voices · 1 Holy God',
    subtitle: 'Hear the prophets. See the Holy God. Follow the Scripture to Christ.',
    description: 'An elite run through the Minor Prophets—with Scripture\'s own NT anchors. The twelve prophets of Israel spoke in different centuries, yet proclaimed one relentless message: God is holy, His people have rebelled, and judgment is coming—but mercy endures. This 21-day plan takes you through all 67 chapters of the Minor Prophets, interwoven with 17 key New Testament passages that reveal how the prophets\' warnings find their fulfillment in Christ, His church, and the coming kingdom. You\'ll read 4 chapters per day—deliberately paced to sustain focus without burnout. You\'ll encounter God\'s jealous love, burning holiness, patient warnings, covenant faithfulness, and the hope of restoration. This is not a casual devotional. It\'s a sustained immersion in the voice of God through prophets who risked everything to speak His truth.',
    shortHook: 'Minor Prophets + NT cross-refs in 21 days.',
    scope: 'TWELVE_VOICES_ONE_HOLY_GOD',
    chaptersPerDay: 4,
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 20), // 21 days
    }),
  },
];