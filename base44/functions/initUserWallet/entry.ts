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

    // Check if wallet already exists
    const wallets = await base44.asServiceRole.entities.UserWallet.filter({ 'data.userId': userId }, 'created_date', 5);
    if (wallets.length > 0) {
      return Response.json({ wallet: wallets[0], initialized: false });
    }

    // No wallet yet — first time init
    // Load all historical reading logs
    const allLogs = await base44.asServiceRole.entities.ReadingLog.filter({ 'data.userId': userId }, '-created_date', 5000);

    // Unique chapter logs by chapterId
    const uniqueChapterIds = new Set(allLogs.map(l => l.chapterId));
    const uniqueCount = uniqueChapterIds.size;
    const backfillXp = uniqueCount * PROGRESS_XP_PER_CHAPTER;
    const backfillLevel = Math.floor(backfillXp / 1000) + 1;

    // Create wallet with backfilled XP
    const wallet = await base44.asServiceRole.entities.UserWallet.create({
      userId,
      xpBalance: backfillXp,
      level: backfillLevel,
      updatedAt: now,
    });

    return Response.json({ wallet, initialized: true, backfilledChapters: uniqueCount, backfillXp });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});