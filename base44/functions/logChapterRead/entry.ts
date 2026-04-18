/**
 * logChapterRead
 * 
 * Trusted server-side function that:
 * 1. Validates user owns the request
 * 2. Checks for duplicate ReadingLog (userId + chapterId + dateKey) — idempotent
 * 3. Creates the ReadingLog record if not duplicate
 * 4. Calls syncReadingReward internally to grant progress XP once
 * 
 * For bulk operations, accepts an array of chapters.
 * Returns: { created: [...logs], skipped: [...chapterIds], wallet }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PROGRESS_XP_PER_CHAPTER = 100;

async function getOrCreateWallet(base44, userId) {
  const wallets = await base44.asServiceRole.entities.UserWallet.filter({ userId }, '-created_date', 5);
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
    // chapters: array of { userId, dateKey, timestamp, book, bookIndex, chapter, chapterId, testament, xpEarned? }
    const { chapters } = body;

    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return Response.json({ error: 'chapters array is required' }, { status: 400 });
    }

    // All chapters must belong to the authenticated user
    for (const ch of chapters) {
      if (ch.userId !== user.id) {
        return Response.json({ error: 'Forbidden: userId mismatch' }, { status: 403 });
      }
      if (!ch.chapterId || !ch.dateKey) {
        return Response.json({ error: 'Each chapter must have chapterId and dateKey' }, { status: 400 });
      }
    }

    const userId = user.id;

    // Load ALL existing logs for the user on the relevant dates (batch lookup)
    const dateKeys = [...new Set(chapters.map(c => c.dateKey))];
    const existingLogArrays = await Promise.all(
      dateKeys.map(dk => base44.asServiceRole.entities.ReadingLog.filter({ userId, dateKey: dk }))
    );
    const existingLogs = existingLogArrays.flat();
    const existingSet = new Set(existingLogs.map(l => `${l.chapterId}:${l.dateKey}`));

    const toCreate = [];
    const skipped = [];

    for (const ch of chapters) {
      const key = `${ch.chapterId}:${ch.dateKey}`;
      if (existingSet.has(key)) {
        skipped.push(ch.chapterId);
      } else {
        toCreate.push(ch);
        existingSet.add(key); // prevent duplicates within the same batch
      }
    }

    if (toCreate.length === 0) {
      const wallet = await getOrCreateWallet(base44, userId);
      return Response.json({ created: [], skipped, wallet });
    }

    // Bulk create reading logs
    const createdLogs = await base44.asServiceRole.entities.ReadingLog.bulkCreate(toCreate);

    // Grant progress XP for each newly created log (idempotent via XPTransaction)
    const now = new Date().toISOString();
    const wallet = await getOrCreateWallet(base44, userId);
    
    let xpGained = 0;
    const xpTransactions = [];

    for (const ch of toCreate) {
      const idempotencyKey = `chapter_read:${userId}:${ch.chapterId}:${ch.dateKey}`;
      // Check for existing XP transaction
      const existingTx = await base44.asServiceRole.entities.XPTransaction.filter({ userId, idempotencyKey });
      if (existingTx.length === 0) {
        xpTransactions.push({
          userId,
          type: 'earn_progress_xp',
          source: 'chapter_read',
          amount: PROGRESS_XP_PER_CHAPTER,
          idempotencyKey,
          metadataJson: JSON.stringify({ chapterId: ch.chapterId, dateKey: ch.dateKey }),
          createdAt: now,
        });
        xpGained += PROGRESS_XP_PER_CHAPTER;
      }
    }

    if (xpTransactions.length > 0) {
      await base44.asServiceRole.entities.XPTransaction.bulkCreate(xpTransactions);

      const newProgressXp = (wallet.progressXpTotal ?? 0) + xpGained;
      const newLevel = Math.floor(newProgressXp / 1000) + 1;
      await base44.asServiceRole.entities.UserWallet.update(wallet.id, {
        progressXpTotal: newProgressXp,
        level: newLevel,
        updatedAt: now,
      });
      wallet.progressXpTotal = newProgressXp;
      wallet.level = newLevel;
    }

    return Response.json({
      created: Array.isArray(createdLogs) ? createdLogs : toCreate,
      skipped,
      xpGranted: xpGained,
      wallet,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});