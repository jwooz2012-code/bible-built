// Remembers, on this device, when the reader last looked at each group board, so a
// small "new" dot can show when someone has posted since. Losing it (private mode,
// cleared storage) only means posts from the last few days show as new again.

export const BOARDS = ['takeaway', 'prayer'];
const NEW_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
const keyFor = (userId) => `bb.boardSeen.${userId}`;

function readAll(userId) {
  try {
    return JSON.parse(localStorage.getItem(keyFor(userId)) || '{}') || {};
  } catch {
    return {};
  }
}

export function markBoardSeen(userId, groupId, board) {
  if (!userId || !groupId) return;
  const all = readAll(userId);
  all[groupId] = { ...(all[groupId] ?? {}), [board]: new Date().toISOString() };
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(all));
  } catch {
    /* storage unavailable: the dot just shows a bit longer */
  }
}

/** True when the board (or, with no board given, either board) has a post newer than the reader's last visit. */
export function boardHasNew(userId, group, board) {
  if (!userId || !group?.id) return false;
  const activity = group.boardActivity ?? {};
  const seen = readAll(userId)[group.id] ?? {};
  const fallback = Date.now() - NEW_WINDOW_MS;
  return (board ? [board] : BOARDS).some((b) => {
    const at = activity[b] ? new Date(activity[b]).getTime() : 0;
    const seenAt = seen[b] ? new Date(seen[b]).getTime() : fallback;
    return at > seenAt;
  });
}
