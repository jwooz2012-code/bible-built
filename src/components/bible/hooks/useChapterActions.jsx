import { base44 } from '@/api/base44Client';
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
  const toggleChapter = async (bookName, chapterNum) => {
    const book = BIBLE_BOOKS.find(b => b.name === bookName);
    if (!book || !user) return;

    let progress = getProgressForBook(bookName);
    let chaptersRead = progress?.chapters_read || [];
    let chapterReadDates = progress?.chapter_read_dates || {};
    
    const isAdding = !chaptersRead.includes(chapterNum);
    
    if (isAdding) {
      chaptersRead = [...chaptersRead, chapterNum];
      const now = new Date();
      const isoString = now.toISOString();
      const localDate = now.toLocaleDateString('en-CA');
      
      chapterReadDates = {
        ...chapterReadDates,
        [chapterNum]: isoString
      };
      
      await base44.entities.ReadingLog.create({
        user_id: user.id,
        occurred_at: isoString,
        local_date: localDate,
        book_index: book.index,
        chapter: chapterNum,
        event_id: `${user.id}_${book.index}_${chapterNum}_${Date.now()}`
      });
    } else {
      chaptersRead = chaptersRead.filter(c => c !== chapterNum);
      const newDates = { ...chapterReadDates };
      delete newDates[chapterNum];
      chapterReadDates = newDates;
    }

    const isComplete = chaptersRead.length === book.chapters;
    
    if (progress) {
      const updateData = {
        chapters_read: chaptersRead,
        chapter_read_dates: chapterReadDates,
        last_read_date: new Date().toISOString(),
      };
      
      if (isComplete) {
        updateData.completion_count = (progress.completion_count || 0) + 1;
      }
      
      await updateProgressMutation.mutateAsync({ id: progress.id, data: updateData });
    } else {
      const createData = {
        user_id: user.id,
        book_name: bookName,
        book_index: book.index,
        testament: book.testament,
        total_chapters: book.chapters,
        chapters_read: chaptersRead,
        chapter_read_dates: chapterReadDates,
        completion_count: isComplete ? 1 : 0,
        last_read_date: new Date().toISOString(),
      };
      await createProgressMutation.mutateAsync(createData);
    }

    if (isAdding) {
      await updateBibleProgressChapter(book.index, chapterNum);
    }

    setTimeout(() => checkAchievements(), 500);
  };

  const restartBook = async (bookName) => {
    const progress = getProgressForBook(bookName);
    if (progress) {
      await updateProgressMutation.mutateAsync({
        id: progress.id,
        data: { chapters_read: [] }
      });
    }
  };

  return {
    toggleChapter,
    restartBook,
  };
}