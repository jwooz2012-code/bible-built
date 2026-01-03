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
    console.log("toggleChapter START", { bookName, chapterNum, userId: user?.id });

    const book = BIBLE_BOOKS.find(b => b.name === bookName);
    if (!book) {
      console.error("toggleChapter: book not found", bookName);
      throw new Error("Book not found");
    }
    if (!user) {
      console.error("toggleChapter: user not found");
      throw new Error("User not authenticated");
    }

    const bookIndex = Number(book.index);
    console.log("toggleChapter bookIndex:", bookIndex);

    let progress = getProgressForBook(bookName);
    console.log("toggleChapter: current progress:", progress);

    let chapterReadCounts = progress?.chapter_read_counts || {};
    let chaptersRead = progress?.chapters_read || [];
    let chapterReadDates = progress?.chapter_read_dates || {};

    const currentCount = chapterReadCounts[chapterNum] || 0;
    const newCount = currentCount + 1;
    const allChapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

    console.log("toggleChapter: chapter", chapterNum, "count:", currentCount, "->", newCount);
    
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

      // 1) Persist BookProgress (source of truth) using direct entity operations
      const progressPayload = {
        user_id: user.id,
        book_name: bookName,
        book_index: bookIndex,
        testament: book.testament,
        total_chapters: book.chapters,
        chapter_read_counts: chapterReadCounts,
        chapters_read: chaptersRead,
        chapter_read_dates: chapterReadDates,
        completion_count: completionCount,
        last_read_date: isoString,
      };

      let saved;
      try {
        if (progress) {
          console.log("toggleChapter: updating existing progress", progress.id);
          saved = await base44.entities.BookProgress.update(progress.id, progressPayload);
          console.log("toggleChapter: update successful", saved);
        } else {
          console.log("toggleChapter: creating new progress");
          saved = await base44.entities.BookProgress.create(progressPayload);
          console.log("toggleChapter: create successful", saved);
        }
      } catch (e) {
        console.error("Failed to save progress:", e);
        toast.error(e?.message || "Failed to save progress");
        queryClient.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === "bookProgress" });
        throw e;
      }

      // 2) Update book-specific cache for BookDetail
      queryClient.setQueryData(["bookProgress", user.id, bookIndex], saved);
      
      // 3) Update global list cache for Stats/overview
      queryClient.setQueryData(["bookProgress"], (old = []) => {
        const list = Array.isArray(old) ? old : [];
        const idx = list.findIndex(p => p.id === saved.id);
        if (idx >= 0) return [...list.slice(0, idx), saved, ...list.slice(idx + 1)];
        return [...list, saved];
      });
      
      console.log("SAVE OK", { bookIndex, key: ["bookProgress", user.id, bookIndex], savedRow: saved });

      // 4) Create ReadingLog for calendar/stats
      try {
        await base44.entities.ReadingLog.create({
          user_id: user.id,
          occurred_at: isoString,
          local_date: localDate,
          book_index: bookIndex,
          chapter: chapterNum,
          event_id: `${user.id}_${bookIndex}_${chapterNum}_${Date.now()}`
        });
        console.log("ReadingLog saved", { userId: user.id, date: localDate, bookIndex, chapterNum });
      } catch (logErr) {
        console.error("ReadingLog creation failed:", logErr);
        toast.error("Progress saved, but log failed");
      }

      // 5) Invalidate specific queries with userId
      queryClient.invalidateQueries({ queryKey: ["readingLogs", user.id] });
      queryClient.invalidateQueries({ queryKey: ["bibleProgress", user.id] });

      setTimeout(() => checkAchievements(), 500);

      return saved;

      } catch (error) {
      console.error('Error toggling chapter:', error);
      toast.error(error?.message || 'Failed to save progress');
      queryClient.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === 'readingLogs' });
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