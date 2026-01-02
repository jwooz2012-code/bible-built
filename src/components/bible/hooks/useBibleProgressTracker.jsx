export function useBibleProgressTracker(
  bibleProgress,
  user,
  createBibleProgressMutation,
  updateBibleProgressMutation
) {

  const updateBibleProgressChapter = async (bookIndex, chapterNum) => {
    if (!user) return;

    const chaptersMap = bibleProgress?.chapters_completed_in_current_bible_run || {};
    const bookKey = bookIndex.toString();
    const bookChapters = chaptersMap[bookKey] || [];
    
    if (!bookChapters.includes(chapterNum)) {
      const updatedMap = {
        ...chaptersMap,
        [bookKey]: [...bookChapters, chapterNum]
      };
      
      let totalUniqueChapters = 0;
      Object.values(updatedMap).forEach(chapters => {
        if (Array.isArray(chapters)) {
          totalUniqueChapters += chapters.length;
        }
      });
      
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

  return { updateBibleProgressChapter };
}