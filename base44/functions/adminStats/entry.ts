import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateKey = yesterday.toISOString().slice(0, 10);

  const logs = await base44.asServiceRole.entities.ReadingLog.filter({ 'data.dateKey': dateKey }, '-created_date', 5000);
  return Response.json({ count: logs.length, date: dateKey });
});