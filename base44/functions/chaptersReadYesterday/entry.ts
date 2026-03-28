import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Calculate yesterday's date key in CT (UTC-5/UTC-6)
    const now = new Date();
    const ctOffset = -6 * 60; // CST (adjust to -5 for CDT if needed)
    const ctNow = new Date(now.getTime() + ctOffset * 60 * 1000);
    const yesterday = new Date(ctNow);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    // Get all logs for yesterday
    const allLogs = await base44.asServiceRole.entities.ReadingLog.list('-dateKey', 10000);
    const yesterdayLogs = allLogs.filter(log => log.dateKey === yesterdayKey);
    const chaptersRead = yesterdayLogs.length;
    const activeUsers = new Set(yesterdayLogs.map(l => l.userId)).size;

    // Get total users
    const users = await base44.asServiceRole.entities.User.list();
    const totalUsers = users.length;

    // Send email report
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'jwooz2012@gmail.com',
      subject: `Bible Built Daily Stats - ${yesterdayKey}`,
      body: `
        <h2>Bible Built Daily Stats Report</h2>
        <p><strong>Date:</strong> ${yesterdayKey}</p>
        <p><strong>Total Registered Users:</strong> ${totalUsers}</p>
        <p><strong>Chapters Read Yesterday:</strong> ${chaptersRead}</p>
        <p><strong>Active Readers Yesterday:</strong> ${activeUsers}</p>
        <hr/>
        <p style="color:#999;font-size:12px;">Generated on ${new Date().toUTCString()}</p>
      `
    });

    return Response.json({ yesterdayKey, chaptersRead, activeUsers, totalUsers, emailSent: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});