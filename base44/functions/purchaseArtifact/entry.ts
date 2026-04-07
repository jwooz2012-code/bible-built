import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const artifacts = [
  { artifactId: 'davids-sling', name: "David's Sling", rarity: 'rare', xpCost: 3500, category: 'weapon', xpBoost: undefined },
  { artifactId: 'samsons-jawbone', name: "Samson's Jawbone", rarity: 'legendary', xpCost: 9000, category: 'weapon', xpBoost: undefined },
  { artifactId: 'sauls-spear', name: "Saul's Spear", rarity: 'epic', xpCost: 6500, category: 'weapon', xpBoost: undefined },
  { artifactId: 'jonathans-bow', name: "Jonathan's Bow", rarity: 'epic', xpCost: 7000, category: 'weapon', xpBoost: undefined },
  { artifactId: 'goliaths-sword', name: 'The Sword of Goliath', rarity: 'mythic', xpCost: 15000, category: 'weapon', xpBoost: 1.15 },
  { artifactId: 'moses-staff', name: "Moses' Staff", rarity: 'mythic', xpCost: 18000, category: 'weapon', xpBoost: 1.20 },
  { artifactId: 'elijah-staff', name: "Elijah's Staff", rarity: 'epic', xpCost: 6000, category: 'weapon', xpBoost: undefined },
  { artifactId: 'peter-keys', name: "Peter's Keys", rarity: 'rare', xpCost: 2500, category: 'weapon', xpBoost: undefined },
  { artifactId: 'shield-of-faith', name: 'The Shield of Faith', rarity: 'legendary', xpCost: 10000, category: 'weapon', xpBoost: 1.10 },
  { artifactId: 'sword-of-spirit', name: 'The Sword of the Spirit', rarity: 'legendary', xpCost: 11000, category: 'weapon', xpBoost: 1.12 },
  { artifactId: 'ark-covenant', name: 'The Ark of the Covenant', rarity: 'mythic', xpCost: 25000, category: 'temple', xpBoost: 1.25 },
  { artifactId: 'golden-lampstand', name: 'The Golden Lampstand', rarity: 'rare', xpCost: 3000, category: 'temple', xpBoost: undefined },
  { artifactId: 'altar-incense', name: 'The Altar of Incense', rarity: 'epic', xpCost: 7000, category: 'temple', xpBoost: undefined },
  { artifactId: 'stone-tablets', name: 'The Stone Tablets', rarity: 'epic', xpCost: 8500, category: 'temple', xpBoost: 1.14 },
  { artifactId: 'temple-veil', name: 'The Temple Veil', rarity: 'legendary', xpCost: 12000, category: 'temple', xpBoost: 1.18 },
  { artifactId: 'priestly-breastplate', name: "The High Priest's Breastplate", rarity: 'mythic', xpCost: 20000, category: 'temple', xpBoost: 1.22 },
  { artifactId: 'bronze-serpent', name: 'The Bronze Serpent', rarity: 'rare', xpCost: 4000, category: 'temple', xpBoost: undefined },
  { artifactId: 'urim-thummim', name: 'The Urim and Thummim', rarity: 'legendary', xpCost: 13000, category: 'temple', xpBoost: 1.16 },
  { artifactId: 'table-shewbread', name: 'The Table of Shewbread', rarity: 'epic', xpCost: 7500, category: 'temple', xpBoost: undefined },
  { artifactId: 'golden-calf', name: 'The Golden Calf', rarity: 'common', xpCost: 1000, category: 'temple', xpBoost: undefined },
  { artifactId: 'isaiah-scroll', name: "Isaiah's Scroll", rarity: 'legendary', xpCost: 11000, category: 'prophetic', xpBoost: 1.13 },
  { artifactId: 'jeremiahs-clay', name: "Jeremiah's Potter's Clay", rarity: 'common', xpCost: 800, category: 'prophetic', xpBoost: undefined },
  { artifactId: 'elijahs-mantle', name: "Elijah's Mantle", rarity: 'legendary', xpCost: 12000, category: 'prophetic', xpBoost: 1.17 },
  { artifactId: 'ezekiels-wheel', name: "Ezekiel's Wheel", rarity: 'mythic', xpCost: 22000, category: 'prophetic', xpBoost: 1.23 },
  { artifactId: 'daniels-lions', name: "Daniel's Lion's Den Stone", rarity: 'epic', xpCost: 8000, category: 'prophetic', xpBoost: undefined },
  { artifactId: 'jonahs-fish', name: "Jonah's Whale Tooth", rarity: 'rare', xpCost: 3500, category: 'prophetic', xpBoost: undefined },
  { artifactId: 'burning-bush', name: 'The Burning Bush', rarity: 'mythic', xpCost: 19000, category: 'prophetic', xpBoost: 1.20 },
  { artifactId: 'hoseas-scroll', name: "Hosea's Scroll", rarity: 'rare', xpCost: 2800, category: 'prophetic', xpBoost: undefined },
  { artifactId: 'amos-plumb-line', name: "Amos' Plumb Line", rarity: 'common', xpCost: 1200, category: 'prophetic', xpBoost: undefined },
  { artifactId: 'zechariahs-lamp', name: "Zechariah's Golden Lamp", rarity: 'epic', xpCost: 8000, category: 'prophetic', xpBoost: 1.11 },
  { artifactId: 'solomons-crown', name: "Solomon's Crown", rarity: 'mythic', xpCost: 21000, category: 'royal', xpBoost: 1.19 },
  { artifactId: 'davids-harp', name: "David's Harp", rarity: 'legendary', xpCost: 10500, category: 'royal', xpBoost: 1.13 },
  { artifactId: 'queens-scepter', name: "Esther's Scepter", rarity: 'legendary', xpCost: 11500, category: 'royal', xpBoost: 1.16 },
  { artifactId: 'solomons-ring', name: "Solomon's Signet Ring", rarity: 'epic', xpCost: 9000, category: 'royal', xpBoost: undefined },
  { artifactId: 'davidic-throne', name: "A Stone from David's Throne", rarity: 'epic', xpCost: 8500, category: 'royal', xpBoost: 1.12 },
  { artifactId: 'josephs-coat', name: "Joseph's Coat of Many Colors", rarity: 'legendary', xpCost: 13000, category: 'royal', xpBoost: 1.15 },
  { artifactId: 'cyrus-decree', name: "Cyrus' Royal Decree", rarity: 'rare', xpCost: 4500, category: 'royal', xpBoost: undefined },
  { artifactId: 'nehemiahs-cup', name: "Nehemiah's Cupbearer's Cup", rarity: 'common', xpCost: 1500, category: 'royal', xpBoost: undefined },
  { artifactId: 'absalom-hair', name: "Absalom's Locks", rarity: 'common', xpCost: 900, category: 'royal', xpBoost: undefined },
  { artifactId: 'jeroboam-altar', name: "Jeroboam's Altar Fragment", rarity: 'rare', xpCost: 2000, category: 'royal', xpBoost: undefined },
  { artifactId: 'crown-of-thorns', name: 'The Crown of Thorns', rarity: 'mythic', xpCost: 30000, category: 'testament', xpBoost: 1.30 },
  { artifactId: 'lords-cup', name: "The Lord's Cup", rarity: 'mythic', xpCost: 28000, category: 'testament', xpBoost: 1.28 },
  { artifactId: 'five-loaves', name: 'The Five Loaves and Two Fish', rarity: 'legendary', xpCost: 11000, category: 'testament', xpBoost: 1.14 },
  { artifactId: 'emmaus-bread', name: 'The Bread of Emmaus', rarity: 'epic', xpCost: 9500, category: 'testament', xpBoost: 1.13 },
  { artifactId: 'widows-mite', name: "The Widow's Mite", rarity: 'common', xpCost: 500, category: 'testament', xpBoost: undefined },
  { artifactId: 'alabaster-jar', name: "Mary's Alabaster Jar", rarity: 'legendary', xpCost: 12500, category: 'testament', xpBoost: 1.17 },
  { artifactId: 'fishing-net', name: "The Disciples' Fishing Net", rarity: 'common', xpCost: 1200, category: 'testament', xpBoost: undefined },
  { artifactId: 'prodigal-ring', name: "The Father's Ring", rarity: 'epic', xpCost: 8000, category: 'testament', xpBoost: 1.11 },
  { artifactId: 'mustard-seed', name: 'The Mustard Seed', rarity: 'common', xpCost: 600, category: 'testament', xpBoost: undefined },
  { artifactId: 'revelation-scroll', name: "John's Revelation Scroll", rarity: 'mythic', xpCost: 23000, category: 'testament', xpBoost: 1.22 },
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