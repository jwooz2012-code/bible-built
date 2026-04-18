/**
 * syncReadingReward
 * 
 * Server-side trusted function that:
 * 1. Validates the user owns the reading log
 * 2. Ensures idempotency — one XP grant per (userId + chapterId + dateKey)
 * 3. Creates/updates UserWallet with progress XP
 * 4. Records XPTransaction for audit trail
 * 5. Does NOT grant treasury currency (milestone only, via grantMilestoneReward)
 * 
 * Returns: { granted: bool, xpAwarded: number, wallet: {...} }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PROGRESS_XP_PER_CHAPTER = 100;

async function getOrCreateWallet(base44, userId) {
  const wallets = await base44.asServiceRole.entities.UserWallet.filter({ 'data.userId': userId }, '-created_date', 5);
  if (wallets.length > 0) {
    return wallets.sort((a, b) => (b.progressXpTotal ?? 0) - (a.progressXpTotal ?? 0))[0];
  }
  const now = new Date().toISOString();
  return await base44.asServiceRole.entities.UserWallet.create({
    userId,
    progressXpTotal: 0,
    treasuryCurrencyBalance: 0,
    level: 1,
    updatedAt: now,
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { userId, chapterId, dateKey, logId } = body;

    // Validate ownership — userId must match authenticated user
    if (!userId || userId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!chapterId || !dateKey) {
      return Response.json({ error: 'chapterId and dateKey are required' }, { status: 400 });
    }

    // Idempotency key: one XP grant per user+chapter+date
    const idempotencyKey = `chapter_read:${userId}:${chapterId}:${dateKey}`;

    // Check if this reward was already granted
    const existing = await base44.asServiceRole.entities.XPTransaction.filter({
      'data.userId': userId,
      'data.idempotencyKey': idempotencyKey,
    });
    if (existing.length > 0) {
      // Already granted — return current wallet state idempotently
      const wallet = await getOrCreateWallet(base44, userId);
      return Response.json({ granted: false, xpAwarded: 0, wallet, reason: 'already_granted' });
    }

    // Grant progress XP
    const xpAwarded = PROGRESS_XP_PER_CHAPTER;
    const now = new Date().toISOString();

    // Get or create wallet
    const wallet = await getOrCreateWallet(base44, userId);
    const newProgressXp = (wallet.progressXpTotal ?? 0) + xpAwarded;
    const newLevel = Math.floor(newProgressXp / 1000) + 1;

    // Create XP transaction first (idempotency record)
    await base44.asServiceRole.entities.XPTransaction.create({
      userId,
      type: 'earn_progress_xp',
      source: 'chapter_read',
      amount: xpAwarded,
      idempotencyKey,
      metadataJson: JSON.stringify({ chapterId, dateKey, logId: logId ?? null }),
      createdAt: now,
    });

    // Update wallet
    const updatedWallet = await base44.asServiceRole.entities.UserWallet.update(wallet.id, {
      progressXpTotal: newProgressXp,
      level: newLevel,
      updatedAt: now,
    });

    return Response.json({ granted: true, xpAwarded, wallet: updatedWallet });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});