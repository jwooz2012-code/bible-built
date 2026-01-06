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
    scope: 'LEADERSHIP_INTENSIVE',
    chaptersPerDay: 5,
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 39), // ~40 days
    }),
  },
  {
    id: 'wisdom_plunge',
    name: 'Wisdom Plunge',
    subtitle: 'Learn what God calls wisdom.',
    description: 'A slower, reflective reading plan through Scripture\'s wisdom books. Designed to shape your thinking, speech, decisions, and fear of the Lord. Read carefully. Think deeply. Apply daily.',
    scope: 'WISDOM_PLUNGE',
    chaptersPerDay: 3,
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 29), // ~30 days
    }),
  },
  {
    id: 'intentional_motherhood',
    name: 'Intentional Motherhood',
    description: 'A Scripture-focused plan centered on faithful, God-centered motherhood.',
    scope: 'INTENTIONAL_MOTHERHOOD',
    chaptersPerDay: 2,
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 9), // 10 days
    }),
  },
];