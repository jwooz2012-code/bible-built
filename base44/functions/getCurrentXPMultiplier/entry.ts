import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const artifacts = [
  { artifactId: 'goliaths-sword', name: 'The Sword of Goliath', rarity: 'mythic', xpBoost: 1.15 },
  { artifactId: 'moses-staff', name: "Moses' Staff", rarity: 'mythic', xpBoost: 1.20 },
  { artifactId: 'shield-of-faith', name: 'The Shield of Faith', rarity: 'legendary', xpBoost: 1.10 },
  { artifactId: 'sword-of-spirit', name: 'The Sword of the Spirit', rarity: 'legendary', xpBoost: 1.12 },
  { artifactId: 'ark-covenant', name: 'The Ark of the Covenant', rarity: 'mythic', xpBoost: 1.25 },
  { artifactId: 'stone-tablets', name: 'The Stone Tablets', rarity: 'epic', xpBoost: 1.14 },
  { artifactId: 'temple-veil', name: 'The Temple Veil', rarity: 'legendary', xpBoost: 1.18 },
  { artifactId: 'priestly-breastplate', name: "The High Priest's Breastplate", rarity: 'mythic', xpBoost: 1.22 },
  { artifactId: 'urim-thummim', name: 'The Urim and Thummim', rarity: 'legendary', xpBoost: 1.16 },
  { artifactId: 'isaiah-scroll', name: "Isaiah's Scroll", rarity: 'legendary', xpBoost: 1.13 },
  { artifactId: 'elijahs-mantle', name: "Elijah's Mantle", rarity: 'legendary', xpBoost: 1.17 },
  { artifactId: 'ezekiels-wheel', name: "Ezekiel's Wheel", rarity: 'mythic', xpBoost: 1.23 },
  { artifactId: 'burning-bush', name: 'The Burning Bush', rarity: 'mythic', xpBoost: 1.20 },
  { artifactId: 'zechariahs-lamp', name: "Zechariah's Golden Lamp", rarity: 'epic', xpBoost: 1.11 },
  { artifactId: 'solomons-crown', name: "Solomon's Crown", rarity: 'mythic', xpBoost: 1.19 },
  { artifactId: 'davids-harp', name: "David's Harp", rarity: 'legendary', xpBoost: 1.13 },
  { artifactId: 'queens-scepter', name: "Esther's Scepter", rarity: 'legendary', xpBoost: 1.16 },
  { artifactId: 'davidic-throne', name: "A Stone from David's Throne", rarity: 'epic', xpBoost: 1.12 },
  { artifactId: 'josephs-coat', name: "Joseph's Coat of Many Colors", rarity: 'legendary', xpBoost: 1.15 },
  { artifactId: 'crown-of-thorns', name: 'The Crown of Thorns', rarity: 'mythic', xpBoost: 1.30 },
  { artifactId: 'lords-cup', name: "The Lord's Cup", rarity: 'mythic', xpBoost: 1.28 },
  { artifactId: 'five-loaves', name: 'The Five Loaves and Two Fish', rarity: 'legendary', xpBoost: 1.14 },
  { artifactId: 'emmaus-bread', name: 'The Bread of Emmaus', rarity: 'epic', xpBoost: 1.13 },
  { artifactId: 'alabaster-jar', name: "Mary's Alabaster Jar", rarity: 'legendary', xpBoost: 1.17 },
  { artifactId: 'prodigal-ring', name: "The Father's Ring", rarity: 'epic', xpBoost: 1.11 },
  { artifactId: 'revelation-scroll', name: "John's Revelation Scroll", rarity: 'mythic', xpBoost: 1.22 },
  // Non-boosting artifacts (xpBoost undefined — included for completeness but won't affect multiplier)
  { artifactId: 'davids-sling', name: "David's Sling", rarity: 'rare' },
  { artifactId: 'samsons-jawbone', name: "Samson's Jawbone", rarity: 'legendary' },
  { artifactId: 'sauls-spear', name: "Saul's Spear", rarity: 'epic' },
  { artifactId: 'jonathans-bow', name: "Jonathan's Bow", rarity: 'epic' },
  { artifactId: 'elijah-staff', name: "Elijah's Staff", rarity: 'epic' },
  { artifactId: 'peter-keys', name: "Peter's Keys", rarity: 'rare' },
  { artifactId: 'golden-lampstand', name: 'The Golden Lampstand', rarity: 'rare' },
  { artifactId: 'altar-incense', name: 'The Altar of Incense', rarity: 'epic' },
  { artifactId: 'bronze-serpent', name: 'The Bronze Serpent', rarity: 'rare' },
  { artifactId: 'table-shewbread', name: 'The Table of Shewbread', rarity: 'epic' },
  { artifactId: 'golden-calf', name: 'The Golden Calf', rarity: 'common' },
  { artifactId: 'jeremiahs-clay', name: "Jeremiah's Potter's Clay", rarity: 'common' },
  { artifactId: 'daniels-lions', name: "Daniel's Lion's Den Stone", rarity: 'epic' },
  { artifactId: 'jonahs-fish', name: "Jonah's Whale Tooth", rarity: 'rare' },
  { artifactId: 'hoseas-scroll', name: "Hosea's Scroll", rarity: 'rare' },
  { artifactId: 'amos-plumb-line', name: "Amos' Plumb Line", rarity: 'common' },
  { artifactId: 'solomons-ring', name: "Solomon's Signet Ring", rarity: 'epic' },
  { artifactId: 'cyrus-decree', name: "Cyrus' Royal Decree", rarity: 'rare' },
  { artifactId: 'nehemiahs-cup', name: "Nehemiah's Cupbearer's Cup", rarity: 'common' },
  { artifactId: 'absalom-hair', name: "Absalom's Locks", rarity: 'common' },
  { artifactId: 'jeroboam-altar', name: "Jeroboam's Altar Fragment", rarity: 'rare' },
  { artifactId: 'widows-mite', name: "The Widow's Mite", rarity: 'common' },
  { artifactId: 'fishing-net', name: "The Disciples' Fishing Net", rarity: 'common' },
  { artifactId: 'mustard-seed', name: 'The Mustard Seed', rarity: 'common' },
];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const equippedOwnerships = await base44.asServiceRole.entities.ArtifactOwnership.filter({ userId: user.id, isEquipped: true });

  let totalMultiplier = 1.0;
  const equippedArtifacts = [];

  for (const o of equippedOwnerships) {
    const art = artifacts.find(a => a.artifactId === o.artifactId);
    if (art) {
      equippedArtifacts.push({ artifactId: art.artifactId, name: art.name, rarity: art.rarity, xpBoost: art.xpBoost ?? 1.0 });
      if (art.xpBoost) totalMultiplier *= art.xpBoost;
    }
  }

  return Response.json({
    success: true,
    totalMultiplier: parseFloat(totalMultiplier.toFixed(2)),
    percentageBoost: `${((totalMultiplier - 1) * 100).toFixed(1)}%`,
    equippedArtifacts,
    equippedCount: equippedArtifacts.length,
  });
});