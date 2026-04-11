import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const artifacts = [
  { artifactId: 'ark-of-the-covenant', xpCost: 18000, xpBoost: 1.20 },
  { artifactId: 'sword-goliath', xpCost: 15000, xpBoost: 1.15 },
  { artifactId: 'coat-of-many-colors', xpCost: 9500, xpBoost: 1.11 },
  { artifactId: 'sling-of-david', xpCost: 12000, xpBoost: 1.12 },
  { artifactId: 'davids-harp', xpCost: 8500, xpBoost: 1.13 },
  { artifactId: 'jar-of-manna', xpCost: 4600, xpBoost: 1.08 },
  { artifactId: 'noahs-hammer', xpCost: 5200, xpBoost: 1.09 },
  { artifactId: 'clay-lamp', xpCost: 800, xpBoost: undefined },
  { artifactId: 'rod-of-peter', xpCost: 2100, xpBoost: undefined },
  { artifactId: 'shepherds-staff', xpCost: 1500, xpBoost: undefined },
];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { artifactId } = body;
  if (!artifactId) return Response.json({ error: 'artifactId is required' }, { status: 400 });

  const artifact = artifacts.find(a => a.artifactId === artifactId);
  if (!artifact) return Response.json({ error: 'Artifact not found' }, { status: 404 });

  // Check user XP
  const users = await base44.asServiceRole.entities.User.filter({ id: user.id });
  const currentUser = users[0];
  if (!currentUser) return Response.json({ error: 'User not found' }, { status: 404 });

  const currentXP = currentUser.xp ?? 0;
  if (currentXP < artifact.xpCost) {
    return Response.json({ error: 'Insufficient XP', required: artifact.xpCost, current: currentXP }, { status: 400 });
  }

  // Check if already owned
  const existing = await base44.asServiceRole.entities.ArtifactOwnership.filter({ userId: user.id, artifactId });
  if (existing.length > 0) return Response.json({ error: 'You already own this artifact' }, { status: 400 });

  const now = new Date().toISOString();

  // Create ownership + purchase history
  await Promise.all([
    base44.asServiceRole.entities.ArtifactOwnership.create({ userId: user.id, artifactId, acquiredAt: now, isEquipped: false }),
    base44.asServiceRole.entities.ArtifactPurchaseHistory.create({ userId: user.id, artifactId, xpSpent: artifact.xpCost, purchasedAt: now }),
  ]);

  // Deduct XP and update user
  const newXP = currentXP - artifact.xpCost;
  const newArtifactCount = (currentUser.totalArtifactsOwned ?? 0) + 1;
  await base44.asServiceRole.entities.User.update(user.id, {
    xp: newXP,
    totalArtifactsOwned: newArtifactCount,
    lastArtifactPurchaseAt: now,
  });

  return Response.json({
    success: true,
    artifact,
    xpRemaining: newXP,
    totalArtifactsOwned: newArtifactCount,
  });
});