/**
 * grantMilestoneReward
 * 
 * Server-side trusted function for milestone-based treasury currency grants.
 * Every milestone is idempotent — repeated calls with the same milestoneKey are safe.
 * 
 * Milestone currency rules:
 *   daily_reading_complete  → +10
 *   daily_goal_hit          → +25
 *   streak_7                → +100
 *   streak_30               → +500
 *   book_complete           → +200
 * 
 * Body: { milestoneKey: string, source: string, metadataJson?: string }
 *   milestoneKey must be globally unique for the event, e.g.:
 *     "daily_goal_hit:userId:2024-01-15"
 *     "streak_7:userId:2024-01-15"
 *     "book_complete:userId:Genesis"
 * 
 * Returns: { granted: bool, currencyAwarded: number, wallet: {...} }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MILESTONE_CURRENCY = {
  daily_reading_complete: 10,
  daily_goal_hit: 25,
  streak_7: 100,
  streak_30: 500,
  book_complete: 200,
};

async function getOrCreateWallet(base44, userId) {
  const wallets = await base44.asServiceRole.entities.UserWallet.filter({ userId });
  if (wallets.length > 0) return wallets[0];
  
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
    const { milestoneKey, source, metadataJson } = body;

    if (!milestoneKey || !source) {
      return Response.json({ error: 'milestoneKey and source are required' }, { status: 400 });
    }

    const currencyAmount = MILESTONE_CURRENCY[source];
    if (currencyAmount === undefined) {
      return Response.json({ error: `Unknown milestone source: ${source}` }, { status: 400 });
    }

    const userId = user.id;

    // Idempotency check — milestoneKey must be globally unique per event
    const idempotencyKey = `milestone:${userId}:${milestoneKey}`;
    const existing = await base44.asServiceRole.entities.XPTransaction.filter({
      userId,
      idempotencyKey,
    });
    if (existing.length > 0) {
      const wallet = await getOrCreateWallet(base44, userId);
      return Response.json({ granted: false, currencyAwarded: 0, wallet, reason: 'already_granted' });
    }

    const now = new Date().toISOString();
    const wallet = await getOrCreateWallet(base44, userId);
    const newBalance = (wallet.treasuryCurrencyBalance ?? 0) + currencyAmount;

    // Record transaction
    await base44.asServiceRole.entities.XPTransaction.create({
      userId,
      type: 'earn_currency',
      source,
      amount: currencyAmount,
      idempotencyKey,
      metadataJson: metadataJson ?? JSON.stringify({ milestoneKey }),
      createdAt: now,
    });

    // Update wallet
    const updatedWallet = await base44.asServiceRole.entities.UserWallet.update(wallet.id, {
      treasuryCurrencyBalance: newBalance,
      updatedAt: now,
    });

    return Response.json({ granted: true, currencyAwarded: currencyAmount, wallet: updatedWallet });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});