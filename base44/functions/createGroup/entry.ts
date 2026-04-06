import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const { name } = body;
  if (!name?.trim()) return Response.json({ error: 'Group name is required' }, { status: 400 });

  try {
    const group = await base44.asServiceRole.entities.Group.create({
      name: name.trim(),
      ownerId: user.id,
      memberIds: [user.id],
      isPrivate: true,
    });

    const currentGroupIds = user.groupIds ?? [];
    if (!currentGroupIds.includes(group.id)) {
      await base44.auth.updateMe({ groupIds: [...currentGroupIds, group.id] });
    }

    return Response.json({ group });
  } catch (err) {
    console.error('[createGroup] Error:', err?.message, err);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});