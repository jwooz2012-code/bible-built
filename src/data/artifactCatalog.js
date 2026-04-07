/**
 * BibleBuilt Artifact Treasury Catalog
 * 50 Bible-themed artifacts organized by rarity tier
 */

export const ARTIFACT_RARITY_COLORS = {
  common: '#A0826D',
  rare: '#C0C0C0',
  epic: '#6366F1',
  legendary: '#FBBF24',
  elite: '#F0F0F0',
};

export const ARTIFACT_RARITY_LABELS = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  elite: 'Elite',
};

export const artifacts = [
  {
    artifactId: 'sword-goliath',
    name: 'Sword of Goliath',
    rarity: 'legendary',
    xpCost: 15000,
    image: '/cards/goliathsword-legendary.png',
    scripture: {
      reference: '1 Samuel 21:9',
      passage: "And the priest said, The sword of Goliath the Philistine, whom thou slewest in the valley of Elah, behold, it is here wrapped in a cloth behind the ephod. And David said, There is none like that; give it me.",
    },
    lore: "The massive iron sword of the giant Goliath, defeated by David's faith. An endgame collectible.",
    visualDescription: 'A colossal iron blade, notched and weathered from ancient battles, radiating power.',
    category: 'weapon',
    xpBoost: 1.15,
  },
  {
    artifactId: 'davids-harp',
    name: 'David\'s Harp',
    rarity: 'epic',
    xpCost: 8500,
    image: '/cards/harp-rare.png',
    scripture: {
      reference: '1 Samuel 16:23',
      passage: "And it came to pass, when the evil spirit from God was upon Saul, that David took an harp, and played with his hand: so Saul was refreshed, and was well, and the evil spirit departed from him.",
    },
    lore: "The harp of the shepherd-king whose music drove away evil spirits and pleased God.",
    visualDescription: 'A beautifully carved wooden harp strung with golden strings.',
    category: 'royal',
    xpBoost: 1.13,
  },
  {
    artifactId: 'clay-lamp',
    name: 'Clay Lamp',
    rarity: 'common',
    xpCost: 800,
    image: '/cards/lamp-common.png',
    scripture: {
      reference: 'Matthew 5:15',
      passage: "Neither do men light a candle, and put it under a bushel, but on a candlestick; and it giveth light unto all that are in the house.",
    },
    lore: "A simple oil lamp. Light that cannot be hidden.",
    visualDescription: 'A small clay lamp glowing with eternal flame.',
    category: 'temple',
  },
  {
    artifactId: 'jar-of-manna',
    name: 'Jar of Manna',
    rarity: 'rare',
    xpCost: 4600,
    image: '/cards/manna-rare.png',
    scripture: {
      reference: 'Exodus 16:32-34',
      passage: "And Moses said, This is the thing which the Lord commandeth, Fill an omer of it to be kept for your generations; that they may see the bread which I have fed you in the wilderness.",
    },
    lore: "The manna preserved in a golden pot. God's supernatural provision in the wilderness.",
    visualDescription: 'A stone jar filled with shimmering white manna.',
    category: 'temple',
  },
  {
    artifactId: 'sling-of-david',
    name: 'Sling of David',
    rarity: 'legendary',
    xpCost: 12000,
    image: '/cards/slingofdavid-epic.png',
    scripture: {
      reference: '1 Samuel 17:40',
      passage: "And he took his staff in his hand, and chose him five smooth stones out of the brook, and put them in a shepherd's bag which he had, even in a scrip; and his sling was in his hand: and he drew near to the Philistine.",
    },
    lore: "The humble sling used by young David to defeat the giant Goliath. A symbol of faith over strength.",
    visualDescription: 'A weathered leather sling with five smooth, glowing stones.',
    category: 'weapon',
  },
  {
    artifactId: 'shepherds-staff',
    name: 'Shepherd\'s Staff',
    rarity: 'common',
    xpCost: 1500,
    scripture: {
      reference: 'Hebrews 11:13',
      passage: "These all died in faith, not having received the promises, but having seen them afar off, and were persuaded of them, and embraced them.",
    },
    lore: "A simple staff for the journey. Every pilgrim carries one toward the promised land.",
    visualDescription: 'A gnarled wooden staff, well-worn by faithful hands.',
    category: 'weapon',
  },
];

export const getArtifactById = (id) => artifacts.find(a => a.artifactId === id);

export const getArtifactsByRarity = (rarity) => artifacts.filter(a => a.rarity === rarity);

export const getArtifactsByCategory = (category) => artifacts.filter(a => a.category === category);

export const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary', 'elite'];

export const sortByRarity = (arts) =>
  [...arts].sort((a, b) => RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity));