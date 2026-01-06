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
    id: 'leadership_30',
    name: '30-Day Spiritual Leadership',
    description: 'Curated leadership passages for ministry',
    scope: 'LEADERSHIP_30',
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 29),
    }),
  },
  {
    id: 'wisdom_7',
    name: '7-Day Wisdom Plunge',
    description: 'Dive deep into biblical wisdom literature',
    scope: 'WISDOM_7',
    getDates: (startDate) => ({
      startDate,
      endDate: addDaysKey(startDate, 6),
    }),
  },
];