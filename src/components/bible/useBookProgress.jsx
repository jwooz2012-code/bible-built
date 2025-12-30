import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BIBLE_BOOKS, ACHIEVEMENTS, TOTAL_CHAPTERS, OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from './bibleData';

export function useBookProgress() {
  const queryClient = useQueryClient();

  const { data: progressData = [], isLoading } = useQuery({
    queryKey: ['bookProgress'],
    queryFn: () => base44.entities.BookProgress.list(),
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => base44.entities.Achievement.list(),
  });

  const createProgressMutation = useMutation({
    mutationFn: (data) => base44.entities.BookProgress.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookProgress'] }),
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BookProgress.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookProgress'] }),
  });

  const unlockAchievementMutation = useMutation({
    mutationFn: (data) => base44.entities.Achievement.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['achievements'] }),
  });

  const getProgressForBook = (bookName) => {
    return progressData.find(p => p.book_name === bookName);
  };

  const calculateStats = () => {
    let totalChaptersRead = 0;
    let totalBooksCompleted = 0;
    let oldTestamentBooksComplete = 0;
    let newTestamentBooksComplete = 0;

    BIBLE_BOOKS.forEach(book => {
      const progress = getProgressForBook(book.name);
      if (progress) {
        totalChaptersRead += progress.chapters_read?.length || 0;
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
    
    const fullBibleComplete = Math.min(oldTestamentComplete, newTestamentComplete);

    return {
      totalChaptersRead,
      totalBooksCompleted,
      oldTestamentComplete,
      newTestamentComplete,
      fullBibleComplete,
      overallProgress: Math.round((totalChaptersRead / TOTAL_CHAPTERS) * 100),
    };
  };

  const toggleChapter = async (bookName, chapterNum) => {
    const book = BIBLE_BOOKS.find(b => b.name === bookName);
    if (!book) return;

    let progress = getProgressForBook(bookName);
    let chaptersRead = progress?.chapters_read || [];
    
    if (chaptersRead.includes(chapterNum)) {
      chaptersRead = chaptersRead.filter(c => c !== chapterNum);
    } else {
      chaptersRead = [...chaptersRead, chapterNum];
    }

    const isComplete = chaptersRead.length === book.chapters;
    
    if (progress) {
      const updateData = {
        chapters_read: chaptersRead,
        last_read_date: new Date().toISOString(),
      };
      
      // If completing the book, increment completion count and reset chapters
      if (isComplete) {
        updateData.completion_count = (progress.completion_count || 0) + 1;
        updateData.chapters_read = [];
      }
      
      await updateProgressMutation.mutateAsync({ id: progress.id, data: updateData });
    } else {
      const createData = {
        book_name: bookName,
        book_index: book.index,
        testament: book.testament,
        total_chapters: book.chapters,
        chapters_read: isComplete ? [] : chaptersRead,
        completion_count: isComplete ? 1 : 0,
        last_read_date: new Date().toISOString(),
      };
      await createProgressMutation.mutateAsync(createData);
    }

    // Check achievements after update
    setTimeout(() => checkAchievements(), 500);
  };

  const checkAchievements = async () => {
    const stats = calculateStats();
    const unlockedIds = achievements.map(a => a.achievement_id);

    for (const achievement of ACHIEVEMENTS) {
      if (!unlockedIds.includes(achievement.id)) {
        if (achievement.condition(stats, progressData)) {
          await unlockAchievementMutation.mutateAsync({
            achievement_id: achievement.id,
            unlocked_at: new Date().toISOString(),
          });
        }
      }
    }
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
    progressData,
    achievements,
    isLoading,
    getProgressForBook,
    calculateStats,
    toggleChapter,
    restartBook,
    checkAchievements,
  };
}