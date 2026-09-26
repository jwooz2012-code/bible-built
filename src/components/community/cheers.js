import { getDateKey } from '@/components/bible/utils/dateUtils';

export const CHEER_KINDS = [
  { id: 'high_five', emoji: '✋', label: 'High five' },
  { id: 'keep_going', emoji: '🔥', label: 'Keep going' },
  { id: 'praying', emoji: '🙏', label: 'Praying for you' },
  { id: 'amen', emoji: '❤️', label: 'Amen' },
];

export const cheerKind = (id) => CHEER_KINDS.find((k) => k.id === id) ?? CHEER_KINDS[0];

// Older notifications were saved with 🙌 for high fives; show them with today's ✋.
export const notificationText = (message = '') => message.replace(/🙌/g, '✋');

// Notification types that mean "someone encouraged you".
export const ENCOURAGEMENT_TYPES = ['cheer', 'high_five', 'nudge'];

// One profile cheer per person per day.
export const profileCheerKey = (toUserId) => `p:${toUserId}:${getDateKey()}`;

export const displayName = (u, fallback = 'Someone') => u?.displayName || u?.full_name || fallback;
export const firstName = (u, fallback = 'Someone') => {
  const name = displayName(u, fallback);
  return typeof name === 'string' ? name.split(' ')[0] : name;
};

// "Jake", "Jake and Ana", "Jake, Ana and 3 others"
export function joinNames(names) {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  const rest = names.length - 2;
  return `${names[0]}, ${names[1]} and ${rest} other${rest === 1 ? '' : 's'}`;
}

export function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
