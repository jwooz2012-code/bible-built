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

const BASE_XP_PER_CHAPTER = 100;

// Artifact catalog with multipliers
const ARTIFACT_BOOSTS = {
  'ark-of-the-covenant': 1.25,
  'sword-goliath': 1.25,
  'coat-of-many-colors': 1.15,
  'sling-of-david': 1.15,
  'davids-harp': 1.10,
  'jar-of-manna': 1.10,
  'noahs-hammer': 1.10,
  'clay-lamp': 1.05,
  'rod-of-peter': 1.05,
  'shepherds-staff': 1.05,
};

async function getOrCreateWallet(base44, userId) {
  const wallets = await base44.asServiceRole.entities.UserWallet.filter({ 'data.userId': userId }, '-created_date', 10);
  if (wallets.length > 0) {
    return wallets.sort((a, b) => (b.progressXpTotal ?? 0) - (a.progressXpTotal ?? 0))[0];
  }
  const now = new Date().toISOString();
  return await base44.asServiceRole.entities.UserWallet.create({
    userId,
    progressXpTotal: 0,
    spendableXp: 0,
    level: 1,
    updatedAt: now,
  });
}

async function getEquippedMultiplier(base44, userId) {
  const equipped = await base44.asServiceRole.entities.ArtifactOwnership.filter({ 'data.userId': userId, 'data.isEquipped': true });
  let multiplier = 1.0;
  for (const artifact of equipped) {
    const boost = ARTIFACT_BOOSTS[artifact.artifactId] ?? 1.0;
    multiplier *= boost;
  }
  return multiplier;
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
      dateKeys.map(dk => base44.asServiceRole.entities.ReadingLog.filter({ 'data.userId': userId, 'data.dateKey': dk }))
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

    // Get equipped artifacts multiplier
    const multiplier = await getEquippedMultiplier(base44, userId);
    
    const now = new Date().toISOString();
    const wallet = await getOrCreateWallet(base44, userId);
    
    let progressXpGained = 0;
    const xpTransactions = [];

    for (const ch of toCreate) {
      const idempotencyKey = `chapter_read:${userId}:${ch.chapterId}:${ch.dateKey}`;
      // Check for existing XP transaction
      const existingTx = await base44.asServiceRole.entities.XPTransaction.filter({ 'data.userId': userId, 'data.idempotencyKey': idempotencyKey });
      if (existingTx.length === 0) {
        // Apply multiplier at earn time
        const xpAmount = Math.floor(BASE_XP_PER_CHAPTER * multiplier);
        xpTransactions.push({
          userId,
          type: 'earn_progress_xp',
          source: 'chapter_read',
          amount: xpAmount,
          idempotencyKey,
          metadataJson: JSON.stringify({ chapterId: ch.chapterId, dateKey: ch.dateKey, baseXp: BASE_XP_PER_CHAPTER, multiplier }),
          createdAt: now,
        });
        progressXpGained += xpAmount;
      }
    }

    // Check if any of the new logs represent a brand-new reading day (for 10₡ daily reward)
    let currencyGained = 0;
    const currencyTransactions = [];
    for (const dk of dateKeys) {
      const dailyCurrencyKey = `daily_reading_complete:${userId}:${dk}`;
      // Only grant if at least one chapter was created for this day
      const createdForDay = toCreate.filter(c => c.dateKey === dk);
      if (createdForDay.length === 0) continue;
      const existingCurrencyTx = await base44.asServiceRole.entities.XPTransaction.filter({
        'data.userId': userId,
        'data.idempotencyKey': `milestone:${userId}:daily_reading_complete:${userId}:${dk}`,
      });
      if (existingCurrencyTx.length === 0) {
        currencyTransactions.push({
          userId,
          type: 'earn_currency',
          source: 'daily_reading_complete',
          amount: 10,
          idempotencyKey: `milestone:${userId}:daily_reading_complete:${userId}:${dk}`,
          metadataJson: JSON.stringify({ dateKey: dk }),
          createdAt: now,
        });
        currencyGained += 10;
      }
    }

    if (xpTransactions.length > 0 || currencyTransactions.length > 0) {
      const allTx = [...xpTransactions, ...currencyTransactions];
      await base44.asServiceRole.entities.XPTransaction.bulkCreate(allTx);

      const newProgressXp = (wallet.progressXpTotal ?? 0) + progressXpGained;
      const newLevel = Math.floor(newProgressXp / 1000) + 1;
      const newSpendableXp = (wallet.spendableXp ?? 0) + currencyGained;
      await base44.asServiceRole.entities.UserWallet.update(wallet.id, {
        progressXpTotal: newProgressXp,
        spendableXp: newSpendableXp,
        level: newLevel,
        updatedAt: now,
      });
      wallet.progressXpTotal = newProgressXp;
      wallet.spendableXp = newSpendableXp;
      wallet.level = newLevel;
    }

    return Response.json({
      created: Array.isArray(createdLogs) ? createdLogs : toCreate,
      skipped,
      progressXpGranted: progressXpGained,
      currencyGranted: currencyGained,
      multiplier,
      wallet,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});