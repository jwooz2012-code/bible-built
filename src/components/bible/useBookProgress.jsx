import { useProgressData } from './hooks/useProgressData';
import { useProgressMutations } from './hooks/useProgressMutations';
import { useProgressStats } from './hooks/useProgressStats';
import { useAchievements } from './hooks/useAchievements';
import { useChapterActions } from './hooks/useChapterActions';
import { useMarkBookComplete } from './hooks/useMarkBookComplete';

export function useBookProgress() {
  const { user, progressData, achievements, isLoading } = useProgressData();

  const {
    createProgressMutation,
    updateProgressMutation,
    unlockAchievementMutation,
  } = useProgressMutations();

  const { getProgressForBook, calculateStats } = useProgressStats(progressData);

  const { checkAchievements } = useAchievements(
    progressData,
    achievements,
    unlockAchievementMutation,
    calculateStats,
    user
  );

  const { toggleChapter, restartBook } = useChapterActions(
    user,
    progressData,
    getProgressForBook,
    createProgressMutation,
    updateProgressMutation,
    checkAchievements
  );

  const { markBookComplete } = useMarkBookComplete(
    user,
    getProgressForBook,
    createProgressMutation,
    updateProgressMutation,
    checkAchievements
  );

  return {
    progressData,
    achievements,
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