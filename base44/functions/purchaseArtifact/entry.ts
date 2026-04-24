/**
 * purchaseArtifact
 *
 * Secure artifact purchase — deducts from unified xpBalance.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const RARITY_COST = {
  common:    6000,
  rare:      24000,
  epic:      48000,
  legendary: 102000,
};

const ARTIFACT_CATALOG = [
  { artifactId: 'ark-of-the-covenant', rarity: 'legendary', xpBoost: 1.25 },
  { artifactId: 'sword-goliath',        rarity: 'legendary', xpBoost: 1.25 },
  { artifactId: 'coat-of-many-colors',  rarity: 'epic',      xpBoost: 1.15 },
  { artifactId: 'sling-of-david',       rarity: 'epic',      xpBoost: 1.15 },
  { artifactId: 'davids-harp',          rarity: 'rare',      xpBoost: 1.10 },
  { artifactId: 'jar-of-manna',         rarity: 'rare',      xpBoost: 1.10 },
  { artifactId: 'noahs-hammer',         rarity: 'rare',      xpBoost: 1.10 },
  { artifactId: 'clay-lamp',            rarity: 'common',    xpBoost: 1.05 },
  { artifactId: 'rod-of-peter',         rarity: 'common',    xpBoost: 1.05 },
  { artifactId: 'shepherds-staff',      rarity: 'common',    xpBoost: 1.05 },
];

async function getOrCreateWallet(base44, userId) {
  const wallets = await base44.asServiceRole.entities.UserWallet.filter({ 'data.userId': userId }, '-created_date', 5);
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { artifactId } = body;
    if (!artifactId) return Response.json({ error: 'artifactId is required' }, { status: 400 });

    const artifact = ARTIFACT_CATALOG.find(a => a.artifactId === artifactId);
    if (!artifact) return Response.json({ error: 'Artifact not found' }, { status: 404 });

    const cost = RARITY_COST[artifact.rarity];
    if (cost === undefined) return Response.json({ error: 'Invalid artifact rarity' }, { status: 400 });

    const userId = user.id;
    const purchaseIdempotencyKey = `artifact_purchase:${userId}:${artifactId}`;

    // Idempotency check
    const existingTx = await base44.asServiceRole.entities.XPTransaction.filter({
      'data.userId': userId,
      'data.idempotencyKey': purchaseIdempotencyKey,
    });
    if (existingTx.length > 0) {
      const existing = await base44.asServiceRole.entities.ArtifactOwnership.filter({ 'data.userId': userId, 'data.artifactId': artifactId });
      const wallet = await getOrCreateWallet(base44, userId);
      return Response.json({ success: true, alreadyPurchased: true, artifact, wallet, ownership: existing[0] });
    }

    // Check if already owned
    const existingOwnership = await base44.asServiceRole.entities.ArtifactOwnership.filter({ 'data.userId': userId, 'data.artifactId': artifactId });
    if (existingOwnership.length > 0) {
      return Response.json({ error: 'You already own this artifact' }, { status: 400 });
    }

    // Load wallet and check balance
    const wallet = await getOrCreateWallet(base44, userId);
    const currentBalance = wallet.xpBalance ?? 0;
    if (currentBalance < cost) {
      return Response.json({ error: 'Insufficient XP', required: cost, current: currentBalance }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newBalance = currentBalance - cost;

    // Record spend transaction
    await base44.asServiceRole.entities.XPTransaction.create({
      userId,
      type: 'spend_xp',
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

    // Deduct from unified wallet
    const newLevel = Math.floor(newBalance / 1000) + 1;
    const updatedWallet = await base44.asServiceRole.entities.UserWallet.update(wallet.id, {
      xpBalance: newBalance,
      level: newLevel,
      updatedAt: now,
    });

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