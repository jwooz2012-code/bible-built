import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const nextMonth = now.getMonth() === 11
      ? `${now.getFullYear() + 1}-01-01`
      : `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}-01`;

    // Use service role to count all users' reading logs for this month
    const logs = await base44.asServiceRole.entities.ReadingLog.filter({
      dateKey: { $gte: monthStart, $lt: nextMonth }
    });

    return Response.json({ chaptersThisMonth: logs.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});