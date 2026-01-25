import { computeBadgeState } from './badgeEngine';

/**
 * DEPRECATED - Use computeBadgeState from badgeEngine instead
 * 
 * This function is kept for backwards compatibility but should not be used.
 * All badge logic now lives in badgeEngine.js
 */
export function defineBadges(params) {
  console.warn('defineBadges() is deprecated. Use computeBadgeState() from badgeEngine.js instead.');
  
  // For backwards compatibility, map old parameters to new engine
  const mockLogs = [];
  const mockUser = {
    statsSharedCount: params.statsSharedCount || 0,
    statsReceivedCount: params.statsReceivedCount || 0
  };
  
  const { badges } = computeBadgeState(mockLogs, mockUser);
  return badges;
}

/**
 * Returns badges for display in horizontal rows
 * Ensures consistent ordering across all screens
 */
export function getBadgesForRow(badges, mode = 'earned') {
  if (mode === 'earned') {
    // Return only earned badges, in the order they appear in the master list
    return badges.filter(b => b.achieved);
  }
  
  // mode === 'all': return all badges (earned first, then locked)
  const earned = badges.filter(b => b.achieved);
  const locked = badges.filter(b => !b.achieved);
  return [...earned, ...locked];
}