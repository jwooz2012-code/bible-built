import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { ids } = await req.json();
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Response.json({ graceDays: [] });
  }

  const all = await base44.asServiceRole.entities.GraceDay.list();
  const filtered = all.filter(g => ids.includes(g.userId));
  return Response.json({ graceDays: filtered });
});