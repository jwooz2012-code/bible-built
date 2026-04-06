import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user;
  try { user = await base44.auth.me(); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { friendshipId } = body;
  if (!friendshipId) return Response.json({ error: 'friendshipId is required' }, { status: 400 });

  try {
    const friendships = await base44.asServiceRole.entities.Friendship.filter({ id: friendshipId });
    if (!friendships.length) return Response.json({ error: 'Friendship not found' }, { status: 404 });
    const friendship = friendships[0];

    // Only the recipient (user2Id) can accept
    if (friendship.user2Id !== user.id) {
      return Response.json({ error: 'Not authorized to accept this request' }, { status: 403 });
    }

    // Update friendship status
    await base44.asServiceRole.entities.Friendship.update(friendshipId, { status: 'accepted' });

    // Add each user to the other's friendIds
    const allUsers = await base44.asServiceRole.entities.User.filter({
      $or: [{ id: friendship.user1Id }, { id: friendship.user2Id }]
    });

    for (const u of allUsers) {
      const otherId = u.id === friendship.user1Id ? friendship.user2Id : friendship.user1Id;
      const currentFriendIds = u.friendIds ?? [];
      if (!currentFriendIds.includes(otherId)) {
        await base44.asServiceRole.entities.User.update(u.id, {
          friendIds: [...currentFriendIds, otherId]
        });
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('[acceptFriendRequest] Error:', err?.message);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});