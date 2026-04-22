/**
 * initUserWallet
 * 
 * Creates UserWallet for a user if it doesn't exist.
 * Backfills progressXpTotal from existing ReadingLogs (unique chapterId).
 * Also backfills treasuryCurrencyBalance: 10₡ per unique day + 200₡ per completed book.
 * Records a backfill XPTransaction so it never runs twice.
 * 
 * Safe to call multiple times — fully idempotent.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PROGRESS_XP_PER_CHAPTER = 100;

const BOOK_CHAPTER_COUNTS = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
  'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
  '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
  'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150,
  'Proverbs': 31, 'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66,
  'Jeremiah': 52, 'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12,
  'Hosea': 14, 'Joel': 3, 'Amos': 9, 'Obadiah': 1, 'Jonah': 4,
  'Micah': 7, 'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3, 'Haggai': 2,
  'Zechariah': 14, 'Malachi': 4,
  'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28,
  'Romans': 16, '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6,
  'Ephesians': 6, 'Philippians': 4, 'Colossians': 4, '1 Thessalonians': 5,
  '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4, 'Titus': 3,
  'Philemon': 1, 'Hebrews': 13, 'James': 5, '1 Peter': 5, '2 Peter': 3,
  '1 John': 5, '2 John': 1, '3 John': 1, 'Jude': 1, 'Revelation': 22,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = user.id;

    const now = new Date().toISOString();
    const backfillKey = `backfill:${userId}:v1`;

    // Check if backfill already ran — this is the true idempotency guard
    const existingBackfill = await base44.asServiceRole.entities.XPTransaction.filter({
      'data.userId': userId,
      'data.idempotencyKey': backfillKey,
    });

    if (existingBackfill.length > 0) {
      // Backfill already ran — find and return the existing wallet
      const wallets = await base44.asServiceRole.entities.UserWallet.filter({ 'data.userId': userId }, '-created_date', 10);
      const best = wallets.length > 0
        ? wallets.sort((a, b) => (b.progressXpTotal ?? 0) - (a.progressXpTotal ?? 0))[0]
        : null;

      // If wallet exists but treasury balance is still 0, patch it now
      if (best && (best.treasuryCurrencyBalance ?? 0) === 0) {
        const allLogs = await base44.asServiceRole.entities.ReadingLog.filter({ 'data.userId': userId }, '-created_date', 5000);
        const uniqueChapterIds = new Set(allLogs.map(l => l.chapterId).filter(Boolean));
        const earnedXp = uniqueChapterIds.size * PROGRESS_XP_PER_CHAPTER;
        const spendTxs = await base44.asServiceRole.entities.XPTransaction.filter({ 'data.userId': userId, 'data.type': 'spend_currency' }, '-created_date', 500);
        const totalSpent = spendTxs.reduce((sum, tx) => sum + Math.abs(tx.amount ?? 0), 0);
        const treasuryBalance = Math.max(0, earnedXp - totalSpent);
        const patched = await base44.asServiceRole.entities.UserWallet.update(best.id, {
          treasuryCurrencyBalance: treasuryBalance,
          updatedAt: new Date().toISOString(),
        });
        return Response.json({ wallet: patched, initialized: false, patched: true, treasuryBalance });
      }

      return Response.json({ wallet: best, initialized: false });
    }

    // No backfill record yet — first time init

    // Load all historical reading logs
    const allLogs = await base44.asServiceRole.entities.ReadingLog.filter({ 'data.userId': userId }, '-created_date', 2000);

    // Unique chapter logs by chapterId (de-dup across dates — count each chapter once for progression)
    const uniqueChapterIds = new Set(allLogs.map(l => l.chapterId));
    const uniqueCount = uniqueChapterIds.size;
    const backfillXp = uniqueCount * PROGRESS_XP_PER_CHAPTER;
    const backfillLevel = Math.floor(backfillXp / 1000) + 1;

    // Treasury balance = same as XP earned (unified pool) minus any prior artifact purchases
    const spendTxs = await base44.asServiceRole.entities.XPTransaction.filter({
      'data.userId': userId,
      'data.type': 'spend_currency',
    }, '-created_date', 500);
    const totalSpent = spendTxs.reduce((sum, tx) => sum + Math.abs(tx.amount ?? 0), 0);
    const treasuryBalance = Math.max(0, backfillXp - totalSpent);

    // Create wallet with backfilled XP and treasury balance
    const wallet = await base44.asServiceRole.entities.UserWallet.create({
      userId,
      progressXpTotal: backfillXp,
      treasuryCurrencyBalance: treasuryBalance,
      level: backfillLevel,
      updatedAt: now,
    });

    // Record backfill transaction (idempotent — prevents re-run)
    await base44.asServiceRole.entities.XPTransaction.create({
      userId,
      type: 'adjustment',
      source: 'backfill',
      amount: backfillXp,
      idempotencyKey: backfillKey,
      metadataJson: JSON.stringify({ uniqueChapters: uniqueCount, version: 'v1', treasuryBalance }),
      createdAt: now,
    });

    return Response.json({ wallet, initialized: true, backfilledChapters: uniqueCount, backfillXp, treasuryBalance });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});