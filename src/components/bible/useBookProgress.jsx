import { useProgressData } from './hooks/useProgressData';
import { useProgressMutations } from './hooks/useProgressMutations';
import { useProgressStats } from './hooks/useProgressStats';
import { useAchievements } from './hooks/useAchievements';
import { useBibleProgressTracker } from './hooks/useBibleProgressTracker';
import { useChapterActions } from './hooks/useChapterActions';
import { useMarkBookComplete } from './hooks/useMarkBookComplete';

export function useBookProgress() {
  const { user, progressData, achievements, bibleProgress, isLoading } = useProgressData();

  const {
    createProgressMutation,
    updateProgressMutation,
    unlockAchievementMutation,
    createBibleProgressMutation,
    updateBibleProgressMutation,
  } = useProgressMutations();

  const { getProgressForBook, calculateStats } = useProgressStats(progressData, bibleProgress);

  const { checkAchievements } = useAchievements(
    progressData,
    achievements,
    unlockAchievementMutation,
    calculateStats,
    user
  );

  const { updateBibleProgressChapter } = useBibleProgressTracker(
    bibleProgress,
    user,
    createBibleProgressMutation,
    updateBibleProgressMutation
  );

  const { toggleChapter, restartBook } = useChapterActions(
    user,
    progressData,
    getProgressForBook,
    createProgressMutation,
    updateProgressMutation,
    updateBibleProgressChapter,
    checkAchievements
  );

  const { markBookComplete } = useMarkBookComplete(
    user,
    bibleProgress,
    getProgressForBook,
    createProgressMutation,
    updateProgressMutation,
    createBibleProgressMutation,
    updateBibleProgressMutation,
    checkAchievements
  );

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