import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const artifacts = [
  { artifactId: 'ark-of-the-covenant', name: 'Ark of the Covenant', rarity: 'legendary', xpCost: 18000, category: 'sacred', xpBoost: 1.20 },
  { artifactId: 'sword-goliath', name: 'Sword of Goliath', rarity: 'legendary', xpCost: 15000, category: 'weapon', xpBoost: 1.15 },
  { artifactId: 'coat-of-many-colors', name: 'Coat of Many Colors', rarity: 'epic', xpCost: 9500, category: 'royal', xpBoost: 1.11 },
  { artifactId: 'sling-of-david', name: 'Sling of David', rarity: 'epic', xpCost: 12000, category: 'weapon', xpBoost: 1.12 },
  { artifactId: 'davids-harp', name: "David's Harp", rarity: 'rare', xpCost: 8500, category: 'royal', xpBoost: 1.13 },
  { artifactId: 'jar-of-manna', name: 'Jar of Manna', rarity: 'rare', xpCost: 4600, category: 'temple', xpBoost: 1.08 },
  { artifactId: 'noahs-hammer', name: "Noah's Hammer", rarity: 'rare', xpCost: 5200, category: 'tool', xpBoost: 1.09 },
  { artifactId: 'clay-lamp', name: 'Clay Lamp', rarity: 'common', xpCost: 800, category: 'temple' },
  { artifactId: 'rod-of-peter', name: 'Rod of Peter', rarity: 'common', xpCost: 2100, category: 'tool' },
  { artifactId: 'shepherds-staff', name: "Shepherd's Staff", rarity: 'common', xpCost: 1500, category: 'weapon' },
  // Legacy ID alias
  { artifactId: 'goliaths-sword', name: 'Sword of Goliath', rarity: 'legendary', xpCost: 15000, category: 'weapon', xpBoost: 1.15 },
];

const RARITIES = ['common', 'rare', 'epic', 'legendary'];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const ownerships = await base44.asServiceRole.entities.ArtifactOwnership.filter({ userId: user.id });

  const ownedArtifacts = ownerships.map(o => {
    const artifact = artifacts.find(a => a.artifactId === o.artifactId);
    return { ...artifact, ownership: { id: o.id, acquiredAt: o.acquiredAt, isEquipped: o.isEquipped, equippedAt: o.equippedAt } };
  });

  const stats = {
    totalOwned: ownedArtifacts.length,
    totalAvailable: artifacts.length,
    completionPercentage: parseFloat(((ownedArtifacts.length / artifacts.length) * 100).toFixed(1)),
    byRarity: Object.fromEntries(RARITIES.map(r => [r, {
      owned: ownedArtifacts.filter(a => a.rarity === r).length,
      total: artifacts.filter(a => a.rarity === r).length,
    }])),
  };

  return Response.json({ success: true, ownedArtifacts, stats });
});