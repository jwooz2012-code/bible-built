import { BIBLE_BOOKS, TOTAL_CHAPTERS, OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from '../bibleData';

export function useProgressStats(progressData, bibleProgress) {
  const getProgressForBook = (bookName) => {
    return progressData.find(p => p.book_name === bookName);
  };

  const calculateStats = () => {
    let totalBooksCompleted = 0;
    let oldTestamentBooksComplete = 0;
    let newTestamentBooksComplete = 0;

    BIBLE_BOOKS.forEach(book => {
      const progress = getProgressForBook(book.name);
      if (progress) {
        totalBooksCompleted += progress.completion_count || 0;
        
        if (progress.completion_count > 0) {
          if (book.testament === 'old') oldTestamentBooksComplete++;
          else newTestamentBooksComplete++;
        }
      }
    });

    const oldTestamentComplete = oldTestamentBooksComplete >= OLD_TESTAMENT_BOOKS ? 
      Math.floor(oldTestamentBooksComplete / OLD_TESTAMENT_BOOKS) : 0;
    const newTestamentComplete = newTestamentBooksComplete >= NEW_TESTAMENT_BOOKS ?
      Math.floor(newTestamentBooksComplete / NEW_TESTAMENT_BOOKS) : 0;
    
    const fullBibleComplete = bibleProgress?.bible_completion_count || 0;

    const chaptersMap = bibleProgress?.chapters_completed_in_current_bible_run || {};
    let totalChaptersRead = 0;
    Object.values(chaptersMap).forEach(chapters => {
      if (Array.isArray(chapters)) {
        totalChaptersRead += chapters.length;
      }
    });

    return {
      totalChaptersRead,
      totalBooksCompleted,
      oldTestamentComplete,
      newTestamentComplete,
      fullBibleComplete,
      overallProgress: Math.round((totalChaptersRead / TOTAL_CHAPTERS) * 100),
    };
  };

  return {
    getProgressForBook,
    calculateStats,
  };
}