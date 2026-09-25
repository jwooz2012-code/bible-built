// Saves a Bible Challenge attempt; each medal's XP is awarded once per challenge so retakes can't farm it.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Must match src/data/challenges/index.js.
const CHALLENGE_TOTALS: Record<string, number> = { hosea: 10 };
const MEDALS = [
  { id: 'bronze', minRatio: 0.6, xp: 100 },
  { id: 'silver', minRatio: 0.8, xp: 150 },
  { id: 'gold', minRatio: 1, xp: 250 },
];

async function getOrCreateWallet(base44, userId) {
  // Oldest wallet is canonical, consistent with logChapterRead.
  const wallets = await base44.asServiceRole.entities.UserWallet.filter({ 'data.userId': userId }, 'created_date', 10);
  if (wallets.length > 0) return wallets[0];
  return await base44.asServiceRole.entities.UserWallet.create({
    userId,
    xpBalance: 0,
    level: 1,
    updatedAt: new Date().toISOString(),
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { challengeId, score, total, questionIds = [] } = await req.json().catch(() => ({}));
    const expectedTotal = CHALLENGE_TOTALS[challengeId];
    if (!expectedTotal) return Response.json({ error: 'Unknown challenge' }, { status: 400 });
    if (total !== expectedTotal || !Number.isInteger(score) || score < 0 || score > total) {
      return Response.json({ error: 'Invalid score' }, { status: 400 });
    }
    if (!Array.isArray(questionIds) || questionIds.some((id) => typeof id !== 'string')) {
      return Response.json({ error: 'Invalid questionIds' }, { status: 400 });
    }

    const userId = user.id;
    const now = new Date().toISOString();
    const ratio = score / total;
    const reached = MEDALS.filter((m) => ratio >= m.minRatio);
    const medal = reached.length ? reached[reached.length - 1].id : 'none';

    const attempt = await base44.asServiceRole.entities.ChallengeAttempt.create({
      userId,
      challengeId,
      score,
      total,
      medal,
      questionIds: questionIds.slice(0, total),
      completedAt: now,
    });

    const existing = await Promise.all(reached.map((m) =>
      base44.asServiceRole.entities.XPTransaction.filter({
        'data.userId': userId,
        'data.idempotencyKey': `challenge_medal:${userId}:${challengeId}:${m.id}`,
      })
    ));
    const newMedals = reached.filter((_, i) => existing[i].length === 0);

    const wallet = await getOrCreateWallet(base44, userId);
    let xpAwarded = 0;
    if (newMedals.length > 0) {
      await base44.asServiceRole.entities.XPTransaction.bulkCreate(newMedals.map((m) => ({
        userId,
        type: 'earn_xp_bonus',
        source: 'challenge_medal',
        amount: m.xp,
        idempotencyKey: `challenge_medal:${userId}:${challengeId}:${m.id}`,
        metadataJson: JSON.stringify({ challengeId, medal: m.id, score, total }),
        createdAt: now,
      })));
      xpAwarded = newMedals.reduce((sum, m) => sum + m.xp, 0);
      const newXpBalance = (wallet.xpBalance ?? wallet.spendableXp ?? wallet.progressXpTotal ?? 0) + xpAwarded;
      const newLevel = Math.floor(newXpBalance / 1000) + 1;
      await base44.asServiceRole.entities.UserWallet.update(wallet.id, { xpBalance: newXpBalance, level: newLevel, updatedAt: now });
      wallet.xpBalance = newXpBalance;
      wallet.level = newLevel;
    }

    const allAttempts = await base44.asServiceRole.entities.ChallengeAttempt.filter({ 'data.userId': userId });
    const perfects = new Set(allAttempts.filter((a) => a.medal === 'gold').map((a) => a.challengeId)).size;

    return Response.json({
      attempt,
      medal,
      xpAwarded,
      newMedals: newMedals.map((m) => m.id),
      wallet,
      stats: { attempts: allAttempts.length, perfects },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
