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

    // Fetch fresh progress from database to ensure we have valid ID
    const existing = (await base44.entities.BookProgress.filter({ 
      user_id: user.id, 
      book_index: bookIndex 
    }))?.[0] ?? null;
    console.log("existing progress", existing);

    let chapterReadCounts = existing?.chapter_read_counts || {};
    let chaptersRead = existing?.chapters_read || [];
    let chapterReadDates = existing?.chapter_read_dates || {};

    const currentCount = chapterReadCounts[chapterNum] || 0;
    const newCount = currentCount + 1;
    const allChapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

    console.log("toggleChapter: chapter", chapterNum, "count:", currentCount, "->", newCount);
    
    // Perform actual updates
    try {
      const now = new Date();
      const isoString = now.toISOString();
      const dateKey = now.toISOString().slice(0, 10); // YYYY-MM-DD

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
      if (existing?.id) {
        console.log("saving progress via update", { bookIndex, chapterNum, id: existing.id });
        saved = await base44.entities.BookProgress.update(existing.id, progressPayload);
      } else {
        console.log("saving progress via create", { bookIndex, chapterNum });
        saved = await base44.entities.BookProgress.create(progressPayload);
      }
      console.log("savedRow", saved);

      // 2) Update book-specific cache for BookDetail
      queryClient.setQueryData(["bookProgress", user.id, bookIndex], saved);
      
      // 3) Update global list cache for Stats/overview
      queryClient.setQueryData(["bookProgress"], (old = []) => {
        const list = Array.isArray(old) ? old : [];
        const idx = list.findIndex(p => p.id === saved.id);
        if (idx >= 0) return [...list.slice(0, idx), saved, ...list.slice(idx + 1)];
        return [...list, saved];
      });
      queryClient.setQueryData(["bookProgress", user.id], (old = []) => {
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
          local_date: dateKey,
          book_index: bookIndex,
          chapter: chapterNum,
          event_id: `${user.id}_${bookIndex}_${chapterNum}_${Date.now()}`
        });
        console.log("ReadingLog saved", { userId: user.id, date: dateKey, bookIndex, chapterNum });
      } catch (logErr) {
        console.error("ReadingLog creation failed:", logErr);
        toast.error("Progress saved, but log failed");
      }

      // 5) Invalidate specific queries with userId
      queryClient.invalidateQueries({ queryKey: ["readingLogs", user.id] });
      queryClient.invalidateQueries({ queryKey: ["stats", user.id] });
      queryClient.invalidateQueries({ queryKey: ["calendar", user.id] });
      queryClient.invalidateQueries({ queryKey: ["bibleProgress", user.id] });

      setTimeout(() => checkAchievements(), 500);

      return saved;

    } catch (error) {
      console.error('Error toggling chapter:', error);
      toast.error(error?.message || 'Failed to save progress');
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