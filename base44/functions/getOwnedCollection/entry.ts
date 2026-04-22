import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const artifacts = [
  { artifactId: 'ark-of-the-covenant', name: 'Ark of the Covenant', rarity: 'legendary', category: 'sacred', xpBoost: 1.25 },
  { artifactId: 'sword-goliath',        name: 'Sword of Goliath',    rarity: 'legendary', category: 'weapon', xpBoost: 1.25 },
  { artifactId: 'coat-of-many-colors',  name: 'Coat of Many Colors', rarity: 'epic',      category: 'royal',  xpBoost: 1.15 },
  { artifactId: 'sling-of-david',       name: 'Sling of David',      rarity: 'epic',      category: 'weapon', xpBoost: 1.15 },
  { artifactId: 'davids-harp',          name: "David's Harp",        rarity: 'rare',      category: 'royal',  xpBoost: 1.10 },
  { artifactId: 'jar-of-manna',         name: 'Jar of Manna',        rarity: 'rare',      category: 'temple', xpBoost: 1.10 },
  { artifactId: 'noahs-hammer',         name: "Noah's Hammer",       rarity: 'rare',      category: 'tool',   xpBoost: 1.10 },
  { artifactId: 'clay-lamp',            name: 'Clay Lamp',           rarity: 'common',    category: 'temple', xpBoost: 1.05 },
  { artifactId: 'rod-of-peter',         name: 'Rod of Peter',        rarity: 'common',    category: 'tool',   xpBoost: 1.05 },
  { artifactId: 'shepherds-staff',      name: "Shepherd's Staff",    rarity: 'common',    category: 'weapon', xpBoost: 1.05 },
];

const RARITIES = ['common', 'rare', 'epic', 'legendary'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const ownerships = await base44.asServiceRole.entities.ArtifactOwnership.filter({ 'data.userId': user.id });

    const ownedArtifacts = ownerships
      .map(o => {
        const artifact = artifacts.find(a => a.artifactId === o.artifactId);
        if (!artifact) return null;
        return {
          ...artifact,
          ownership: {
            id: o.id,
            acquiredAt: o.acquiredAt,
            isEquipped: o.isEquipped,
            equippedAt: o.equippedAt,
          },
        };
      })
      .filter(Boolean);

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
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});