import { BIBLE_BOOKS, TOTAL_CHAPTERS, OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from '../bibleData';

export function useProgressStats(progressData, bibleProgress) {
  const getProgressForBook = (bookName) => {
    return progressData.find(p => p.book_name === bookName);
  };

  const calculateStats = () => {
    let totalBooksCompleted = 0;
    let oldTestamentBooksComplete = 0;
    let newTestamentBooksComplete = 0;
    let totalChaptersRead = 0;
    let oldTestamentChaptersRead = 0;
    let newTestamentChaptersRead = 0;

    BIBLE_BOOKS.forEach(book => {
      const progress = getProgressForBook(book.name);
      if (progress) {
        totalBooksCompleted += progress.completion_count || 0;
        
        if (progress.completion_count > 0) {
          if (book.testament === 'old') oldTestamentBooksComplete++;
          else newTestamentBooksComplete++;
        }

        // Count unique chapters read from BookProgress
        const chaptersRead = progress.chapters_read || [];
        totalChaptersRead += chaptersRead.length;
        
        if (book.testament === 'old') {
          oldTestamentChaptersRead += chaptersRead.length;
        } else if (book.testament === 'new') {
          newTestamentChaptersRead += chaptersRead.length;
        }
      }
    });

    const oldTestamentComplete = oldTestamentBooksComplete >= OLD_TESTAMENT_BOOKS ? 
      Math.floor(oldTestamentBooksComplete / OLD_TESTAMENT_BOOKS) : 0;
    const newTestamentComplete = newTestamentBooksComplete >= NEW_TESTAMENT_BOOKS ?
      Math.floor(newTestamentBooksComplete / NEW_TESTAMENT_BOOKS) : 0;

    const oldTestamentTotalChapters = BIBLE_BOOKS.filter(b => b.testament === 'old').reduce((sum, b) => sum + b.chapters, 0);
    const newTestamentTotalChapters = BIBLE_BOOKS.filter(b => b.testament === 'new').reduce((sum, b) => sum + b.chapters, 0);

    return {
      totalChaptersRead,
      totalBooksCompleted,
      oldTestamentComplete,
      newTestamentComplete,
      overallProgress: Math.round((totalChaptersRead / TOTAL_CHAPTERS) * 100),
      oldTestamentChaptersRead,
      newTestamentChaptersRead,
      oldTestamentTotalChapters,
      newTestamentTotalChapters,
    };
  };

  return {
    getProgressForBook,
    calculateStats,
  };
}