import { TOTAL_CHAPTERS, OT_CHAPTERS, NT_CHAPTERS } from '@/components/bible/bibleData';

export function useReadingStats(logs = []) {
  // Get unique chapters only
  const uniqueChapterIds = new Set(logs.map(log => log.chapterId));
  const uniqueLogs = Array.from(uniqueChapterIds).map(chapterId => 
    logs.find(log => log.chapterId === chapterId)
  );

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