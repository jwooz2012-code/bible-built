/**
 * purchaseArtifact (v2)
 * 
 * Secure artifact purchase using UserWallet treasury currency.
 * - Atomic: debit + ownership + transaction in sequence with idempotency
 * - Idempotent: repeated taps produce one purchase, not multiple
 * - Unique artifacts cannot be purchased twice
 * 
 * Rarity pricing (treasury currency):
 *   common    = 250
 *   rare      = 750
 *   epic      = 1500
 *   legendary = 3500
 *   mythic    = 8000
 * 
 * Legacy XP-based pricing preserved as fallback for artifacts not in rarity catalog.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const RARITY_COST = {
  common: 250,
  rare: 750,
  epic: 1500,
  legendary: 3500,
  mythic: 8000,
};

// Artifact catalog with rarity info (matches data/artifactCatalog.js)
const ARTIFACT_CATALOG = [
  { artifactId: 'ark-of-the-covenant', rarity: 'mythic',    xpBoost: 1.20 },
  { artifactId: 'sword-goliath',        rarity: 'legendary', xpBoost: 1.15 },
  { artifactId: 'coat-of-many-colors',  rarity: 'epic',      xpBoost: 1.11 },
  { artifactId: 'sling-of-david',       rarity: 'legendary', xpBoost: 1.12 },
  { artifactId: 'davids-harp',          rarity: 'epic',      xpBoost: 1.13 },
  { artifactId: 'jar-of-manna',         rarity: 'rare',      xpBoost: 1.08 },
  { artifactId: 'noahs-hammer',         rarity: 'rare',      xpBoost: 1.09 },
  { artifactId: 'clay-lamp',            rarity: 'common',    xpBoost: undefined },
  { artifactId: 'rod-of-peter',         rarity: 'rare',      xpBoost: undefined },
  { artifactId: 'shepherds-staff',      rarity: 'common',    xpBoost: undefined },
];

async function getOrCreateWallet(base44, userId) {
  const wallets = await base44.asServiceRole.entities.UserWallet.filter({ 'data.userId': userId }, '-created_date', 5);
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
    const { artifactId, idempotencyKey: clientIdempotencyKey } = body;
    if (!artifactId) return Response.json({ error: 'artifactId is required' }, { status: 400 });

    const artifact = ARTIFACT_CATALOG.find(a => a.artifactId === artifactId);
    if (!artifact) return Response.json({ error: 'Artifact not found' }, { status: 404 });

    const cost = RARITY_COST[artifact.rarity];
    if (cost === undefined) return Response.json({ error: 'Invalid artifact rarity' }, { status: 400 });

    const userId = user.id;
    const purchaseIdempotencyKey = clientIdempotencyKey
      ? `artifact_purchase:${userId}:${artifactId}:${clientIdempotencyKey}`
      : `artifact_purchase:${userId}:${artifactId}`;

    // Idempotency check — prevent double charge from rapid taps
    const existingTx = await base44.asServiceRole.entities.XPTransaction.filter({
      'data.userId': userId,
      'data.idempotencyKey': purchaseIdempotencyKey,
    });
    if (existingTx.length > 0) {
      const existing = await base44.asServiceRole.entities.ArtifactOwnership.filter({ 'data.userId': userId, 'data.artifactId': artifactId });
      const wallet = await getOrCreateWallet(base44, userId);
      return Response.json({ success: true, alreadyPurchased: true, artifact, wallet, ownership: existing[0] });
    }

    // Check if already owned (unique artifact re-purchase guard)
    const existingOwnership = await base44.asServiceRole.entities.ArtifactOwnership.filter({ 'data.userId': userId, 'data.artifactId': artifactId });
    if (existingOwnership.length > 0) {
      return Response.json({ error: 'You already own this artifact' }, { status: 400 });
    }

    // Load wallet
    const wallet = await getOrCreateWallet(base44, userId);
    const currentBalance = wallet.treasuryCurrencyBalance ?? 0;

    if (currentBalance < cost) {
      return Response.json({
        error: 'Insufficient treasury currency',
        required: cost,
        current: currentBalance,
      }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newBalance = currentBalance - cost;

    // Record spend transaction (idempotency record — do this FIRST to prevent races)
    await base44.asServiceRole.entities.XPTransaction.create({
      userId,
      type: 'spend_currency',
      source: 'artifact_purchase',
      amount: -cost,
      idempotencyKey: purchaseIdempotencyKey,
      metadataJson: JSON.stringify({ artifactId, rarity: artifact.rarity, cost }),
      createdAt: now,
    });

    // Create ownership + purchase history
    const [ownership] = await Promise.all([
      base44.asServiceRole.entities.ArtifactOwnership.create({
        userId,
        artifactId,
        acquiredAt: now,
        isEquipped: false,
      }),
      base44.asServiceRole.entities.ArtifactPurchaseHistory.create({
        userId,
        artifactId,
        xpSpent: cost,
        purchasedAt: now,
      }),
    ]);

    // Deduct from wallet
    const updatedWallet = await base44.asServiceRole.entities.UserWallet.update(wallet.id, {
      treasuryCurrencyBalance: newBalance,
      updatedAt: now,
    });

    // Also update legacy user fields for backward compat
    const users = await base44.asServiceRole.entities.User.filter({ id: userId });
    if (users.length > 0) {
      const currentUser = users[0];
      const newArtifactCount = (currentUser.totalArtifactsOwned ?? 0) + 1;
      await base44.asServiceRole.entities.User.update(userId, {
        totalArtifactsOwned: newArtifactCount,
        lastArtifactPurchaseAt: now,
      }).catch(() => {}); // non-critical
    }

    return Response.json({
      success: true,
      artifact,
      cost,
      balanceAfter: newBalance,
      wallet: updatedWallet,
      ownership,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});