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

    const bookIndexNum = Number(book.index);
    const bookIndexStr = String(bookIndexNum);
    console.log("toggleChapter bookIndex:", bookIndexNum);

    // 1) Fetch rows by numeric index first
    let rows = await base44.entities.BookProgress.filter({
      user_id: user.id,
      book_index: bookIndexNum
    });

    // 2) If none, fetch rows by string index (legacy rows)
    if (!rows || rows.length === 0) {
      rows = await base44.entities.BookProgress.filter({
        user_id: user.id,
        book_index: bookIndexStr
      });
    }

    console.log("book_index lookup", { incoming: book.index, bookIndexNum, bookIndexStr, rowsLen: rows?.length });

    // 3) If multiple rows exist, merge them (caused by earlier bug)
    const primary = rows?.[0] ?? null;
    let mergedCounts = {};
    let mergedChaptersRead = [];
    let mergedDates = {};
    
    if (rows && rows.length > 1) {
      console.log("merging duplicate rows", rows.length);
      rows.forEach(row => {
        Object.entries(row.chapter_read_counts || {}).forEach(([ch, count]) => {
          mergedCounts[ch] = Math.max(mergedCounts[ch] || 0, count);
        });
        mergedChaptersRead = [...new Set([...mergedChaptersRead, ...(row.chapters_read || [])])];
        Object.assign(mergedDates, row.chapter_read_dates || {});
      });
    } else if (primary) {
      mergedCounts = { ...(primary.chapter_read_counts || {}) };
      mergedChaptersRead = [...(primary.chapters_read || [])];
      mergedDates = { ...(primary.chapter_read_dates || {}) };
    }

    console.log("existingRows len", rows?.length, rows?.[0]);

    // 4) Build nextCounts starting from existing counts
    const key = String(chapterNum);
    const currentCount = mergedCounts[key] || 0;
    const newCount = currentCount + 1;
    const allChapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

    console.log("toggleChapter: chapter", chapterNum, "count:", currentCount, "->", newCount);
    console.log("saving via", primary?.id ? "update" : "create", { chapterNum });
    
    // Perform actual updates
    try {
      const now = new Date();
      const isoString = now.toISOString();
      const dateKey = now.toISOString().slice(0, 10); // YYYY-MM-DD

      // Update the specific chapter count (merge, don't replace)
      const nextCounts = { ...mergedCounts };
      nextCounts[key] = newCount;
      
      const nextChaptersRead = mergedChaptersRead.includes(chapterNum) ? mergedChaptersRead : [...mergedChaptersRead, chapterNum];
      
      const nextDates = { ...mergedDates };
      nextDates[key] = isoString;

      // Calculate completion count (how many full read-throughs)
      const completionCount = Math.min(...allChapters.map(ch => nextCounts[ch] || 0));

      // 5) Save - normalize to numeric book_index going forward
      const progressPayload = {
        user_id: user.id,
        book_name: bookName,
        book_index: bookIndexNum,
        testament: book.testament,
        total_chapters: book.chapters,
        chapter_read_counts: nextCounts,
        chapters_read: nextChaptersRead,
        chapter_read_dates: nextDates,
        completion_count: completionCount,
        last_read_date: isoString,
      };

      let saved;
      if (primary?.id) {
        saved = await base44.entities.BookProgress.update(primary.id, progressPayload);
        console.log("saved via update", { id: primary.id, chapterNum });
        
        // Delete duplicate rows if any
        if (rows.length > 1) {
          for (let i = 1; i < rows.length; i++) {
            await base44.entities.BookProgress.delete(rows[i].id);
            console.log("deleted duplicate row", rows[i].id);
          }
        }
      } else {
        saved = await base44.entities.BookProgress.create(progressPayload);
        console.log("saved via create", { chapterNum });
      }
      console.log("savedRow", saved);

      // 6) Update book-specific cache for BookDetail
      queryClient.setQueryData(["bookProgress", user.id, bookIndexNum], saved);
      
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
      
      console.log("SAVE OK", { bookIndexNum, key: ["bookProgress", user.id, bookIndexNum], savedRow: saved });

      // 4) Create ReadingLog for calendar/stats
      try {
        await base44.entities.ReadingLog.create({
          user_id: user.id,
          occurred_at: isoString,
          local_date: dateKey,
          book_index: bookIndexNum,
          chapter: chapterNum,
          event_id: `${user.id}_${bookIndexNum}_${chapterNum}_${Date.now()}`
        });
        console.log("ReadingLog saved", { userId: user.id, date: dateKey, bookIndexNum, chapterNum });
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