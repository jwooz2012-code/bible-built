/**
 * auditAndFixAllUsersXp
 *
 * Admin-only. Recalculates every user's xpBalance PURELY from ReadingLog verse math.
 * Ignores XPTransaction ledger entirely (it's incomplete for legacy users).
 * Formula: sum(verses * 2 * multiplier_at_time) per unique chapter log,
 *          + 100 * multiplier bonus for each day with >= 30 verses,
 *          - total XP spent on artifact purchases (from ArtifactPurchaseHistory, deduped).
 * 
 * NOTE: multiplier used is multiplier=1.0 for all history (no artifact was equipped during
 * reading for most users, and we can't reconstruct when they equipped). This gives a clean
 * floor. Future reads will correctly apply the current multiplier.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const XP_PER_VERSE = 2;
const DAILY_BONUS_XP = 100;
const DAILY_BONUS_THRESHOLD = 30;

const VERSE_COUNTS = {
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

function getVerseCount(book, chapter) {
  const chapters = VERSE_COUNTS[book];
  if (!chapters) return 28;
  return chapters[chapter - 1] ?? 28;
}

async function auditUser(base44, userId) {
  const [logs, purchaseHistory] = await Promise.all([
    base44.asServiceRole.entities.ReadingLog.filter({ 'data.userId': userId }, '-created_date', 5000),
    base44.asServiceRole.entities.ArtifactPurchaseHistory.filter({ 'data.userId': userId }, '-created_date', 200),
  ]);

  // Deduplicate logs by chapterId (unique chapters only, ignore same chapter on different days)
  const seenChapters = new Set();
  const uniqueLogs = [];
  for (const log of logs) {
    if (!seenChapters.has(log.chapterId)) {
      seenChapters.add(log.chapterId);
      uniqueLogs.push(log);
    }
  }

  // Group unique logs by dateKey for daily bonus calculation
  const byDay = {};
  for (const log of uniqueLogs) {
    const dk = log.dateKey || log.timestamp?.slice(0, 10) || 'unknown';
    if (!byDay[dk]) byDay[dk] = [];
    byDay[dk].push(log);
  }

  // Calculate XP: 2 XP per verse, +100 bonus per day with >= 30 verses
  // Use multiplier=1.0 for all historical reads (clean baseline)
  let earnedXp = 0;
  for (const dayLogs of Object.values(byDay)) {
    const dayVerses = dayLogs.reduce((sum, log) => sum + getVerseCount(log.book, log.chapter), 0);
    earnedXp += dayVerses * XP_PER_VERSE;
    if (dayVerses >= DAILY_BONUS_THRESHOLD) earnedXp += DAILY_BONUS_XP;
  }

  // XP spent on artifacts — deduplicate by artifactId
  const seenArtifacts = new Set();
  let totalSpent = 0;
  for (const p of purchaseHistory) {
    if (!seenArtifacts.has(p.artifactId)) {
      seenArtifacts.add(p.artifactId);
      totalSpent += Math.abs(p.xpSpent ?? 0);
    }
  }

  const finalXp = Math.max(0, earnedXp - totalSpent);
  const level = Math.floor(finalXp / 1000) + 1;

  // Update wallet — keep oldest as canonical, delete duplicates
  const wallets = await base44.asServiceRole.entities.UserWallet.filter({ 'data.userId': userId }, 'created_date', 10);
  const now = new Date().toISOString();
  let prevXp = 0;

  if (wallets.length > 1) {
    for (const dup of wallets.slice(1)) {
      try { await base44.asServiceRole.entities.UserWallet.delete(dup.id); } catch(e) {}
    }
  }

  if (wallets.length > 0) {
    prevXp = wallets[0].xpBalance ?? wallets[0].spendableXp ?? 0;
    await base44.asServiceRole.entities.UserWallet.update(wallets[0].id, { xpBalance: finalXp, level, updatedAt: now });
  } else {
    await base44.asServiceRole.entities.UserWallet.create({ userId, xpBalance: finalXp, level, updatedAt: now });
  }

  return {
    finalXp,
    level,
    uniqueChapters: uniqueLogs.length,
    earnedXp,
    totalSpent,
    prevXp,
    walletAction: `${prevXp} → ${finalXp}`,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const batchOffset = body.batchOffset ?? 0;
    const batchSize = body.batchSize ?? 5;

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
    const totalUsers = allUsers.length;
    const batch = allUsers.slice(batchOffset, batchOffset + batchSize);

    let updated = 0;
    let errors = 0;
    const results = [];

    for (const currentUser of batch) {
      try {
        const data = await auditUser(base44, currentUser.id);
        results.push({
          userId: currentUser.id,
          email: currentUser.email,
          xpBalance: data.finalXp,
          level: data.level,
          uniqueChapters: data.uniqueChapters,
          earnedXp: data.earnedXp,
          spent: data.totalSpent,
          walletAction: data.walletAction,
          status: 'updated',
        });
        updated++;
      } catch (err) {
        errors++;
        results.push({ userId: currentUser.id, email: currentUser.email, status: 'error', error: err.message });
      }

      // Throttle to avoid rate limits
      if (batch.indexOf(currentUser) < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const nextOffset = batchOffset + batchSize;
    const done = nextOffset >= totalUsers;

    return Response.json({ success: true, totalUsers, updated, errors, results, nextOffset: done ? null : nextOffset, done });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});