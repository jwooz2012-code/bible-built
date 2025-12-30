import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BIBLE_BOOKS, ACHIEVEMENTS, TOTAL_CHAPTERS, OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from './bibleData';

export function useBookProgress() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: progressData = [], isLoading } = useQuery({
    queryKey: ['bookProgress'],
    queryFn: () => base44.entities.BookProgress.list(),
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => base44.entities.Achievement.list(),
  });

  const { data: bibleProgress } = useQuery({
    queryKey: ['bibleProgress'],
    queryFn: async () => {
      const results = await base44.entities.BibleProgress.list();
      return results[0] || null;
    },
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

  const createBibleProgressMutation = useMutation({
    mutationFn: (data) => base44.entities.BibleProgress.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bibleProgress'] }),
  });

  const updateBibleProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BibleProgress.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bibleProgress'] }),
  });

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

    // Calculate unique chapters from BibleProgress
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

  const toggleChapter = async (bookName, chapterNum) => {
    const book = BIBLE_BOOKS.find(b => b.name === bookName);
    if (!book || !user) return;

    let progress = getProgressForBook(bookName);
    let chaptersRead = progress?.chapters_read || [];
    
    const isAdding = !chaptersRead.includes(chapterNum);
    
    if (isAdding) {
      chaptersRead = [...chaptersRead, chapterNum];
    } else {
      chaptersRead = chaptersRead.filter(c => c !== chapterNum);
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
        user_id: user.id,
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

    // Update BibleProgress with chapter tracking
    if (isAdding) {
      await updateBibleProgressChapter(book.index, chapterNum);
    }

    // Check achievements after update
    setTimeout(() => checkAchievements(), 500);
  };

  const updateBibleProgressChapter = async (bookIndex, chapterNum) => {
    if (!user) return;

    const chaptersMap = bibleProgress?.chapters_completed_in_current_bible_run || {};
    const bookKey = bookIndex.toString();
    const bookChapters = chaptersMap[bookKey] || [];
    
    // Add chapter if not already present
    if (!bookChapters.includes(chapterNum)) {
      const updatedMap = {
        ...chaptersMap,
        [bookKey]: [...bookChapters, chapterNum]
      };
      
      // Calculate total unique chapters
      let totalUniqueChapters = 0;
      Object.values(updatedMap).forEach(chapters => {
        if (Array.isArray(chapters)) {
          totalUniqueChapters += chapters.length;
        }
      });
      
      // Check if Bible is complete (all 1189 chapters)
      if (totalUniqueChapters >= 1189) {
        const newCompletionCount = (bibleProgress?.bible_completion_count || 0) + 1;
        
        if (bibleProgress) {
          await updateBibleProgressMutation.mutateAsync({
            id: bibleProgress.id,
            data: {
              bible_completion_count: newCompletionCount,
              chapters_completed_in_current_bible_run: {},
              last_completed_at: new Date().toISOString(),
            }
          });
        } else {
          await createBibleProgressMutation.mutateAsync({
            user_id: user.id,
            bible_completion_count: newCompletionCount,
            chapters_completed_in_current_bible_run: {},
            last_completed_at: new Date().toISOString(),
          });
        }
      } else {
        // Just update the chapter map
        if (bibleProgress) {
          await updateBibleProgressMutation.mutateAsync({
            id: bibleProgress.id,
            data: { chapters_completed_in_current_bible_run: updatedMap }
          });
        } else {
          await createBibleProgressMutation.mutateAsync({
            user_id: user.id,
            bible_completion_count: 0,
            chapters_completed_in_current_bible_run: updatedMap,
          });
        }
      }
    }
  };

  const checkAchievements = async () => {
    if (!user) return;
    
    const stats = calculateStats();
    const unlockedIds = achievements.map(a => a.achievement_id);

    for (const achievement of ACHIEVEMENTS) {
      if (!unlockedIds.includes(achievement.id)) {
        if (achievement.condition(stats, progressData)) {
          await unlockAchievementMutation.mutateAsync({
            user_id: user.id,
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

  const markBookComplete = async (bookName) => {
    const book = BIBLE_BOOKS.find(b => b.name === bookName);
    if (!book || !user) return;

    let progress = getProgressForBook(bookName);
    
    // Build complete chapters array for this book
    const allChapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
    
    // Update BibleProgress with all chapters at once
    const chaptersMap = bibleProgress?.chapters_completed_in_current_bible_run || {};
    const bookKey = book.index.toString();
    const existingChapters = chaptersMap[bookKey] || [];
    
    // Merge with existing chapters (avoid duplicates)
    const mergedChapters = [...new Set([...existingChapters, ...allChapters])];
    
    const updatedMap = {
      ...chaptersMap,
      [bookKey]: mergedChapters
    };
    
    // Calculate total unique chapters
    let totalUniqueChapters = 0;
    Object.values(updatedMap).forEach(chapters => {
      if (Array.isArray(chapters)) {
        totalUniqueChapters += chapters.length;
      }
    });
    
    // Check if Bible is complete (all 1189 chapters)
    if (totalUniqueChapters >= 1189) {
      const newCompletionCount = (bibleProgress?.bible_completion_count || 0) + 1;
      
      if (bibleProgress) {
        await updateBibleProgressMutation.mutateAsync({
          id: bibleProgress.id,
          data: {
            bible_completion_count: newCompletionCount,
            chapters_completed_in_current_bible_run: {},
            last_completed_at: new Date().toISOString(),
          }
        });
      } else {
        await createBibleProgressMutation.mutateAsync({
          user_id: user.id,
          bible_completion_count: newCompletionCount,
          chapters_completed_in_current_bible_run: {},
          last_completed_at: new Date().toISOString(),
        });
      }
    } else {
      // Update the chapter map
      if (bibleProgress) {
        await updateBibleProgressMutation.mutateAsync({
          id: bibleProgress.id,
          data: { chapters_completed_in_current_bible_run: updatedMap }
        });
      } else {
        await createBibleProgressMutation.mutateAsync({
          user_id: user.id,
          bible_completion_count: 0,
          chapters_completed_in_current_bible_run: updatedMap,
        });
      }
    }
    
    // Update BookProgress
    if (progress) {
      await updateProgressMutation.mutateAsync({
        id: progress.id,
        data: {
          chapters_read: [],
          completion_count: (progress.completion_count || 0) + 1,
          last_read_date: new Date().toISOString(),
        }
      });
    } else {
      await createProgressMutation.mutateAsync({
        user_id: user.id,
        book_name: bookName,
        book_index: book.index,
        testament: book.testament,
        total_chapters: book.chapters,
        chapters_read: [],
        completion_count: 1,
        last_read_date: new Date().toISOString(),
      });
    }

    setTimeout(() => checkAchievements(), 500);
  };

  return {
    progressData,
    achievements,
    bibleProgress,
    isLoading,
    getProgressForBook,
    calculateStats,
    toggleChapter,
    restartBook,
    markBookComplete,
    checkAchievements,
    updateProgressMutation,
  };
}