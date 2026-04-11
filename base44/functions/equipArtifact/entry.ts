import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const artifacts = [
  { artifactId: 'ark-of-the-covenant', xpBoost: 1.20 },
  { artifactId: 'sword-goliath', xpBoost: 1.15 },
  { artifactId: 'coat-of-many-colors', xpBoost: 1.11 },
  { artifactId: 'sling-of-david', xpBoost: 1.12 },
  { artifactId: 'davids-harp', xpBoost: 1.13 },
  { artifactId: 'jar-of-manna', xpBoost: 1.08 },
  { artifactId: 'noahs-hammer', xpBoost: 1.09 },
  { artifactId: 'clay-lamp', xpBoost: undefined },
  { artifactId: 'rod-of-peter', xpBoost: undefined },
  { artifactId: 'shepherds-staff', xpBoost: undefined },
];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { artifactId, equip } = body;
  if (!artifactId) return Response.json({ error: 'artifactId is required' }, { status: 400 });
  if (equip === undefined) return Response.json({ error: 'equip (boolean) is required' }, { status: 400 });

  const artifact = artifacts.find(a => a.artifactId === artifactId);
  if (!artifact) return Response.json({ error: 'Artifact not found' }, { status: 404 });

  // Verify ownership
  const ownership = await base44.asServiceRole.entities.ArtifactOwnership.filter({ userId: user.id, artifactId });
  if (!ownership.length) return Response.json({ error: 'You do not own this artifact' }, { status: 403 });

  // If equipping, first unequip any currently equipped artifact
  if (equip) {
    const currentlyEquipped = await base44.asServiceRole.entities.ArtifactOwnership.filter({ userId: user.id, isEquipped: true });
    for (const o of currentlyEquipped) {
      if (o.artifactId !== artifactId) {
        await base44.asServiceRole.entities.ArtifactOwnership.update(o.id, { isEquipped: false, equippedAt: null });
      }
    }
  }

  // Update equip state for this artifact
  await base44.asServiceRole.entities.ArtifactOwnership.update(ownership[0].id, {
    isEquipped: equip,
    equippedAt: equip ? new Date().toISOString() : null,
  });

  // Recalculate multiplier from all equipped artifacts
  const allEquipped = await base44.asServiceRole.entities.ArtifactOwnership.filter({ userId: user.id, isEquipped: true });
  const equippedIds = allEquipped.map(o => o.artifactId);
  let totalMultiplier = 1.0;
  for (const o of allEquipped) {
    const art = artifacts.find(a => a.artifactId === o.artifactId);
    if (art?.xpBoost) totalMultiplier *= art.xpBoost;
  }

  await base44.asServiceRole.entities.User.update(user.id, { equippedArtifactIds: equippedIds });

  return Response.json({
    success: true,
    action: equip ? 'equipped' : 'unequipped',
    equippedArtifacts: equippedIds,
    totalMultiplier: parseFloat(totalMultiplier.toFixed(2)),
  });
});