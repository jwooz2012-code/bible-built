import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Total users
  const users = await base44.asServiceRole.entities.User.list();
  const totalUsers = users.length;

  // Chapters logged in last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const allLogs = await base44.asServiceRole.entities.ReadingLog.list('-created_date', 5000);
  const recentLogs = allLogs.filter(log => log.created_date >= since);
  const chaptersLast24h = recentLogs.length;

  // Send email to the requesting admin
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: user.email,
    subject: `Bible Built Daily Stats - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    body: `
      <h2>Bible Built Daily Stats Report</h2>
      <p><strong>Total Users:</strong> ${totalUsers}</p>
      <p><strong>Chapters Logged (Last 24 Hours):</strong> ${chaptersLast24h}</p>
      <hr/>
      <p style="color:#999;font-size:12px;">Generated on ${new Date().toUTCString()}</p>
    `
  });

  return Response.json({ totalUsers, chaptersLast24h, emailSentTo: user.email });
});