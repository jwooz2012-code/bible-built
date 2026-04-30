import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ONESIGNAL_APP_ID = '44cb7eb8-7aca-44c1-b180-40e871493808';

function getTodayKey() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const REMINDER_MESSAGES = [
  "The Word is waiting. One chapter keeps your streak alive. 📖",
  "Track what matters. Have you read today? 🔥",
  "Faithfulness is built one chapter at a time. Keep going. 📖",
  "Don't let today be the day the streak ends. Open Bible Built. 🔥",
  "Your streak is counting on you. Just one chapter. ✝️",
  "Small steps. Daily faithfulness. Open Bible Built. 📖",
  "The habit you're building matters. Read one chapter today. 🔥",
];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (user?.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

  const apiKey = Deno.env.get('ONESIGNAL_API_KEY');
  if (!apiKey) return Response.json({ error: 'OneSignal API key not configured' }, { status: 500 });

  const todayKey = getTodayKey();

  // Fetch all users and today's logs in parallel
  const [allUsers, todayLogs] = await Promise.all([
    base44.asServiceRole.entities.User.list(),
    base44.asServiceRole.entities.ReadingLog.filter({ dateKey: todayKey }),
  ]);

  // Build set of user IDs who have already read today
  const readTodayIds = new Set(todayLogs.map((l) => l.userId));

  // Only notify users who have NOT read today
  const notReadToday = allUsers.filter((u) => !readTodayIds.has(u.id));
  const userIds = notReadToday.map((u) => u.id);

  if (userIds.length === 0) {
    return Response.json({ success: true, sent: 0, message: 'All users have read today — no reminders needed.' });
  }

  // Pick a random message so it doesn't feel repetitive
  const message = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${apiKey}`,
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      include_external_user_ids: userIds,
      channel_for_external_user_ids: 'push',
      headings: { en: 'Bible Built' },
      contents: { en: message },
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    console.error('[sendDailyReminders] OneSignal error:', result);
    return Response.json({ error: 'OneSignal error', details: result }, { status: 500 });
  }

  console.log(`[sendDailyReminders] Sent to ${userIds.length} users who had not read on ${todayKey}`);
  return Response.json({ success: true, sent: userIds.length, todayKey, result });
});
