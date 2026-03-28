import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Yesterday in CT (UTC-6)
    const now = new Date();
    const ct = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const yesterday = new Date(ct);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    // Filter logs by yesterdayKey using the filter method
    const yesterdayLogsRaw = await base44.asServiceRole.entities.ReadingLog.filter(
      { dateKey: yesterdayKey },
      '-created_date',
      10000
    );
    const yesterdayLogs = Array.from(yesterdayLogsRaw);

    const chaptersRead = yesterdayLogs.length;
    const activeUsers = new Set(yesterdayLogs.map(l => l.userId)).size;

    // Send email (skip User.list() to avoid timeout — totalUsers comes from prior knowledge)
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'jwooz2012@gmail.com',
      subject: `Bible Built Daily Stats - ${yesterdayKey}`,
      body: `
        <h2>Bible Built Daily Stats Report</h2>
        <p><strong>Date:</strong> ${yesterdayKey}</p>
        <p><strong>Chapters Read Yesterday:</strong> ${chaptersRead}</p>
        <p><strong>Active Readers Yesterday:</strong> ${activeUsers}</p>
        <hr/>
        <p style="color:#999;font-size:12px;">Generated on ${new Date().toUTCString()}</p>
      `
    });

    return Response.json({ yesterdayKey, chaptersRead, activeUsers, emailSent: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});