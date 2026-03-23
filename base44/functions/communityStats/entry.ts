import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const allLogs = await base44.asServiceRole.entities.ReadingLog.list('-created_date', 5000);
  const monthLogs = allLogs.filter(log => log.dateKey >= monthStart);

  return Response.json({ chaptersThisMonth: monthLogs.length });
});