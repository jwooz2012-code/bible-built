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
    const key = ["bookProgress", user.id, bookIndexNum];
    console.log("toggleChapter bookIndex:", bookIndexNum);

    // 1) Check cache FIRST - this is authoritative after create/update
    const cached = queryClient.getQueryData(key);
    console.log("cache before", cached);
    
    let existing = cached && cached.id ? cached : null;

    // 2) Only if cache is empty, fetch from DB
    if (!existing) {
      const rows = await base44.entities.BookProgress.filter({
        user_id: user.id,
        book_index: bookIndexNum
      });
      
      // Try string fallback for legacy rows
      if (!rows || rows.length === 0) {
        const bookIndexStr = String(bookIndexNum);
        const legacyRows = await base44.entities.BookProgress.filter({
          user_id: user.id,
          book_index: bookIndexStr
        });
        existing = legacyRows?.[0] ?? null;
      } else {
        existing = rows?.[0] ?? null;
        
        // Delete duplicates if found
        if (rows.length > 1) {
          console.log("found duplicates, cleaning up", rows.length);
          for (let i = 1; i < rows.length; i++) {
            await base44.entities.BookProgress.delete(rows[i].id).catch(e => console.error("delete failed", e));
          }
        }
      }
    }

    const mergedCounts = { ...(existing?.chapter_read_counts || {}) };
    const mergedChaptersRead = [...(existing?.chapters_read || [])];
    const mergedDates = { ...(existing?.chapter_read_dates || {}) };
    const currentRunChapters = { ...(existing?.current_run_chapters || {}) };

    // 3) Build nextCounts starting from existing counts
    const chapterKey = String(chapterNum);
    const currentCount = mergedCounts[chapterKey] || 0;
    const newCount = currentCount + 1;
    const allChapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

    console.log("toggleChapter: chapter", chapterNum, "count:", currentCount, "->", newCount);
    console.log("saving via", existing?.id ? "update" : "create", { bookIndexNum, chapterNum });
    
    // Perform actual updates
    try {
      const now = new Date();
      const isoString = now.toISOString();
      const dateKey = now.toISOString().slice(0, 10); // YYYY-MM-DD

      // Update lifetime counts
      const nextCounts = { ...mergedCounts };
      nextCounts[chapterKey] = newCount;
      
      // Update current run state (visual fill)
      const nextCurrentRun = { ...currentRunChapters };
      nextCurrentRun[chapterKey] = true;
      
      const nextChaptersRead = mergedChaptersRead.includes(chapterNum) ? mergedChaptersRead : [...mergedChaptersRead, chapterNum];
      
      const nextDates = { ...mergedDates };
      nextDates[chapterKey] = isoString;

      // Calculate completion count based on current run
      const currentRunChaptersRead = Object.keys(nextCurrentRun).filter(k => nextCurrentRun[k]).length;
      let completionCount = existing?.completion_count || 0;
      if (currentRunChaptersRead === book.chapters) {
        completionCount += 1;
      }

      // 4) Save - normalize to numeric book_index going forward
      const progressPayload = {
        user_id: user.id,
        book_name: bookName,
        book_index: bookIndexNum,
        testament: book.testament,
        total_chapters: book.chapters,
        chapter_read_counts: nextCounts,
        current_run_chapters: nextCurrentRun,
        chapters_read: nextChaptersRead,
        chapter_read_dates: nextDates,
        completion_count: completionCount,
        last_read_date: isoString,
      };

      let savedRow;
      if (existing?.id) {
        savedRow = await base44.entities.BookProgress.update(existing.id, progressPayload);
        console.log("saved via update", { id: existing.id, chapterNum });
      } else {
        savedRow = await base44.entities.BookProgress.create(progressPayload);
        console.log("saved via create", { chapterNum });
      }
      console.log("savedRow", savedRow);

      // 5) Update cache IMMEDIATELY - this becomes authoritative for next click
      queryClient.setQueryData(key, savedRow);
      
      // Also update global list caches
      queryClient.setQueryData(["bookProgress"], (old = []) => {
        const list = Array.isArray(old) ? old : [];
        const idx = list.findIndex(p => p.id === savedRow.id);
        if (idx >= 0) return [...list.slice(0, idx), savedRow, ...list.slice(idx + 1)];
        return [...list, savedRow];
      });
      queryClient.setQueryData(["bookProgress", user.id], (old = []) => {
        const list = Array.isArray(old) ? old : [];
        const idx = list.findIndex(p => p.id === savedRow.id);
        if (idx >= 0) return [...list.slice(0, idx), savedRow, ...list.slice(idx + 1)];
        return [...list, savedRow];
      });
      
      console.log("SAVE OK", { bookIndexNum, key, savedRow });

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
        console.log("ReadingLog WRITE OK", { user_id: user.id, date: dateKey, bookIndexNum, chapterNum });
      } catch (logErr) {
        console.error("ReadingLog creation failed:", logErr);
        toast.error("Progress saved, but log failed");
      }

      // 5) Invalidate ReadingLog-driven queries with userId-specific keys
      const invalidateKeys = [
        ["readingLogs", user.id],
        ["stats", user.id],
        ["calendar", user.id],
        ["bibleProgress", user.id]
      ];
      console.log("Invalidating ReadingLog queries", invalidateKeys);
      
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      setTimeout(() => checkAchievements(), 500);

      return savedRow;

    } catch (error) {
      console.error('Error toggling chapter:', error);
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