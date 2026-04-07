import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const artifacts = [
  { artifactId: 'davids-sling', name: "David's Sling", rarity: 'rare', xpCost: 3500, category: 'weapon' },
  { artifactId: 'samsons-jawbone', name: "Samson's Jawbone", rarity: 'legendary', xpCost: 9000, category: 'weapon' },
  { artifactId: 'sauls-spear', name: "Saul's Spear", rarity: 'epic', xpCost: 6500, category: 'weapon' },
  { artifactId: 'jonathans-bow', name: "Jonathan's Bow", rarity: 'epic', xpCost: 7000, category: 'weapon' },
  { artifactId: 'goliaths-sword', name: 'The Sword of Goliath', rarity: 'mythic', xpCost: 15000, category: 'weapon', xpBoost: 1.15 },
  { artifactId: 'moses-staff', name: "Moses' Staff", rarity: 'mythic', xpCost: 18000, category: 'weapon', xpBoost: 1.20 },
  { artifactId: 'elijah-staff', name: "Elijah's Staff", rarity: 'epic', xpCost: 6000, category: 'weapon' },
  { artifactId: 'peter-keys', name: "Peter's Keys", rarity: 'rare', xpCost: 2500, category: 'weapon' },
  { artifactId: 'shield-of-faith', name: 'The Shield of Faith', rarity: 'legendary', xpCost: 10000, category: 'weapon', xpBoost: 1.10 },
  { artifactId: 'sword-of-spirit', name: 'The Sword of the Spirit', rarity: 'legendary', xpCost: 11000, category: 'weapon', xpBoost: 1.12 },
  { artifactId: 'ark-covenant', name: 'The Ark of the Covenant', rarity: 'mythic', xpCost: 25000, category: 'temple', xpBoost: 1.25 },
  { artifactId: 'golden-lampstand', name: 'The Golden Lampstand', rarity: 'rare', xpCost: 3000, category: 'temple' },
  { artifactId: 'altar-incense', name: 'The Altar of Incense', rarity: 'epic', xpCost: 7000, category: 'temple' },
  { artifactId: 'stone-tablets', name: 'The Stone Tablets', rarity: 'epic', xpCost: 8500, category: 'temple', xpBoost: 1.14 },
  { artifactId: 'temple-veil', name: 'The Temple Veil', rarity: 'legendary', xpCost: 12000, category: 'temple', xpBoost: 1.18 },
  { artifactId: 'priestly-breastplate', name: "The High Priest's Breastplate", rarity: 'mythic', xpCost: 20000, category: 'temple', xpBoost: 1.22 },
  { artifactId: 'bronze-serpent', name: 'The Bronze Serpent', rarity: 'rare', xpCost: 4000, category: 'temple' },
  { artifactId: 'urim-thummim', name: 'The Urim and Thummim', rarity: 'legendary', xpCost: 13000, category: 'temple', xpBoost: 1.16 },
  { artifactId: 'table-shewbread', name: 'The Table of Shewbread', rarity: 'epic', xpCost: 7500, category: 'temple' },
  { artifactId: 'golden-calf', name: 'The Golden Calf', rarity: 'common', xpCost: 1000, category: 'temple' },
  { artifactId: 'isaiah-scroll', name: "Isaiah's Scroll", rarity: 'legendary', xpCost: 11000, category: 'prophetic', xpBoost: 1.13 },
  { artifactId: 'jeremiahs-clay', name: "Jeremiah's Potter's Clay", rarity: 'common', xpCost: 800, category: 'prophetic' },
  { artifactId: 'elijahs-mantle', name: "Elijah's Mantle", rarity: 'legendary', xpCost: 12000, category: 'prophetic', xpBoost: 1.17 },
  { artifactId: 'ezekiels-wheel', name: "Ezekiel's Wheel", rarity: 'mythic', xpCost: 22000, category: 'prophetic', xpBoost: 1.23 },
  { artifactId: 'daniels-lions', name: "Daniel's Lion's Den Stone", rarity: 'epic', xpCost: 8000, category: 'prophetic' },
  { artifactId: 'jonahs-fish', name: "Jonah's Whale Tooth", rarity: 'rare', xpCost: 3500, category: 'prophetic' },
  { artifactId: 'burning-bush', name: 'The Burning Bush', rarity: 'mythic', xpCost: 19000, category: 'prophetic', xpBoost: 1.20 },
  { artifactId: 'hoseas-scroll', name: "Hosea's Scroll", rarity: 'rare', xpCost: 2800, category: 'prophetic' },
  { artifactId: 'amos-plumb-line', name: "Amos' Plumb Line", rarity: 'common', xpCost: 1200, category: 'prophetic' },
  { artifactId: 'zechariahs-lamp', name: "Zechariah's Golden Lamp", rarity: 'epic', xpCost: 8000, category: 'prophetic', xpBoost: 1.11 },
  { artifactId: 'solomons-crown', name: "Solomon's Crown", rarity: 'mythic', xpCost: 21000, category: 'royal', xpBoost: 1.19 },
  { artifactId: 'davids-harp', name: "David's Harp", rarity: 'legendary', xpCost: 10500, category: 'royal', xpBoost: 1.13 },
  { artifactId: 'queens-scepter', name: "Esther's Scepter", rarity: 'legendary', xpCost: 11500, category: 'royal', xpBoost: 1.16 },
  { artifactId: 'solomons-ring', name: "Solomon's Signet Ring", rarity: 'epic', xpCost: 9000, category: 'royal' },
  { artifactId: 'davidic-throne', name: "A Stone from David's Throne", rarity: 'epic', xpCost: 8500, category: 'royal', xpBoost: 1.12 },
  { artifactId: 'josephs-coat', name: "Joseph's Coat of Many Colors", rarity: 'legendary', xpCost: 13000, category: 'royal', xpBoost: 1.15 },
  { artifactId: 'cyrus-decree', name: "Cyrus' Royal Decree", rarity: 'rare', xpCost: 4500, category: 'royal' },
  { artifactId: 'nehemiahs-cup', name: "Nehemiah's Cupbearer's Cup", rarity: 'common', xpCost: 1500, category: 'royal' },
  { artifactId: 'absalom-hair', name: "Absalom's Locks", rarity: 'common', xpCost: 900, category: 'royal' },
  { artifactId: 'jeroboam-altar', name: "Jeroboam's Altar Fragment", rarity: 'rare', xpCost: 2000, category: 'royal' },
  { artifactId: 'crown-of-thorns', name: 'The Crown of Thorns', rarity: 'mythic', xpCost: 30000, category: 'testament', xpBoost: 1.30 },
  { artifactId: 'lords-cup', name: "The Lord's Cup", rarity: 'mythic', xpCost: 28000, category: 'testament', xpBoost: 1.28 },
  { artifactId: 'five-loaves', name: 'The Five Loaves and Two Fish', rarity: 'legendary', xpCost: 11000, category: 'testament', xpBoost: 1.14 },
  { artifactId: 'emmaus-bread', name: 'The Bread of Emmaus', rarity: 'epic', xpCost: 9500, category: 'testament', xpBoost: 1.13 },
  { artifactId: 'widows-mite', name: "The Widow's Mite", rarity: 'common', xpCost: 500, category: 'testament' },
  { artifactId: 'alabaster-jar', name: "Mary's Alabaster Jar", rarity: 'legendary', xpCost: 12500, category: 'testament', xpBoost: 1.17 },
  { artifactId: 'fishing-net', name: "The Disciples' Fishing Net", rarity: 'common', xpCost: 1200, category: 'testament' },
  { artifactId: 'prodigal-ring', name: "The Father's Ring", rarity: 'epic', xpCost: 8000, category: 'testament', xpBoost: 1.11 },
  { artifactId: 'mustard-seed', name: 'The Mustard Seed', rarity: 'common', xpCost: 600, category: 'testament' },
  { artifactId: 'revelation-scroll', name: "John's Revelation Scroll", rarity: 'mythic', xpCost: 23000, category: 'testament', xpBoost: 1.22 },
];

const RARITIES = ['common', 'rare', 'epic', 'legendary', 'mythic'];

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