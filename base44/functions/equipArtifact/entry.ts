import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const artifacts = [
  { artifactId: 'davids-sling', rarity: 'rare', xpCost: 3500, category: 'weapon', xpBoost: undefined },
  { artifactId: 'samsons-jawbone', rarity: 'legendary', xpCost: 9000, category: 'weapon', xpBoost: undefined },
  { artifactId: 'sauls-spear', rarity: 'epic', xpCost: 6500, category: 'weapon', xpBoost: undefined },
  { artifactId: 'jonathans-bow', rarity: 'epic', xpCost: 7000, category: 'weapon', xpBoost: undefined },
  { artifactId: 'goliaths-sword', rarity: 'mythic', xpCost: 15000, category: 'weapon', xpBoost: 1.15 },
  { artifactId: 'moses-staff', rarity: 'mythic', xpCost: 18000, category: 'weapon', xpBoost: 1.20 },
  { artifactId: 'elijah-staff', rarity: 'epic', xpCost: 6000, category: 'weapon', xpBoost: undefined },
  { artifactId: 'peter-keys', rarity: 'rare', xpCost: 2500, category: 'weapon', xpBoost: undefined },
  { artifactId: 'shield-of-faith', rarity: 'legendary', xpCost: 10000, category: 'weapon', xpBoost: 1.10 },
  { artifactId: 'sword-of-spirit', rarity: 'legendary', xpCost: 11000, category: 'weapon', xpBoost: 1.12 },
  { artifactId: 'ark-covenant', rarity: 'mythic', xpCost: 25000, category: 'temple', xpBoost: 1.25 },
  { artifactId: 'golden-lampstand', rarity: 'rare', xpCost: 3000, category: 'temple', xpBoost: undefined },
  { artifactId: 'altar-incense', rarity: 'epic', xpCost: 7000, category: 'temple', xpBoost: undefined },
  { artifactId: 'stone-tablets', rarity: 'epic', xpCost: 8500, category: 'temple', xpBoost: 1.14 },
  { artifactId: 'temple-veil', rarity: 'legendary', xpCost: 12000, category: 'temple', xpBoost: 1.18 },
  { artifactId: 'priestly-breastplate', rarity: 'mythic', xpCost: 20000, category: 'temple', xpBoost: 1.22 },
  { artifactId: 'bronze-serpent', rarity: 'rare', xpCost: 4000, category: 'temple', xpBoost: undefined },
  { artifactId: 'urim-thummim', rarity: 'legendary', xpCost: 13000, category: 'temple', xpBoost: 1.16 },
  { artifactId: 'table-shewbread', rarity: 'epic', xpCost: 7500, category: 'temple', xpBoost: undefined },
  { artifactId: 'golden-calf', rarity: 'common', xpCost: 1000, category: 'temple', xpBoost: undefined },
  { artifactId: 'isaiah-scroll', rarity: 'legendary', xpCost: 11000, category: 'prophetic', xpBoost: 1.13 },
  { artifactId: 'jeremiahs-clay', rarity: 'common', xpCost: 800, category: 'prophetic', xpBoost: undefined },
  { artifactId: 'elijahs-mantle', rarity: 'legendary', xpCost: 12000, category: 'prophetic', xpBoost: 1.17 },
  { artifactId: 'ezekiels-wheel', rarity: 'mythic', xpCost: 22000, category: 'prophetic', xpBoost: 1.23 },
  { artifactId: 'daniels-lions', rarity: 'epic', xpCost: 8000, category: 'prophetic', xpBoost: undefined },
  { artifactId: 'jonahs-fish', rarity: 'rare', xpCost: 3500, category: 'prophetic', xpBoost: undefined },
  { artifactId: 'burning-bush', rarity: 'mythic', xpCost: 19000, category: 'prophetic', xpBoost: 1.20 },
  { artifactId: 'hoseas-scroll', rarity: 'rare', xpCost: 2800, category: 'prophetic', xpBoost: undefined },
  { artifactId: 'amos-plumb-line', rarity: 'common', xpCost: 1200, category: 'prophetic', xpBoost: undefined },
  { artifactId: 'zechariahs-lamp', rarity: 'epic', xpCost: 8000, category: 'prophetic', xpBoost: 1.11 },
  { artifactId: 'solomons-crown', rarity: 'mythic', xpCost: 21000, category: 'royal', xpBoost: 1.19 },
  { artifactId: 'davids-harp', rarity: 'legendary', xpCost: 10500, category: 'royal', xpBoost: 1.13 },
  { artifactId: 'queens-scepter', rarity: 'legendary', xpCost: 11500, category: 'royal', xpBoost: 1.16 },
  { artifactId: 'solomons-ring', rarity: 'epic', xpCost: 9000, category: 'royal', xpBoost: undefined },
  { artifactId: 'davidic-throne', rarity: 'epic', xpCost: 8500, category: 'royal', xpBoost: 1.12 },
  { artifactId: 'josephs-coat', rarity: 'legendary', xpCost: 13000, category: 'royal', xpBoost: 1.15 },
  { artifactId: 'cyrus-decree', rarity: 'rare', xpCost: 4500, category: 'royal', xpBoost: undefined },
  { artifactId: 'nehemiahs-cup', rarity: 'common', xpCost: 1500, category: 'royal', xpBoost: undefined },
  { artifactId: 'absalom-hair', rarity: 'common', xpCost: 900, category: 'royal', xpBoost: undefined },
  { artifactId: 'jeroboam-altar', rarity: 'rare', xpCost: 2000, category: 'royal', xpBoost: undefined },
  { artifactId: 'crown-of-thorns', rarity: 'mythic', xpCost: 30000, category: 'testament', xpBoost: 1.30 },
  { artifactId: 'lords-cup', rarity: 'mythic', xpCost: 28000, category: 'testament', xpBoost: 1.28 },
  { artifactId: 'five-loaves', rarity: 'legendary', xpCost: 11000, category: 'testament', xpBoost: 1.14 },
  { artifactId: 'emmaus-bread', rarity: 'epic', xpCost: 9500, category: 'testament', xpBoost: 1.13 },
  { artifactId: 'widows-mite', rarity: 'common', xpCost: 500, category: 'testament', xpBoost: undefined },
  { artifactId: 'alabaster-jar', rarity: 'legendary', xpCost: 12500, category: 'testament', xpBoost: 1.17 },
  { artifactId: 'fishing-net', rarity: 'common', xpCost: 1200, category: 'testament', xpBoost: undefined },
  { artifactId: 'prodigal-ring', rarity: 'epic', xpCost: 8000, category: 'testament', xpBoost: 1.11 },
  { artifactId: 'mustard-seed', rarity: 'common', xpCost: 600, category: 'testament', xpBoost: undefined },
  { artifactId: 'revelation-scroll', rarity: 'mythic', xpCost: 23000, category: 'testament', xpBoost: 1.22 },
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

  // Update equip state
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