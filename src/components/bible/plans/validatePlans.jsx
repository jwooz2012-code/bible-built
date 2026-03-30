/**
 * Plan Validator - Dev tool to ensure no empty days in any reading plan
 */

import { PLAN_PRESETS } from './planPresets';
import { CURATED_PLANS } from './curatedPlans';
import { buildScopeChapters } from './planUtils';
import { getDateKey, addDaysKey } from '@/components/bible/utils/dateUtils';

/**
 * Validate all plan presets for empty days
 * Returns array of issues found
 */
export function validateAllPlans() {
  const issues = [];
  const todayKey = getDateKey();

  PLAN_PRESETS.forEach((preset) => {
    const dates = preset.getDates(todayKey);
    const { startDate, endDate } = dates;
    
    // Calculate total days in plan
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Build scope chapters
    const scopeChapters = buildScopeChapters(preset.scope);
    const totalChapters = scopeChapters.length;
    
    // If no chapters in scope, that's a problem
    if (totalChapters === 0 && preset.scope !== 'NONE') {
      issues.push({
        presetId: preset.id,
        scope: preset.scope,
        issue: 'NO_CHAPTERS',
        message: `Scope ${preset.scope} has 0 chapters - likely missing from CURATED_PLANS or buildScopeChapters`,
        totalDays,
        chaptersPerDay: preset.chaptersPerDay
      });
      return;
    }
    
    // Check each day in the plan
    let hasEmptyDay = false;
    for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
      const dateKey = addDaysKey(startDate, dayOffset);
      const dayIndex = dayOffset;
      
      const chaptersPerDay = Number(preset.chaptersPerDay || Math.ceil(totalChapters / totalDays));
      const start = dayIndex * chaptersPerDay;
      const end = start + chaptersPerDay;
      const dayAssignment = scopeChapters.slice(start, end);
      
      if (dayAssignment.length === 0 && dayOffset < totalDays) {
        hasEmptyDay = true;
        issues.push({
          presetId: preset.id,
          scope: preset.scope,
          dateKey,
          dayIndex,
          issue: 'EMPTY_DAY',
          message: `Day ${dayIndex + 1} has 0 chapters assigned`,
          chaptersPerDay,
          totalChapters,
          totalDays,
          sliceStart: start,
          sliceEnd: end
        });
      }
    }
    
    // Calculate expected vs actual coverage
    const chaptersPerDay = Number(preset.chaptersPerDay || Math.ceil(totalChapters / totalDays));
    const totalAssignable = chaptersPerDay * totalDays;
    
    if (totalChapters < totalAssignable && !hasEmptyDay) {
      issues.push({
        presetId: preset.id,
        scope: preset.scope,
        issue: 'INSUFFICIENT_CHAPTERS',
        message: `Plan needs ${totalAssignable} chapters but only has ${totalChapters} - will run out before end`,
        totalChapters,
        totalDays,
        chaptersPerDay,
        shortfall: totalAssignable - totalChapters
      });
    }
  });
  
  return issues;
}

/**
 * Run validation and log results to console
 */
export function runValidation() {
  const issues = validateAllPlans();
  if (import.meta.env.DEV) {
    if (issues.length === 0) {
      console.log('✅ All plans validated successfully - no empty days found!');
    } else {
      console.warn(`❌ Found ${issues.length} plan issue(s):`, issues);
    }
  }
  return issues.length === 0;
}