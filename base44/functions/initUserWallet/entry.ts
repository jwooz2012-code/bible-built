/**
 * initUserWallet
 * 
 * Creates UserWallet for a user if it doesn't exist.
 * Backfills progressXpTotal from existing ReadingLogs (unique chapterId × dateKey).
 * Records a backfill XPTransaction so it never runs twice.
 * Does NOT backfill treasury currency.
 * 
 * Safe to call multiple times — fully idempotent.
 * Called on first wallet read from the client.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PROGRESS_XP_PER_CHAPTER = 100;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = user.id;

    // Check if wallet already exists
    const wallets = await base44.asServiceRole.entities.UserWallet.filter({ userId });
    const now = new Date().toISOString();

    if (wallets.length > 0) {
      // Wallet exists — just return it
      return Response.json({ wallet: wallets[0], initialized: false });
    }

    // Check if backfill already ran (guard against race conditions)
    const backfillKey = `backfill:${userId}:v1`;
    const existingBackfill = await base44.asServiceRole.entities.XPTransaction.filter({
      userId,
      idempotencyKey: backfillKey,
    });

    // Load all historical reading logs
    const allLogs = await base44.asServiceRole.entities.ReadingLog.filter({ userId }, '-created_date', 2000);

    // Unique chapter logs by chapterId (de-dup across dates — count each chapter once for progression)
    const uniqueChapterIds = new Set(allLogs.map(l => l.chapterId));
    const uniqueCount = uniqueChapterIds.size;
    const backfillXp = uniqueCount * PROGRESS_XP_PER_CHAPTER;
    const backfillLevel = Math.floor(backfillXp / 1000) + 1;

    // Create wallet with backfilled XP
    const wallet = await base44.asServiceRole.entities.UserWallet.create({
      userId,
      progressXpTotal: backfillXp,
      treasuryCurrencyBalance: 0,
      level: backfillLevel,
      updatedAt: now,
    });

    // Record backfill transaction (idempotent — prevents re-run)
    if (existingBackfill.length === 0) {
      await base44.asServiceRole.entities.XPTransaction.create({
        userId,
        type: 'adjustment',
        source: 'backfill',
        amount: backfillXp,
        idempotencyKey: backfillKey,
        metadataJson: JSON.stringify({ uniqueChapters: uniqueCount, version: 'v1' }),
        createdAt: now,
      });
    }

    return Response.json({ wallet, initialized: true, backfilledChapters: uniqueCount, backfillXp });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});