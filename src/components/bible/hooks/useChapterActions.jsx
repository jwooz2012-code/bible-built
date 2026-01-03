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
    if (!book || !user) return;

    let progress = getProgressForBook(bookName);
    let chapterReadCounts = progress?.chapter_read_counts || {};
    let chaptersRead = progress?.chapters_read || [];
    let chapterReadDates = progress?.chapter_read_dates || {};
    
    const currentCount = chapterReadCounts[chapterNum] || 0;
    const newCount = currentCount + 1;
    const allChapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
    
    // Optimistic update
    const optimisticCounts = { ...chapterReadCounts, [chapterNum]: newCount };
    const optimisticChaptersRead = chaptersRead.includes(chapterNum) ? chaptersRead : [...chaptersRead, chapterNum];
    const optimisticDates = { ...chapterReadDates, [chapterNum]: new Date().toISOString() };
    
    // Calculate completion count based on minimum reads across all chapters
    const minReadCount = Math.min(...allChapters.map(ch => optimisticCounts[ch] || 0));
    const newCompletionCount = minReadCount;
    
    const optimisticProgress = progress ? {
      ...progress,
      chapter_read_counts: optimisticCounts,
      chapters_read: optimisticChaptersRead,
      chapter_read_dates: optimisticDates,
      completion_count: newCompletionCount,
      last_read_date: new Date().toISOString(),
    } : {
      user_id: user.id,
      book_name: bookName,
      book_index: book.index,
      testament: book.testament,
      total_chapters: book.chapters,
      chapter_read_counts: optimisticCounts,
      chapters_read: optimisticChaptersRead,
      chapter_read_dates: optimisticDates,
      completion_count: newCompletionCount,
      last_read_date: new Date().toISOString(),
    };
    
    // Update cache optimistically
    queryClient.setQueryData(['bookProgress'], (old = []) => {
      if (progress) {
        return old.map(p => p.id === progress.id ? optimisticProgress : p);
      } else {
        return [...old, optimisticProgress];
      }
    });
    
    // Perform actual updates
    try {
      const now = new Date();
      const isoString = now.toISOString();
      const localDate = now.toLocaleDateString('en-CA');

      // Update local variables for final persisted payload
      chapterReadCounts = { ...chapterReadCounts, [chapterNum]: newCount };
      if (!chaptersRead.includes(chapterNum)) {
        chaptersRead = [...chaptersRead, chapterNum];
      }
      chapterReadDates = { ...chapterReadDates, [chapterNum]: isoString };

      // Calculate completion count (how many full read-throughs)
      const completionCount = Math.min(...allChapters.map(ch => chapterReadCounts[ch] || 0));

      // 1) Persist BookProgress (source of truth)
      if (progress) {
        const updateData = {
          // include user_id to satisfy any RLS policies if required
          user_id: user.id,
          chapter_read_counts: chapterReadCounts,
          chapters_read: chaptersRead,
          chapter_read_dates: chapterReadDates,
          completion_count: completionCount,
          last_read_date: isoString,
        };
        await updateProgressMutation.mutateAsync({ id: progress.id, data: updateData });
      } else {
        const createData = {
          user_id: user.id,
          book_name: bookName,
          book_index: book.index,
          testament: book.testament,
          total_chapters: book.chapters,
          chapter_read_counts: chapterReadCounts,
          chapters_read: chaptersRead,
          chapter_read_dates: chapterReadDates,
          completion_count: completionCount,
          last_read_date: isoString,
        };
        await createProgressMutation.mutateAsync(createData);
      }

      // 2) Create ReadingLog (best effort – never undo progress if this fails)
      try {
        await base44.entities.ReadingLog.create({
          user_id: user.id,
          occurred_at: isoString,
          local_date: localDate,
          book_index: book.index,
          chapter: chapterNum,
          event_id: `${user.id}_${book.index}_${chapterNum}_${Date.now()}`
        });
      } catch (logError) {
        console.error('⚠️ ReadingLog create failed (non-fatal):', logError);
        toast.error('Saved progress, but log failed to write.');
        // continue, do not throw
      }

      // Refresh views
      queryClient.invalidateQueries({ queryKey: ['readingLogs'] });
      queryClient.invalidateQueries({ queryKey: ['bookProgress'] });
      queryClient.invalidateQueries({ queryKey: ['bibleProgress'] });

      setTimeout(() => checkAchievements(), 500);

    } catch (error) {
      console.error('❌ Error toggling chapter (fatal):', error);
      toast.error(error?.message || 'Failed to save progress.');
      // Revert optimistic update on fatal error
      queryClient.invalidateQueries({ queryKey: ['bookProgress'] });
      queryClient.invalidateQueries({ queryKey: ['readingLogs'] });
      throw error;
    }
  };

  const restartBook = async (bookName) => {
    const progress = getProgressForBook(bookName);
    if (progress) {
      // Only clear chapters_read and chapter_read_dates to reset visual color
      // Keep chapter_read_counts and completion_count to preserve history
      await updateProgressMutation.mutateAsync({
        id: progress.id,
        data: { 
          chapters_read: [],
          chapter_read_dates: {},
          completion_count: progress.completion_count,
          chapter_read_counts: progress.chapter_read_counts
        }
      });
    }
  };

  return {
    toggleChapter,
    restartBook,
  };
}