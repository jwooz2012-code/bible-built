import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Get all users
  const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 1000);
  const totalUsers = allUsers.length;

  // Users added in the last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const newUsers = allUsers.filter(u => u.created_date >= oneDayAgo);

  // Get reading logs from last 24 hours
  const today = new Date();
  const pad = n => String(n).padStart(2, '0');
  const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const yesterday = new Date(today - 24 * 60 * 60 * 1000);
  const yesterdayKey = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

  const recentLogs = await base44.asServiceRole.entities.ReadingLog.filter(
    { dateKey: { $gte: yesterdayKey, $lte: todayKey } },
    '-dateKey',
    5000
  );

  // All-time logs
  const allTimeLogs = await base44.asServiceRole.entities.ReadingLog.list('-dateKey', 10000);
  const totalChaptersAllTime = allTimeLogs.length;

  // Stats for last 24 hours
  const chaptersLast24h = recentLogs.length;
  const activeUsersLast24h = new Set(recentLogs.map(l => l.userId)).size;
  const uniqueBooksLast24h = new Set(recentLogs.map(l => l.book)).size;

  // Most read book in last 24h
  const bookCounts = {};
  recentLogs.forEach(l => { bookCounts[l.book] = (bookCounts[l.book] || 0) + 1; });
  const mostReadBook = Object.keys(bookCounts).length > 0
    ? Object.entries(bookCounts).sort((a, b) => b[1] - a[1])[0]
    : null;

  // All-time active users (read at least once)
  const allTimeActiveUsers = new Set(allTimeLogs.map(l => l.userId)).size;

  const reportDate = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Detroit' });

  const body = `
📖 Bible Built — Daily Stats Report
${reportDate}

━━━━━━━━━━━━━━━━━━━━━━━
👥 USERS
━━━━━━━━━━━━━━━━━━━━━━━
Total Users:        ${totalUsers}
New Today:          ${newUsers.length}
Active Today:       ${activeUsersLast24h}
Ever Active:        ${allTimeActiveUsers}

━━━━━━━━━━━━━━━━━━━━━━━
📚 READING ACTIVITY (Last 24h)
━━━━━━━━━━━━━━━━━━━━━━━
Chapters Logged:    ${chaptersLast24h}
Books Touched:      ${uniqueBooksLast24h}
Most Read Book:     ${mostReadBook ? `${mostReadBook[0]} (${mostReadBook[1]} chapters)` : '—'}

━━━━━━━━━━━━━━━━━━━━━━━
📊 ALL-TIME TOTALS
━━━━━━━━━━━━━━━━━━━━━━━
Total Chapters:     ${totalChaptersAllTime}
Total Users:        ${totalUsers}

━━━━━━━━━━━━━━━━━━━━━━━
Keep building. 💪
  `.trim();

  // Find admin users to send the report to
  const adminUsers = allUsers.filter(u => u.role === 'admin');

  for (const admin of adminUsers) {
    if (admin.email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject: `📖 Bible Built Daily Report — ${reportDate}`,
        body,
      });
    }
  }

  return Response.json({
    success: true,
    reportSentTo: adminUsers.map(u => u.email),
    stats: {
      totalUsers,
      newUsersToday: newUsers.length,
      activeUsersLast24h,
      chaptersLast24h,
      totalChaptersAllTime,
    }
  });
});