import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const { groupId } = body;
  if (!groupId) return Response.json({ error: 'groupId is required' }, { status: 400 });

  try {
    const groups = await base44.asServiceRole.entities.Group.filter({ id: groupId });
    if (!groups.length) return Response.json({ error: 'Group not found' }, { status: 404 });
    const group = groups[0];

    const memberIds = group.memberIds ?? [];
    if (!memberIds.includes(user.id)) {
      await base44.asServiceRole.entities.Group.update(group.id, {
        memberIds: [...memberIds, user.id],
      });
    }

    const currentGroupIds = user.groupIds ?? [];
    if (!currentGroupIds.includes(group.id)) {
      await base44.auth.updateMe({ groupIds: [...currentGroupIds, group.id] });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('[joinGroup] Error:', err?.message, err);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});