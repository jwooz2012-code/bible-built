import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
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
      console.log('🔵 Attempting to create ReadingLog entry for:', { bookName, chapterNum, userId: user.id });
      const now = new Date();
      const isoString = now.toISOString();
      const localDate = now.toLocaleDateString('en-CA');
      
      chapterReadCounts = { ...chapterReadCounts, [chapterNum]: newCount };
      if (!chaptersRead.includes(chapterNum)) {
        chaptersRead = [...chaptersRead, chapterNum];
      }
      chapterReadDates = { ...chapterReadDates, [chapterNum]: isoString };
      
      // Create reading log entry with proper error handling
      try {
        console.log('🟡 About to call base44.entities.ReadingLog.create with:', {
          user_id: user.id,
          occurred_at: isoString,
          local_date: localDate,
          book_index: book.index,
          chapter: chapterNum,
          event_id: `${user.id}_${book.index}_${chapterNum}_${Date.now()}`
        });
        const logEntry = await base44.entities.ReadingLog.create({
          user_id: user.id,
          occurred_at: isoString,
          local_date: localDate,
          book_index: book.index,
          chapter: chapterNum,
          event_id: `${user.id}_${book.index}_${chapterNum}_${Date.now()}`
        });
        console.log('✅ ReadingLog created successfully:', logEntry);
      } catch (logError) {
        console.error('❌ Failed to create ReadingLog:', logError);
        console.error('❌ ReadingLog creation error details:', logError.message, logError.stack);
        throw logError;
      }
      
      // Calculate completion count
      const completionCount = Math.min(...allChapters.map(ch => chapterReadCounts[ch] || 0));
      
      // Update book progress
      if (progress) {
        const updateData = {
          chapter_read_counts: chapterReadCounts,
          chapters_read: chaptersRead,
          chapter_read_dates: chapterReadDates,
          completion_count: completionCount,
          last_read_date: new Date().toISOString(),
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
          last_read_date: new Date().toISOString(),
        };
        await createProgressMutation.mutateAsync(createData);
      }

      await updateBibleProgressChapter(book.index, chapterNum);
      
      // Force refetch of all data
      queryClient.invalidateQueries({ queryKey: ['readingLogs'] });
      queryClient.invalidateQueries({ queryKey: ['bookProgress'] });
      queryClient.invalidateQueries({ queryKey: ['bibleProgress'] });

      setTimeout(() => checkAchievements(), 500);
    } catch (error) {
      console.error('❌ Error toggling chapter (outer catch):', error);
      console.error('❌ Full error object:', error);
      // Revert optimistic update on error
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