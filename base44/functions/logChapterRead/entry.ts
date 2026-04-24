/**
 * logChapterRead
 *
 * Trusted server-side function that:
 * 1. Validates user owns the request
 * 2. Checks for duplicate ReadingLog (userId + chapterId + dateKey) — idempotent
 * 3. Creates the ReadingLog record if not duplicate
 * 4. Awards XP: 2 XP per verse, multiplied by equipped artifact boost
 * 5. Awards 100 XP bonus (multiplied) if user reads ≥ 30 verses in a single day
 *
 * For bulk operations, accepts an array of chapters.
 * Returns: { created: [...logs], skipped: [...chapterIds], wallet }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const XP_PER_VERSE = 2;
const DAILY_BONUS_XP = 100;
const DAILY_BONUS_VERSE_THRESHOLD = 30;

// Verse counts per chapter for all 66 books of the Bible (KJV)
const VERSE_COUNTS_BY_BOOK = {
  "Genesis":[31,25,24,26,32,22,24,22,29,32,32,20,18,24,21,16,27,33,38,18,34,24,20,67,34,35,46,22,35,43,55,32,20,31,29,43,36,30,23,43,57,38,34,34,28,34,31,22,33,26],
  "Exodus":[22,25,22,31,23,30,25,32,35,29,10,51,22,31,27,36,16,27,25,26,36,31,33,18,40,37,21,43,46,38,18,35,23,35,35,38,29,31,43,38],
  "Leviticus":[17,16,17,35,19,30,38,36,24,20,47,8,59,57,33,34,16,30,24,16,15,16,9,6,4,5,6],
  "Numbers":[54,34,51,49,31,27,89,26,23,36,35,16,33,45,41,50,13,32,22,29,35,41,30,25,18,65,23,31,40,16,54,42,56,29,34,13],
  "Deuteronomy":[46,37,29,49,33,25,26,20,29,22,32,32,18,29,23,22,20,22,21,20,23,30,25,22,19,19,26,68,29,20,30,52,29,12],
  "Joshua":[18,24,17,24,15,27,26,35,27,43,23,24,33,15,63,10,18,28,51,9,45,34,16,33],
  "Judges":[36,23,31,24,31,40,25,35,57,18,40,15,25,20,20,31,13,31,30,48,25],
  "Ruth":[22,23,18,22],
  "1 Samuel":[28,36,21,22,12,21,17,22,27,27,15,25,23,52,35,23,58,30,24,42,15,23,29,22,44,25,12,25,11,31,13],
  "2 Samuel":[27,32,39,12,25,23,29,18,13,19,27,31,39,33,37,23,29,33,43,26,22,51,39,25],
  "1 Kings":[53,46,28,34,18,38,51,66,28,29,43,33,34,31,34,34,24,46,21,43,29,53],
  "2 Kings":[18,25,27,44,27,33,20,29,37,36,21,21,25,29,38,20,41,37,37,21,26,20,37,20,30],
  "1 Chronicles":[54,55,24,43,26,81,40,40,44,14,47,40,14,17,29,43,27,17,19,8,30,19,32,31,31,32,34,21,30],
  "2 Chronicles":[17,18,17,22,14,42,22,18,31,19,23,16,22,15,19,14,19,34,11,37,20,12,21,27,28,23,9,27,36,27,21,33,25,33,27,23],
  "Ezra":[11,70,13,24,17,22,28,36,15,44],
  "Nehemiah":[11,20,32,23,19,19,73,18,38,39,36,47,31],
  "Esther":[22,23,15,17,14,14,10,17,32,3],
  "Job":[22,13,26,21,27,30,21,22,35,22,20,25,28,22,35,22,16,21,29,29,34,30,17,25,6,14,23,28,25,31,40,22,33,37,16,33,24,41,30,24,34,17],
  "Psalms":[6,12,8,8,12,10,17,9,20,18,7,8,6,7,5,11,15,50,14,9,13,31,6,10,22,12,14,9,11,13,25,11,22,23,28,13,40,23,14,18,14,12,5,27,18,12,10,15,21,23,21,11,7,9,24,14,12,12,18,14,9,13,12,11,14,20,8,36,37,6,24,20,28,23,11,13,21,72,13,20,17,8,19,13,14,17,7,19,53,17,16,16,5,23,11,13,12,9,9,5,8,28,22,35,45,48,43,13,31,7,10,10,9,8,18,19,2,29,176,7,8,9,4,8,5,6,5,6,8,8,3,18,3,3,21,26,9,8,24,14,10,8,12,15,21,10,20,14,9,6],
  "Proverbs":[33,22,35,27,23,35,27,36,18,32,31,28,25,35,33,33,28,24,29,30,31,29,35,34,28,28,27,28,27,33,31],
  "Ecclesiastes":[18,26,22,16,20,12,29,17,18,20,10,14],
  "Song of Solomon":[17,17,11,16,16,13,13,14],
  "Isaiah":[31,22,26,6,30,13,25,22,21,34,16,6,22,32,9,14,14,7,25,6,17,25,18,23,12,21,13,29,24,33,9,20,24,17,10,22,38,22,8,31,29,25,28,28,25,13,15,22,26,11,23,15,12,17,13,12,21,14,21,22,11,12,19,12,25,24],
  "Jeremiah":[19,37,25,31,31,30,34,22,26,25,23,17,27,22,21,21,27,23,15,18,14,30,40,10,38,24,22,17,32,24,40,44,26,22,19,32,21,28,18,16,18,22,13,30,5,28,7,47,39,46,64,34],
  "Lamentations":[22,22,66,22,22],
  "Ezekiel":[28,10,27,17,17,14,27,18,11,22,25,28,23,23,8,63,24,32,14,49,32,31,49,27,17,21,36,26,21,26,18,32,33,31,15,38,28,23,29,49,26,20,27,31,25,24,23,35],
  "Daniel":[21,49,30,37,31,28,28,27,27,21,45,13],
  "Hosea":[11,23,5,19,15,11,16,14,17,15,12,14,16,9],
  "Joel":[20,32,21],
  "Amos":[15,16,15,13,27,14,17,14,15],
  "Obadiah":[21],
  "Jonah":[17,10,10,11],
  "Micah":[16,13,12,13,15,16,20],
  "Nahum":[15,13,19],
  "Habakkuk":[17,20,19],
  "Zephaniah":[18,15,20],
  "Haggai":[15,23],
  "Zechariah":[21,13,10,14,11,15,14,23,17,12,17,14,9,21],
  "Malachi":[14,17,18,6],
  "Matthew":[25,23,17,25,48,34,29,34,38,42,30,50,58,36,39,28,27,35,30,34,46,46,39,51,46,75,66,20],
  "Mark":[45,28,35,41,43,56,37,38,50,52,33,44,37,72,47,20],
  "Luke":[80,52,38,44,39,49,50,56,62,42,54,59,35,35,32,31,37,43,48,47,38,71,56,53],
  "John":[51,25,36,54,47,71,53,59,41,42,57,50,38,31,27,33,26,40,42,31,25],
  "Acts":[26,47,26,37,42,15,60,40,43,48,30,25,52,28,41,40,44,13,38,51,33,48,40,44,52,33,44,37],
  "Romans":[32,29,31,25,21,23,25,39,33,21,36,21,14,23,33,27],
  "1 Corinthians":[31,16,23,21,13,20,40,34,53,22,24,46,21,19,27,24],
  "2 Corinthians":[24,17,18,18,21,18,16,24,15,18,33,21,14],
  "Galatians":[24,21,29,31,26,18],
  "Ephesians":[23,22,21,28,20,32],
  "Philippians":[30,30,21,23],
  "Colossians":[29,23,25,18],
  "1 Thessalonians":[10,20,13,18,28],
  "2 Thessalonians":[12,17,18],
  "1 Timothy":[20,15,16,16,25,21],
  "2 Timothy":[18,26,17,22],
  "Titus":[16,15,15],
  "Philemon":[25],
  "Hebrews":[14,18,19,16,14,20,28,13,28,39,40,29,25],
  "James":[27,26,18,17,20],
  "1 Peter":[25,25,22,19,14],
  "2 Peter":[21,22,18],
  "1 John":[10,29,24,21,21],
  "2 John":[13],
  "3 John":[14],
  "Jude":[25],
  "Revelation":[20,29,22,11,14,17,17,13,21,11,19,17,18,20,8,21,18,24,21,15,27,21],
};
const DEFAULT_VERSE_COUNT = 28;

function getVerseCount(bookName, chapter) {
  const chapters = VERSE_COUNTS_BY_BOOK[bookName];
  if (!chapters) return DEFAULT_VERSE_COUNT;
  return chapters[chapter - 1] ?? DEFAULT_VERSE_COUNT;
}

// Artifact XP multipliers
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
    return wallets.sort((a, b) => (b.xpBalance ?? 0) - (a.xpBalance ?? 0))[0];
  }
  return await base44.asServiceRole.entities.UserWallet.create({
    userId,
    xpBalance: 0,
    level: 1,
    updatedAt: new Date().toISOString(),
  });
}

async function getEquippedMultiplier(base44, userId) {
  const equipped = await base44.asServiceRole.entities.ArtifactOwnership.filter({ 'data.userId': userId, 'data.isEquipped': true });
  let multiplier = 1.0;
  for (const artifact of equipped) {
    multiplier *= ARTIFACT_BOOSTS[artifact.artifactId] ?? 1.0;
  }
  return multiplier;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { chapters } = body;

    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return Response.json({ error: 'chapters array is required' }, { status: 400 });
    }

    for (const ch of chapters) {
      if (ch.userId !== user.id) return Response.json({ error: 'Forbidden: userId mismatch' }, { status: 403 });
      if (!ch.chapterId || !ch.dateKey) return Response.json({ error: 'Each chapter must have chapterId and dateKey' }, { status: 400 });
    }

    const userId = user.id;

    // Batch lookup existing logs for all relevant dates
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
        existingSet.add(key);
      }
    }

    if (toCreate.length === 0) {
      const wallet = await getOrCreateWallet(base44, userId);
      return Response.json({ created: [], skipped, wallet });
    }

    // Bulk create reading logs
    const createdLogs = await base44.asServiceRole.entities.ReadingLog.bulkCreate(toCreate);

    // Get equipped artifact multiplier
    const multiplier = await getEquippedMultiplier(base44, userId);
    const now = new Date().toISOString();
    const wallet = await getOrCreateWallet(base44, userId);

    // Build idempotency keys to check
    const chapterIdempotencyKeys = toCreate.map(ch => `chapter_read:${userId}:${ch.chapterId}:${ch.dateKey}`);
    const dailyBonusKeys = dateKeys.map(dk => `daily_bonus:${userId}:${dk}`);
    const allKeysToCheck = [...chapterIdempotencyKeys, ...dailyBonusKeys];

    const existingTxBatch = await Promise.all(
      allKeysToCheck.map(key =>
        base44.asServiceRole.entities.XPTransaction.filter({ 'data.userId': userId, 'data.idempotencyKey': key })
      )
    );
    const existingKeySet = new Set(
      existingTxBatch.flatMap((txs, i) => txs.length > 0 ? [allKeysToCheck[i]] : [])
    );

    let totalXpGained = 0;
    const xpTransactions = [];

    // Chapter XP: 2 XP per verse * multiplier
    for (const ch of toCreate) {
      const idempotencyKey = `chapter_read:${userId}:${ch.chapterId}:${ch.dateKey}`;
      if (!existingKeySet.has(idempotencyKey)) {
        const verses = getVerseCount(ch.book, ch.chapter);
        const xpAmount = Math.floor(verses * XP_PER_VERSE * multiplier);
        xpTransactions.push({
          userId,
          type: 'earn_xp',
          source: 'chapter_read',
          amount: xpAmount,
          idempotencyKey,
          metadataJson: JSON.stringify({ chapterId: ch.chapterId, dateKey: ch.dateKey, verses, baseXp: verses * XP_PER_VERSE, multiplier }),
          createdAt: now,
        });
        totalXpGained += xpAmount;
      }
    }

    // Daily bonus: 100 XP * multiplier if total verses read on that day >= 30
    for (const dk of dateKeys) {
      const bonusKey = `daily_bonus:${userId}:${dk}`;
      if (existingKeySet.has(bonusKey)) continue;

      // Sum all verses read that day (existing + newly created)
      const existingDayLogs = existingLogs.filter(l => l.dateKey === dk);
      const newDayChapters = toCreate.filter(c => c.dateKey === dk);
      const allDayChapters = [
        ...existingDayLogs.map(l => ({ book: l.book, chapter: l.chapter })),
        ...newDayChapters.map(c => ({ book: c.book, chapter: c.chapter })),
      ];
      const totalVersesToday = allDayChapters.reduce((sum, c) => sum + getVerseCount(c.book, c.chapter), 0);

      if (totalVersesToday >= DAILY_BONUS_VERSE_THRESHOLD) {
        const bonusAmount = Math.floor(DAILY_BONUS_XP * multiplier);
        xpTransactions.push({
          userId,
          type: 'earn_xp_bonus',
          source: 'daily_bonus',
          amount: bonusAmount,
          idempotencyKey: bonusKey,
          metadataJson: JSON.stringify({ dateKey: dk, totalVersesToday, multiplier }),
          createdAt: now,
        });
        totalXpGained += bonusAmount;
      }
    }

    if (xpTransactions.length > 0) {
      await base44.asServiceRole.entities.XPTransaction.bulkCreate(xpTransactions);

      const newXpBalance = (wallet.xpBalance ?? 0) + totalXpGained;
      const newLevel = Math.floor(newXpBalance / 1000) + 1;
      await base44.asServiceRole.entities.UserWallet.update(wallet.id, {
        xpBalance: newXpBalance,
        level: newLevel,
        updatedAt: now,
      });
      wallet.xpBalance = newXpBalance;
      wallet.level = newLevel;
    }

    return Response.json({
      created: Array.isArray(createdLogs) ? createdLogs : toCreate,
      skipped,
      xpGranted: totalXpGained,
      multiplier,
      wallet,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});