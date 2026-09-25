import { getDateKey } from '@/components/bible/utils/dateUtils';

export const THEMED_PLANS_DROP = {
  id: 'themed-plans-2026-09',
  releasedOn: '2026-09-25',
  newUntil: '2026-10-25',
  themeKeys: ['WARRIORS_OF_GOD', 'BATTLE_IS_THE_LORDS', 'FAMOUS_PRAYERS'],
};

export const isNewTheme = (themeKey, todayKey = getDateKey()) =>
  THEMED_PLANS_DROP.themeKeys.includes(themeKey) && todayKey <= THEMED_PLANS_DROP.newUntil;
