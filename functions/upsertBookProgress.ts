export default async function upsertBookProgress(payload, context) {
  const { user } = context;
  
  if (!user) {
    throw new Error('Authentication required');
  }

  // Validate ownership
  if (payload.user_id !== user.id) {
    throw new Error('Permission denied: user_id must match authenticated user');
  }

  const { base44 } = context;

  // Find existing progress by user_id and book_index
  const existingProgress = await base44.asServiceRole.entities.BookProgress.filter({
    user_id: payload.user_id,
    book_index: payload.book_index
  });

  if (existingProgress.length > 0) {
    // Update existing
    const updated = await base44.asServiceRole.entities.BookProgress.update(
      existingProgress[0].id,
      payload
    );
    return updated;
  } else {
    // Create new
    const created = await base44.asServiceRole.entities.BookProgress.create(payload);
    return created;
  }
}