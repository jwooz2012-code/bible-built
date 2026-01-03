import { TOTAL_CHAPTERS, OT_CHAPTERS, NT_CHAPTERS } from '@/components/bible/bibleData';

export function useReadingStats(logs = []) {
  const otCount = logs.filter(log => log.testament === 'OT').length;
  const ntCount = logs.filter(log => log.testament === 'NT').length;
  const totalCount = logs.length;

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