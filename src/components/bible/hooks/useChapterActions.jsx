import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BIBLE_BOOKS } from '../bibleData';

export function useChapterActions(
  user,
  progressData,
  getProgressForBook,
  createProgressMutation,
  updateProgressMutation,
  updateBibleProgressChapter,
  checkAchievements
) {
  const queryClient = useQueryClient();

  const toggleChapter = async (bookName, chapterNum) => {
    const book = BIBLE_BOOKS.find(b => b.name === bookName);
    if (!book) {
      throw new Error("Book not found");
    }
    if (!user) {
      throw new Error("User not authenticated");
    }

    const bookIndexNum = Number(book.index);
    const now = new Date();
    const dateKey = now.toISOString().slice(0, 10);

    try {
      console.log('[toggleChapter] Writing ReadingLog:', { user_id: user.id, date: dateKey, book_index: bookIndexNum, chapter: chapterNum });
      
      await base44.entities.ReadingLog.create({
        user_id: user.id,
        date: dateKey,
        book_index: bookIndexNum,
        chapter: chapterNum
      });

      console.log('[toggleChapter] ReadingLog created, invalidating queries');

      await queryClient.invalidateQueries({ queryKey: ["readingLogsByBook", user.id, bookIndexNum] });
      await queryClient.invalidateQueries({ queryKey: ["readingLogs", user.id] });
      await queryClient.invalidateQueries({ queryKey: ["bookProgress", user.id] });

      console.log('[toggleChapter] Queries invalidated');

      setTimeout(() => checkAchievements(), 500);

      return { success: true };

    } catch (error) {
      console.error('[toggleChapter] Error:', error);
      toast.error(error?.message || 'Failed to save progress');
      throw error;
    }
  };

  const restartBook = async (bookName) => {
    const progress = getProgressForBook(bookName);
    if (progress) {
      // Only clear current_run_chapters to reset visual state
      // Keep chapter_read_counts (lifetime counts) to preserve history
      await updateProgressMutation.mutateAsync({
        id: progress.id,
        data: { 
          current_run_chapters: {},
          chapters_read: [],
          chapter_read_dates: {}
        }
      });
    }
  };

  return {
    toggleChapter,
    restartBook,
  };
}