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
    const now = new Date();
    const isoString = now.toISOString();
    const localDate = now.toLocaleDateString('en-CA');
    
    chapterReadCounts = { ...chapterReadCounts, [chapterNum]: newCount };
    if (!chaptersRead.includes(chapterNum)) {
      chaptersRead = [...chaptersRead, chapterNum];
    }
    chapterReadDates = { ...chapterReadDates, [chapterNum]: isoString };
    
    base44.entities.ReadingLog.create({
      user_id: user.id,
      occurred_at: isoString,
      local_date: localDate,
      book_index: book.index,
      chapter: chapterNum,
      event_id: `${user.id}_${book.index}_${chapterNum}_${Date.now()}`
    });
    
    // Calculate completion count
    const completionCount = Math.min(...allChapters.map(ch => chapterReadCounts[ch] || 0));
    
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

    setTimeout(() => checkAchievements(), 500);
  };

  const restartBook = async (bookName) => {
    const progress = getProgressForBook(bookName);
    if (progress) {
      // Clear chapter_read_counts to reset visual progress, but keep completion_count
      await updateProgressMutation.mutateAsync({
        id: progress.id,
        data: { 
          chapters_read: [],
          chapter_read_dates: {},
          chapter_read_counts: {},
          completion_count: progress.completion_count // Preserve completion count
        }
      });
    }
  };

  return {
    toggleChapter,
    restartBook,
  };
}