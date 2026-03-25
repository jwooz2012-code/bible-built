import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
  }

  const users = await base44.asServiceRole.entities.User.list();
  let count = 0;

  for (const u of users) {
    if (u.onboardingComplete) {
      await base44.asServiceRole.entities.User.update(u.id, { onboardingComplete: false });
      count++;
    }
  }

  return Response.json({ success: true, usersReset: count });
});