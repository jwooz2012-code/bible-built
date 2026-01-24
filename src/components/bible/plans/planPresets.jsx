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
    id: 'ot_chronological',
    name: 'Old Testament – Chronological',
    subtitle: 'Read the OT in historical order.',
    description: 'Read the Old Testament in historical order. Narrative books remain intact, while Psalms are grouped and placed in historically appropriate sections to preserve clarity, flow, and theological integrity.',
    shortHook: 'Old Testament in the order events happened.',
    scope: 'OT_CHRONOLOGICAL',
    chaptersPerDay: 3,
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 309), // 310 days × 3 ch/day ≈ 929 OT chapters
    }),
  },
  {
    id: 'chronological_bible',
    name: 'Chronological Bible',
    subtitle: 'Read Scripture in the order it happened.',
    description: 'A full-Bible reading plan that follows the historical timeline of Scripture. This plan weaves narrative, poetry, and prophecy together as events unfold—helping you see God\'s redemptive work clearly from Genesis to Revelation.',
    shortHook: 'Read the entire Bible in the order events actually happened.',
    scope: 'CHRONOLOGICAL_BIBLE',
    chaptersPerDay: 4,
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 364), // 365 days × 4 ch/day = 1460 chapters
    }),
  },
  {
    id: 'chronological_gospels',
    name: 'Chronological Gospels',
    subtitle: 'Walk through the life of Christ as it unfolded.',
    description: 'A chronological harmony of the four Gospels. This plan arranges Matthew, Mark, Luke, and John into a single, unified timeline—allowing you to follow the life, ministry, death, and resurrection of Jesus step by step.',
    shortHook: 'Follow the life of Jesus as the Gospel accounts unfold together.',
    scope: 'CHRONOLOGICAL_GOSPELS',
    chaptersPerDay: 3,
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 44), // 45 days × 3 ch/day = 135 chapters
    }),
  },
];