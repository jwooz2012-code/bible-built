import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { memberIds } = await req.json();
  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    return Response.json({ logs: [] });
  }

  // Fetch logs for all members in parallel
  const logsByMember = await Promise.all(
    memberIds.map(id =>
      base44.asServiceRole.entities.ReadingLog.filter({ userId: id }, '-created_date', 500)
    )
  );

  const logs = logsByMember.flat();
  return Response.json({ logs });
});