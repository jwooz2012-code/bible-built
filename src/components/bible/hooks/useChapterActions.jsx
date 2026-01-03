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
    const key = ["bookProgress", user.id, bookIndexNum];

    // 1) Check cache FIRST - this is authoritative after create/update
    const cached = queryClient.getQueryData(key);
    
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
          for (let i = 1; i < rows.length; i++) {
            await base44.entities.BookProgress.delete(rows[i].id).catch(() => {});
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
      } else {
        savedRow = await base44.entities.BookProgress.create(progressPayload);
      }

      // 5) Update cache IMMEDIATELY - this becomes authoritative for next click
      queryClient.setQueryData(key, savedRow);
      
      // Update global list cache
      queryClient.setQueryData(["bookProgress", user.id], (old = []) => {
        const list = Array.isArray(old) ? old : [];
        const idx = list.findIndex(p => p.id === savedRow.id);
        if (idx >= 0) return [...list.slice(0, idx), savedRow, ...list.slice(idx + 1)];
        return [...list, savedRow];
      });

      // 4) Create ReadingLog for calendar/stats
      try {
        await base44.entities.ReadingLog.create({
          user_id: user.id,
          date: dateKey,
          book_index: bookIndexNum,
          chapter: chapterNum
        });
      } catch (logErr) {
        toast.error("Progress saved, but log failed");
      }

      // 5) Invalidate queries with userId-specific keys
      queryClient.invalidateQueries({ queryKey: ["readingLogsByBook", user.id, bookIndexNum] });
      queryClient.invalidateQueries({ queryKey: ["readingLogs", user.id] });
      queryClient.invalidateQueries({ queryKey: ["bookProgress", user.id] });
      queryClient.invalidateQueries({ queryKey: ["bibleProgress", user.id] });

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