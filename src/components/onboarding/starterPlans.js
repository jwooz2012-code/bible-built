import { PLAN_PRESETS } from '@/components/bible/plans/planPresets';
import { buildScopeChapters } from '@/components/bible/plans/planUtils';
import { getDateKey } from '@/components/bible/utils/dateUtils';

// Ordered from gentlest to most ambitious.
const STARTER_PLAN_IDS = ['heart_of_god', 'chronological_nt_journey', 'bible_year'];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getStarterPlans(startDate = getDateKey()) {
  return STARTER_PLAN_IDS.map((id) => {
    const preset = PLAN_PRESETS.find((p) => p.id === id);
    const { endDate } = preset.getDates(startDate);
    const days = Math.round((new Date(endDate) - new Date(startDate)) / MS_PER_DAY) + 1;
    // Same fallback PlanModal uses for presets without a fixed pace.
    const chaptersPerDay = preset.chaptersPerDay ?? Math.ceil(buildScopeChapters(preset.scope).length / days);
    return {
      id,
      name: preset.name,
      hook: preset.shortHook ?? preset.description,
      scope: preset.scope,
      startDate,
      endDate,
      durationLabel: days >= 360 ? '1 year' : `${days} days`,
      chaptersPerDay,
    };
  });
}
