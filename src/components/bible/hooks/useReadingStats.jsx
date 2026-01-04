import { TOTAL_CHAPTERS, OT_CHAPTERS, NT_CHAPTERS } from '@/components/bible/bibleData';

export function useReadingStats(logs = []) {
  // Get unique chapters only using Map to preserve all log properties
  const uniqueLogsMap = new Map();
  for (const log of logs) {
    if (!uniqueLogsMap.has(log.chapterId)) {
      uniqueLogsMap.set(log.chapterId, log);
    }
  }
  const uniqueLogs = Array.from(uniqueLogsMap.values());

  const otCount = uniqueLogs.filter(log => log.testament === 'OT').length;
  const ntCount = uniqueLogs.filter(log => log.testament === 'NT').length;
  const totalCount = uniqueLogs.length;

  const totalPercent = Math.round((totalCount / TOTAL_CHAPTERS) * 100);
  const otPercent = Math.round((otCount / OT_CHAPTERS) * 100);
  const ntPercent = Math.round((ntCount / NT_CHAPTERS) * 100);

  const timesThroughBible = Math.floor(totalCount / TOTAL_CHAPTERS);
  const progressToNext = totalCount % TOTAL_CHAPTERS;
  const percentToNext = Math.round((progressToNext / TOTAL_CHAPTERS) * 100);

  return {
    otCount,
    ntCount,
    totalCount,
    totalPercent,
    otPercent,
    ntPercent,
    timesThroughBible,
    progressToNext,
    percentToNext,
  };
}