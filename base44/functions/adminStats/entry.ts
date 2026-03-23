import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const logs = await base44.asServiceRole.entities.ReadingLog.filter({ dateKey: req.url.includes('date=') ? new URL(req.url).searchParams.get('date') : '2026-03-22' });
  return Response.json({ count: logs.length, date: '2026-03-22' });
});