import { ACHIEVEMENTS } from '../bibleData';

export function useAchievements(progressData, achievements, unlockAchievementMutation, calculateStats, user) {
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

  return { checkAchievements };
}