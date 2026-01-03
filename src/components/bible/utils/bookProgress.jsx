export function calculateBookProgress(logs, totalChapters) {
  if (!logs || logs.length === 0) {
    return { timesThrough: 0, currentCycleProgress: 0, currentCycleChapters: new Set() };
  }

  const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  let currentCycleSet = new Set();
  let timesThrough = 0;

  for (const log of sortedLogs) {
    currentCycleSet.add(log.chapter);
    
    if (currentCycleSet.size === totalChapters) {
      timesThrough++;
      currentCycleSet = new Set();
    }
  }

  return {
    timesThrough,
    currentCycleProgress: currentCycleSet.size,
    currentCycleChapters: currentCycleSet,
  };
}