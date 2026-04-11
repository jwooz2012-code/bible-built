import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { ids } = await req.json();
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Response.json({ users: [] });
  }

  const allUsers = await base44.asServiceRole.entities.User.list();
  const filtered = allUsers
    .filter(u => ids.includes(u.id))
    .map(u => ({ id: u.id, full_name: u.full_name, displayName: u.displayName, email: u.email, xp: u.xp ?? 0, streak: u.streak ?? 0, avatarType: u.avatarType, avatarPhotoUrl: u.avatarPhotoUrl, avatarEmoji: u.avatarEmoji, avatarDefaultId: u.avatarDefaultId }));

  return Response.json({ users: filtered });
});