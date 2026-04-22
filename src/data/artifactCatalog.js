/**
 * BibleBuilt Artifact Treasury Catalog
 */

export const RARITY_XP_BOOST = {
  common: 1.05,
  rare: 1.10,
  epic: 1.15,
  legendary: 1.25,
};

export const ARTIFACT_RARITY_COLORS = {
  common: '#A0826D',
  rare: '#C0C0C0',
  epic: '#6366F1',
  legendary: '#FBBF24',
};

export const ARTIFACT_RARITY_LABELS = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

// Cost in XP by rarity — 1 chapter = 100 XP
export const RARITY_COST = {
  common:    60,
  rare:      240,
  epic:      480,
  legendary: 1020,
};

export const artifacts = [
  {
    artifactId: 'ark-of-the-covenant',
    name: 'Ark of the Covenant',
    rarity: 'legendary',
    xpCost: 1020,
    image: '/cards/ark-legendary.png',
    scripture: {
      reference: 'Exodus 25:10-22',
      passage: "And they shall make an ark of shittim wood: two cubits and a half shall be the length thereof, and a cubit and a half the breadth thereof, and a cubit and a half the height thereof.",
    },
    story: "The sacred chest containing the Ten Commandments. The holiest relic of Israel.",
    visualDescription: 'An ornate wooden chest with golden accents and a radiant inner glow.',
    category: 'sacred',
    xpBoost: 1.25,
  },
  {
    artifactId: 'sword-goliath',
    name: 'Sword of Goliath',
    rarity: 'legendary',
    xpCost: 1020,
    image: '/cards/sword-of-goliath-legendary.png',
    scripture: {
      reference: '1 Samuel 21:9',
      passage: "And the priest said, The sword of Goliath the Philistine, whom thou slewest in the valley of Elah, behold, it is here wrapped in a cloth behind the ephod. And David said, There is none like that; give it me.",
    },
    story: "The massive iron sword of the giant Goliath, defeated by David's faith. An endgame collectible.",
    visualDescription: 'A colossal iron blade, notched and weathered from ancient battles, radiating power.',
    category: 'weapon',
    xpBoost: 1.25,
  },
  {
    artifactId: 'coat-of-many-colors',
    name: 'Coat of Many Colors',
    rarity: 'epic',
    xpCost: 480,
    image: '/cards/coat-of-many-colors-epic.png',
    scripture: {
      reference: 'Genesis 37:3',
      passage: "Now Israel loved Joseph more than all his children, because he was the son of his old age: and he made him a coat of many colours.",
    },
    story: "Joseph's cherished coat, a symbol of divine favor and the promise of restoration.",
    visualDescription: 'A vibrant robe woven with threads of every color, radiating noble lineage.',
    category: 'royal',
    xpBoost: 1.15,
  },
  {
    artifactId: 'sling-of-david',
    name: 'Sling of David',
    rarity: 'epic',
    xpCost: 480,
    image: '/cards/sling-of-david-epic.png',
    scripture: {
      reference: '1 Samuel 17:40',
      passage: "And he took his staff in his hand, and chose him five smooth stones out of the brook, and put them in a shepherd's bag which he had, even in a scrip; and his sling was in his hand: and he drew near to the Philistine.",
    },
    story: "The humble sling used by young David to defeat the giant Goliath. A symbol of faith over strength.",
    visualDescription: 'A weathered leather sling with five smooth, glowing stones.',
    category: 'weapon',
    xpBoost: 1.15,
  },
  {
    artifactId: 'davids-harp',
    name: "David's Harp",
    rarity: 'rare',
    xpCost: 240,
    image: '/cards/davids-harp-rare.png',
    scripture: {
      reference: '1 Samuel 16:23',
      passage: "And it came to pass, when the evil spirit from God was upon Saul, that David took an harp, and played with his hand: so Saul was refreshed, and was well, and the evil spirit departed from him.",
    },
    story: "The harp of the shepherd-king whose music drove away evil spirits and pleased God.",
    visualDescription: 'A beautifully carved wooden harp strung with golden strings.',
    category: 'royal',
    xpBoost: 1.10,
  },
  {
    artifactId: 'jar-of-manna',
    name: 'Jar of Manna',
    rarity: 'rare',
    xpCost: 240,
    image: '/cards/manna-rare.png',
    scripture: {
      reference: 'Exodus 16:32-34',
      passage: "And Moses said, This is the thing which the Lord commandeth, Fill an omer of it to be kept for your generations; that they may see the bread which I have fed you in the wilderness.",
    },
    story: "The manna preserved in a golden pot. God's supernatural provision in the wilderness.",
    visualDescription: 'A stone jar filled with shimmering white manna.',
    category: 'temple',
    xpBoost: 1.10,
  },
  {
    artifactId: 'noahs-hammer',
    name: "Noah's Hammer",
    rarity: 'rare',
    xpCost: 240,
    image: '/cards/noahs-hammer-rare.png',
    scripture: {
      reference: 'Genesis 6:14-16',
      passage: "Make thee an ark of gopher wood; rooms shalt thou make in the ark, and shalt pitch it within and without with pitch.",
    },
    story: "The tool used by Noah to build the ark during the great flood. A symbol of faithfulness and obedience.",
    visualDescription: 'A weathered wooden hammer with worn brass bands.',
    category: 'tool',
    xpBoost: 1.10,
  },
  {
    artifactId: 'clay-lamp',
    name: 'Clay Lamp',
    rarity: 'common',
    xpCost: 60,
    image: '/cards/lamp-common.png',
    scripture: {
      reference: 'Matthew 5:15',
      passage: "Neither do men light a candle, and put it under a bushel, but on a candlestick; and it giveth light unto all that are in the house.",
    },
    story: "A simple oil lamp. Light that cannot be hidden.",
    visualDescription: 'A small clay lamp glowing with eternal flame.',
    category: 'temple',
    xpBoost: 1.05,
  },
  {
    artifactId: 'rod-of-peter',
    name: 'Rod of Peter',
    rarity: 'common',
    xpCost: 60,
    image: '/cards/rod-of-peter-common.png',
    scripture: {
      reference: 'Mark 1:16-17',
      passage: "Now as he walked by the sea of Galilee, he saw Simon and Andrew his brother casting a net into the sea: for they were fishers. And Jesus said unto them, Come ye after me, and I will make you to become fishers of men.",
    },
    story: "Peter's humble fishing rod, a tool of provision transformed into a symbol of service.",
    visualDescription: 'A simple wooden fishing rod with a worn cord line.',
    category: 'tool',
    xpBoost: 1.05,
  },
  {
    artifactId: 'shepherds-staff',
    name: "Shepherd's Staff",
    rarity: 'common',
    xpCost: 60,
    image: '/cards/shepherds-staff-common.png',
    scripture: {
      reference: 'Hebrews 11:13',
      passage: "These all died in faith, not having received the promises, but having seen them afar off, and were persuaded of them, and embraced them.",
    },
    story: "A simple staff for the journey. Every pilgrim carries one toward the promised land.",
    visualDescription: 'A gnarled wooden staff, well-worn by faithful hands.',
    category: 'weapon',
    xpBoost: 1.05,
  },
];

export const getArtifactById = (id) => artifacts.find(a => a.artifactId === id);

export const getArtifactsByRarity = (rarity) => artifacts.filter(a => a.rarity === rarity);

export const getArtifactsByCategory = (category) => artifacts.filter(a => a.category === category);

export const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary'];

export const sortByRarity = (arts) =>
  [...arts].sort((a, b) => RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity));