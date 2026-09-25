import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { medalRank } from '@/data/challenges';

export function useChallengeAttempts(userId) {
  return useQuery({
    queryKey: ['challengeAttempts', userId],
    queryFn: () => base44.entities.ChallengeAttempt.filter({ userId }),
    enabled: !!userId,
    staleTime: 30000,
  });
}

export function summarizeAttempts(attempts = [], challengeId) {
  const mine = attempts.filter((a) => a.challengeId === challengeId);
  if (mine.length === 0) return { count: 0, best: null, last: null };
  const best = mine.reduce((a, b) => (b.score > a.score || (b.score === a.score && medalRank(b.medal) > medalRank(a.medal)) ? b : a));
  const last = mine.reduce((a, b) => (new Date(b.completedAt || b.created_date) > new Date(a.completedAt || a.created_date) ? b : a));
  return { count: mine.length, best, last };
}
