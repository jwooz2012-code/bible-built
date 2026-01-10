import { getDateKey, addDaysKey } from '@/components/bible/utils/dateUtils';

/**
 * Shared plan generator for Books, Themes, and People
 * Distributes chapters evenly across reading days with NO empty days
 */
export function generatePlanSchedule({
  chapterList,
  startDate,
  timeframe, // { mode: 'finishIn', days: N } OR { mode: 'dateRange', endDate: YYYY-MM-DD }
  skipSundays = false,
  maxPerDay = null, // nullable, only used if set
}) {
  if (!chapterList || chapterList.length === 0) {
    throw new Error('Chapter list cannot be empty');
  }

  // Step 1: Build initial scheduleDates
  let scheduleDates = [];
  
  if (timeframe.mode === 'finishIn') {
    let currentDate = startDate;
    let daysAdded = 0;
    
    while (daysAdded < timeframe.days) {
      const date = new Date(currentDate + 'T00:00:00');
      const isSunday = date.getDay() === 0;
      
      if (!skipSundays || !isSunday) {
        scheduleDates.push(currentDate);
        daysAdded++;
      }
      
      currentDate = addDaysKey(currentDate, 1);
    }
  } else {
    // dateRange mode
    let currentDate = startDate;
    const endDate = timeframe.endDate;
    
    while (currentDate <= endDate) {
      const date = new Date(currentDate + 'T00:00:00');
      const isSunday = date.getDay() === 0;
      
      if (!skipSundays || !isSunday) {
        scheduleDates.push(currentDate);
      }
      
      currentDate = addDaysKey(currentDate, 1);
    }
  }

  if (scheduleDates.length === 0) {
    throw new Error('No valid reading days in the selected timeframe');
  }

  // Step 2: Compute auto pace
  const totalChapters = chapterList.length;
  let readingDays = scheduleDates.length;
  let autoPace = Math.ceil(totalChapters / readingDays);

  // Step 3: Apply maxPerDay if needed
  if (maxPerDay && autoPace > maxPerDay) {
    // Need to extend scheduleDates
    let lastDate = scheduleDates[scheduleDates.length - 1];
    
    while (Math.ceil(totalChapters / scheduleDates.length) > maxPerDay) {
      lastDate = addDaysKey(lastDate, 1);
      const date = new Date(lastDate + 'T00:00:00');
      const isSunday = date.getDay() === 0;
      
      if (!skipSundays || !isSunday) {
        scheduleDates.push(lastDate);
      }
    }
    
    readingDays = scheduleDates.length;
    autoPace = Math.ceil(totalChapters / readingDays);
  }

  // Step 4: Distribute chapters evenly (NO empty days)
  const base = Math.floor(totalChapters / readingDays);
  const remainder = totalChapters % readingDays;
  
  const planDays = [];
  let chapterIndex = 0;
  
  for (let dayIndex = 0; dayIndex < readingDays; dayIndex++) {
    // Assign base chapters to every day
    let dayCount = base;
    
    // Assign remainder chapters to LATER days
    if (dayIndex >= (readingDays - remainder)) {
      dayCount += 1;
    }
    
    // Extract this day's assignments
    const assignments = [];
    for (let i = 0; i < dayCount && chapterIndex < totalChapters; i++) {
      assignments.push(chapterList[chapterIndex]);
      chapterIndex++;
    }
    
    planDays.push({
      date: scheduleDates[dayIndex],
      assignments,
    });
  }

  return {
    planDays,
    summary: {
      totalChapters,
      readingDays,
      autoPace,
      projectedFinish: scheduleDates[scheduleDates.length - 1],
    },
  };
}

/**
 * Helper to check if a date is a Sunday
 */
export function isSunday(dateKey) {
  const date = new Date(dateKey + 'T00:00:00');
  return date.getDay() === 0;
}