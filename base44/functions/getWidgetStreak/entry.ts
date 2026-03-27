import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userData = await base44.asServiceRole.entities.User.get(user.id);
  const today = new Date().toISOString().split('T')[0];
  const logs = await base44.asServiceRole.entities.ReadingLog.filter({ userId: user.id, dateKey: today });

  return new Response(JSON.stringify({
    currentStreak: userData.currentStreak || 0,
    readToday: logs.length > 0,
    userId: user.id,
    lastUpdated: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
});