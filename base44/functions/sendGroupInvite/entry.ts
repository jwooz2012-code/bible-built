import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Group invites used to be written straight from the app; they now go through here so
// only group members can invite, and only their friends.
export async function handleSendGroupInvite(base44: any, user: any, body: any) {
  const db = base44.asServiceRole;
  const { groupId, friendId } = body ?? {};
  if (!groupId || !friendId) return { status: 400, body: { error: 'groupId and friendId are required' } };

  const group = (await db.entities.Group.filter({ id: groupId }))[0];
  if (!group) return { status: 404, body: { error: 'Group not found' } };
  const isMember = (id: string) => group.ownerId === id || (group.memberIds ?? []).includes(id);
  if (!isMember(user.id)) return { status: 403, body: { error: 'Only group members can invite' } };
  if (isMember(friendId)) return { status: 409, body: { error: 'Already in the group' } };

  const [ab, ba] = await Promise.all([
    db.entities.Friendship.filter({ user1Id: user.id, user2Id: friendId, status: 'accepted' }),
    db.entities.Friendship.filter({ user1Id: friendId, user2Id: user.id, status: 'accepted' }),
  ]);
  if (!ab.length && !ba.length) return { status: 403, body: { error: 'You can only invite friends' } };

  const pending = await db.entities.Notification.filter({ userId: friendId, type: 'group_invite', relatedId: groupId, isRead: false });
  if (pending.length) return { status: 200, body: { success: true, duplicate: true } };

  const sender = (await db.entities.User.filter({ id: user.id }))[0];
  const senderName = sender?.displayName || sender?.full_name || user.full_name || 'Someone';
  await db.entities.Notification.create({
    userId: friendId,
    type: 'group_invite',
    message: `${senderName} invited you to join the group "${group.name}"!`,
    relatedId: groupId,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  return { status: 200, body: { success: true } };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  try {
    const { status, body: out } = await handleSendGroupInvite(base44, user, body);
    return Response.json(out, { status });
  } catch (err) {
    console.error('[sendGroupInvite] Error:', (err as Error)?.message);
    return Response.json({ error: (err as Error)?.message || 'Internal error' }, { status: 500 });
  }
});
