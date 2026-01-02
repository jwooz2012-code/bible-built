import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { BIBLE_BOOKS } from '../bibleData';

export function useChapterActions(
  user,
  progressData,
  getProgressForBook,
  createProgressMutation,
  updateProgressMutation,
  checkAchievements
) {
  const queryClient = useQueryClient();

  const toggleChapter = async (bookName, chapterNum) => {
    const currentUser = await base44.auth.me();
    if (!currentUser) return;

    const book = BIBLE_BOOKS.find(b => b.name === bookName);
    if (!book) return;

    const progress = getProgressForBook(bookName);
    const chapterReadCounts = progress?.chapter_read_counts || {};
    const chaptersRead = progress?.chapters_read || [];
    const chapterReadDates = progress?.chapter_read_dates || {};
    
    const newCount = (chapterReadCounts[chapterNum] || 0) + 1;
    const allChapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
    
    const now = new Date();
    const isoString = now.toISOString();
    const localDate = now.toLocaleDateString('en-CA');
    
    // Create reading log entry
    await base44.entities.ReadingLog.create({
      user_id: currentUser.id,
      occurred_at: isoString,
      local_date: localDate,
      book_index: book.index,
      chapter: chapterNum,
      event_id: `${currentUser.id}_${book.index}_${chapterNum}_${Date.now()}`
    });
    
    // Update progress data
    const updatedCounts = { ...chapterReadCounts, [chapterNum]: newCount };
    const updatedChaptersRead = chaptersRead.includes(chapterNum) 
      ? chaptersRead 
      : [...chaptersRead, chapterNum];
    const updatedDates = { ...chapterReadDates, [chapterNum]: isoString };
    const completionCount = Math.min(...allChapters.map(ch => updatedCounts[ch] || 0));
    
    if (progress?.id) {
      await updateProgressMutation.mutateAsync({
        id: progress.id,
        data: {
          chapter_read_counts: updatedCounts,
          chapters_read: updatedChaptersRead,
          chapter_read_dates: updatedDates,
          completion_count: completionCount,
          last_read_date: isoString,
        }
      });
    } else {
      await createProgressMutation.mutateAsync({
        user_id: currentUser.id,
        book_name: bookName,
        book_index: book.index,
        testament: book.testament,
        total_chapters: book.chapters,
        chapter_read_counts: updatedCounts,
        chapters_read: updatedChaptersRead,
        chapter_read_dates: updatedDates,
        completion_count: completionCount,
        last_read_date: isoString,
      });
    }
    
    // Refresh all data across views
    queryClient.invalidateQueries({ queryKey: ['bookProgress', currentUser.id] });
    queryClient.invalidateQueries({ queryKey: ['readingLogs', currentUser.id] });
    
    setTimeout(() => checkAchievements(), 500);
  };

  const restartBook = async (bookName) => {
    // Start Over only resets visual state (chapters_read)
    // Keeps all read counts intact
    const progress = getProgressForBook(bookName);
    if (progress && progress.id) {
      await updateProgressMutation.mutateAsync({
        id: progress.id,
        data: { 
          chapters_read: []
        }
      });
    }
  };

  return {
    toggleChapter,
    restartBook,
  };
}