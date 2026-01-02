import { base44 } from '@/api/base44Client';
import { BIBLE_BOOKS } from '../bibleData';

export function useMarkBookComplete(
  user,
  getProgressForBook,
  createProgressMutation,
  updateProgressMutation,
  checkAchievements
) {
  const markBookComplete = async (bookName) => {
    // Fetch fresh user data at mutation time
    const currentUser = await base44.auth.me();
    if (!currentUser) return;

    const book = BIBLE_BOOKS.find(b => b.name === bookName);
    if (!book) return;

    let progress = getProgressForBook(bookName);
    
    const allChapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
    
    const now = new Date();
    const currentDate = now.toISOString();
    const localDate = now.toLocaleDateString('en-CA');
    const chapterReadDates = {};
    
    const readingLogEntries = allChapters.map(ch => ({
      user_id: currentUser.id,
      occurred_at: currentDate,
      local_date: localDate,
      book_index: book.index,
      chapter: ch,
      event_id: `${currentUser.id}_${book.index}_${ch}_${Date.now()}_${ch}`
    }));
    
    await base44.entities.ReadingLog.bulkCreate(readingLogEntries);
    
    allChapters.forEach(ch => {
      chapterReadDates[ch] = currentDate;
    });
    
    const chapterReadCounts = {};
    allChapters.forEach(ch => {
      chapterReadCounts[ch] = ((progress?.chapter_read_counts || {})[ch] || 0) + 1;
    });

    if (progress) {
      await updateProgressMutation.mutateAsync({
        id: progress.id,
        data: {
          chapters_read: allChapters,
          chapter_read_dates: chapterReadDates,
          chapter_read_counts: chapterReadCounts,
          completion_count: (progress.completion_count || 0) + 1,
          last_read_date: currentDate,
        }
      });
    } else {
      await createProgressMutation.mutateAsync({
        user_id: currentUser.id,
        book_name: bookName,
        book_index: book.index,
        testament: book.testament,
        total_chapters: book.chapters,
        chapters_read: allChapters,
        chapter_read_dates: chapterReadDates,
        chapter_read_counts: chapterReadCounts,
        completion_count: 1,
        last_read_date: currentDate,
      });
    }

    setTimeout(() => checkAchievements(), 500);
  };

  return { markBookComplete };
}