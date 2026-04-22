/**
 * backfillTreasury
 * 
 * Backfills treasury currency for the calling user based on their reading history.
 * Safe to call multiple times — uses idempotency keys.
 * 
 * Currency earned:
 *   - 10 ₡ per unique day with at least 1 chapter read (daily_reading_complete)
 *   - 200 ₡ per completed book (book_complete) — each book counted once
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = user.id;
    const now = new Date().toISOString();

    // Load all reading logs for this user
    const logs = await base44.asServiceRole.entities.ReadingLog.filter(
      { 'data.userId': userId }, '-created_date', 5000
    );

    // Load all existing transactions to avoid double-counting
    const existingTxns = await base44.asServiceRole.entities.XPTransaction.filter({
      'data.userId': userId,
    }, '-created_date', 5000);
    const existingKeys = new Set(existingTxns.map(t => t.idempotencyKey));

    // Load wallet
    const wallets = await base44.asServiceRole.entities.UserWallet.filter(
      { 'data.userId': userId }, '-created_date', 10
    );
    if (wallets.length === 0) {
      return Response.json({ error: 'No wallet found. Visit Treasury first.' }, { status: 404 });
    }
    const wallet = wallets.sort((a, b) => (b.progressXpTotal ?? 0) - (a.progressXpTotal ?? 0))[0];

    const txnsToCreate = [];
    let totalCurrencyToAdd = 0;

    // --- Daily reading complete: 10 ₡ per unique day ---
    const uniqueDays = new Set(logs.map(l => l.dateKey).filter(Boolean));
    for (const dateKey of uniqueDays) {
      const key = `milestone:${userId}:daily_reading_complete:${dateKey}`;
      if (!existingKeys.has(key)) {
        txnsToCreate.push({
          userId,
          type: 'earn_currency',
          source: 'daily_reading_complete',
          amount: 10,
          idempotencyKey: key,
          metadataJson: JSON.stringify({ milestoneKey: `daily_reading_complete:${dateKey}`, backfill: true }),
          createdAt: now,
        });
        totalCurrencyToAdd += 10;
      }
    }

    // --- Book complete: 200 ₡ per completed book ---
    // Build a map of book -> total chapters in that book
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

    // Find completed books
    const chaptersReadByBook = {};
    for (const log of logs) {
      if (!log.book || !log.chapter) continue;
      if (!chaptersReadByBook[log.book]) chaptersReadByBook[log.book] = new Set();
      chaptersReadByBook[log.book].add(log.chapter);
    }

    for (const [book, chaptersRead] of Object.entries(chaptersReadByBook)) {
      const total = BOOK_CHAPTER_COUNTS[book];
      if (!total) continue;
      if (chaptersRead.size >= total) {
        const key = `milestone:${userId}:book_complete:${book}`;
        if (!existingKeys.has(key)) {
          txnsToCreate.push({
            userId,
            type: 'earn_currency',
            source: 'book_complete',
            amount: 200,
            idempotencyKey: key,
            metadataJson: JSON.stringify({ milestoneKey: `book_complete:${book}`, backfill: true }),
            createdAt: now,
          });
          totalCurrencyToAdd += 200;
        }
      }
    }

    // Create all new transactions one by one (bulkCreate not available)
    for (const txn of txnsToCreate) {
      await base44.asServiceRole.entities.XPTransaction.create(txn);
    }

    // Update wallet balance
    const newBalance = (wallet.treasuryCurrencyBalance ?? 0) + totalCurrencyToAdd;
    const updatedWallet = await base44.asServiceRole.entities.UserWallet.update(wallet.id, {
      treasuryCurrencyBalance: newBalance,
      updatedAt: now,
    });

    return Response.json({
      success: true,
      daysBackfilled: uniqueDays.size,
      txnsCreated: txnsToCreate.length,
      currencyAdded: totalCurrencyToAdd,
      newBalance,
      wallet: updatedWallet,
    });
  } catch (error) {
    console.log('[backfillTreasury] error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});