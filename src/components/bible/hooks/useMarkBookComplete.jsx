import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { BIBLE_BOOKS } from '../bibleData';

export function useMarkBookComplete(
  user,
  bibleProgress,
  getProgressForBook,
  createProgressMutation,
  updateProgressMutation,
  createBibleProgressMutation,
  updateBibleProgressMutation,
  checkAchievements
) {
  const queryClient = useQueryClient();
  const markBookComplete = async (bookName) => {
    const book = BIBLE_BOOKS.find(b => b.name === bookName);
    if (!book || !user) return;

    const bookIndex = Number(book?.book_index ?? book?.bookIndex ?? book?.index);
    let progress = getProgressForBook(bookName);
    
    const allChapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
    
    const now = new Date();
    const currentDate = now.toISOString();
    const localDate = now.toLocaleDateString('en-CA');
    const chapterReadDates = {};
    
    const readingLogEntries = allChapters.map(ch => ({
      user_id: user.id,
      occurred_at: currentDate,
      local_date: localDate,
      book_index: bookIndex,
      chapter: ch,
      event_id: `${user.id}_${bookIndex}_${ch}_${Date.now()}_${ch}`
    }));
    
    try {
      await base44.entities.ReadingLog.bulkCreate(readingLogEntries);
    } catch (logError) {
      console.error('Failed to create reading logs:', logError);
      throw logError;
    }
    
    allChapters.forEach(ch => {
      chapterReadDates[ch] = currentDate;
    });
    
    const chaptersMap = bibleProgress?.chapters_completed_in_current_bible_run || {};
    const bookKey = bookIndex.toString();
    const existingChapters = chaptersMap[bookKey] || [];
    
    const mergedChapters = [...new Set([...existingChapters, ...allChapters])];
    
    const updatedMap = {
      ...chaptersMap,
      [bookKey]: mergedChapters
    };
    
    let totalUniqueChapters = 0;
    Object.values(updatedMap).forEach(chapters => {
      if (Array.isArray(chapters)) {
        totalUniqueChapters += chapters.length;
      }
    });
    
    if (totalUniqueChapters >= 1189) {
      const newCompletionCount = (bibleProgress?.bible_completion_count || 0) + 1;
      
      if (bibleProgress) {
        await updateBibleProgressMutation.mutateAsync({
          id: bibleProgress.id,
          data: {
            bible_completion_count: newCompletionCount,
            chapters_completed_in_current_bible_run: {},
            last_completed_at: new Date().toISOString(),
          }
        });
      } else {
        await createBibleProgressMutation.mutateAsync({
          user_id: user.id,
          bible_completion_count: newCompletionCount,
          chapters_completed_in_current_bible_run: {},
          last_completed_at: new Date().toISOString(),
        });
      }
    } else {
      if (bibleProgress) {
        await updateBibleProgressMutation.mutateAsync({
          id: bibleProgress.id,
          data: { chapters_completed_in_current_bible_run: updatedMap }
        });
      } else {
        await createBibleProgressMutation.mutateAsync({
          user_id: user.id,
          bible_completion_count: 0,
          chapters_completed_in_current_bible_run: updatedMap,
        });
      }
    }
    
    const chapterReadCounts = {};
    allChapters.forEach(ch => {
      chapterReadCounts[ch] = ((progress?.chapter_read_counts || {})[ch] || 0) + 1;
    });

    const progressPayload = {
      chapters_read: allChapters,
      chapter_read_dates: chapterReadDates,
      chapter_read_counts: chapterReadCounts,
      completion_count: (progress?.completion_count || 0) + 1,
      last_read_date: currentDate,
    };

    let saved;
    if (progress) {
      saved = await base44.entities.BookProgress.update(progress.id, progressPayload);
    } else {
      saved = await base44.entities.BookProgress.create({
        user_id: user.id,
        book_name: bookName,
        book_index: bookIndex,
        testament: book.testament,
        total_chapters: book.chapters,
        ...progressPayload
      });
    }
    
    // Update book-specific cache for BookDetail
    queryClient.setQueryData(["bookProgress", user.id, bookIndex], saved);
    
    // Update global list cache for Stats/overview
    queryClient.setQueryData(["bookProgress"], (old = []) => {
      const list = Array.isArray(old) ? old : [];
      const idx = list.findIndex(p => p.id === saved.id);
      if (idx >= 0) return [...list.slice(0, idx), saved, ...list.slice(idx + 1)];
      return [...list, saved];
    });
    
    // Invalidate specific queries with userId
    queryClient.invalidateQueries({ queryKey: ['readingLogs', user.id] });
    queryClient.invalidateQueries({ queryKey: ['bibleProgress', user.id] });

    setTimeout(() => checkAchievements(), 500);
  };

  return { markBookComplete };
}