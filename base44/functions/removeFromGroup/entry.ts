import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { groupId, memberIdToRemove } = await req.json();

    const groups = await base44.asServiceRole.entities.Group.filter({ id: groupId });
    const group = groups[0];
    if (!group) return Response.json({ error: 'Group not found' }, { status: 404 });

    if (group.ownerId !== user.id) {
      return Response.json({ error: 'Forbidden: Only the group owner can remove members' }, { status: 403 });
    }

    const newMemberIds = (group.memberIds || []).filter(id => id !== memberIdToRemove);
    await base44.asServiceRole.entities.Group.update(group.id, { memberIds: newMemberIds });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});