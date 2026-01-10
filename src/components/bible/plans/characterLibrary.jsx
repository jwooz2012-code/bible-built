/**
 * Character-focused Bible reading plans
 * Each character follows a 5-section historical deep dive format:
 * 1. Formation & Early Context
 * 2. Defining Test of Faith
 * 3. Calling & Commissioning
 * 4. Leadership / Ministry Narrative
 * 5. Legacy & Later Remembrance
 */

export const CHARACTER_LIBRARY = {
  Abraham: {
    iconKey: 'stars',
    accentColorKey: 'blue',
    hook: 'Called out. Set apart. Walking by faith.',
    description: 'Follow Abraham from God's call out of Ur through the covenant promises that shaped Israel and the world. This deep dive traces his faith, obedience, failures, and lasting legacy.',
    sections: [
      {
        title: 'Formation & Early Context',
        chapters: [
          { bookName: 'Genesis', chapter: 11 },
          { bookName: 'Genesis', chapter: 12 },
        ]
      },
      {
        title: 'Defining Test of Faith',
        chapters: [
          { bookName: 'Genesis', chapter: 15 },
          { bookName: 'Genesis', chapter: 17 },
          { bookName: 'Genesis', chapter: 22 },
        ]
      },
      {
        title: 'Covenant & Commissioning',
        chapters: [
          { bookName: 'Genesis', chapter: 12 },
          { bookName: 'Genesis', chapter: 13 },
          { bookName: 'Genesis', chapter: 14 },
        ]
      },
      {
        title: 'Life of Faith',
        chapters: [
          { bookName: 'Genesis', chapter: 18 },
          { bookName: 'Genesis', chapter: 19 },
          { bookName: 'Genesis', chapter: 20 },
          { bookName: 'Genesis', chapter: 21 },
          { bookName: 'Genesis', chapter: 23 },
          { bookName: 'Genesis', chapter: 24 },
          { bookName: 'Genesis', chapter: 25 },
        ]
      },
      {
        title: 'Legacy & Later Remembrance',
        chapters: [
          { bookName: 'Joshua', chapter: 24 },
          { bookName: 'Nehemiah', chapter: 9 },
          { bookName: 'Psalms', chapter: 105 },
          { bookName: 'Isaiah', chapter: 51 },
          { bookName: 'Romans', chapter: 4 },
          { bookName: 'Galatians', chapter: 3 },
          { bookName: 'Hebrews', chapter: 11 },
          { bookName: 'James', chapter: 2 },
        ]
      }
    ]
  },
  
  Job: {
    iconKey: 'storm',
    accentColorKey: 'slate',
    hook: 'Faith when answers don't come.',
    description: 'Walk through Job's suffering, honest questions, and restored trust in God's wisdom and sovereignty.',
    sections: [
      {
        title: 'Formation & Setting',
        chapters: [
          { bookName: 'Job', chapter: 1 },
          { bookName: 'Job', chapter: 2 },
        ]
      },
      {
        title: 'Defining Trial',
        chapters: [
          { bookName: 'Job', chapter: 3 },
          { bookName: 'Job', chapter: 4 },
          { bookName: 'Job', chapter: 5 },
          { bookName: 'Job', chapter: 6 },
          { bookName: 'Job', chapter: 7 },
          { bookName: 'Job', chapter: 8 },
          { bookName: 'Job', chapter: 9 },
          { bookName: 'Job', chapter: 10 },
          { bookName: 'Job', chapter: 11 },
          { bookName: 'Job', chapter: 12 },
          { bookName: 'Job', chapter: 13 },
          { bookName: 'Job', chapter: 14 },
        ]
      },
      {
        title: 'Wrestling with God',
        chapters: [
          { bookName: 'Job', chapter: 15 },
          { bookName: 'Job', chapter: 16 },
          { bookName: 'Job', chapter: 17 },
          { bookName: 'Job', chapter: 18 },
          { bookName: 'Job', chapter: 19 },
          { bookName: 'Job', chapter: 20 },
          { bookName: 'Job', chapter: 21 },
          { bookName: 'Job', chapter: 22 },
          { bookName: 'Job', chapter: 23 },
          { bookName: 'Job', chapter: 24 },
          { bookName: 'Job', chapter: 25 },
          { bookName: 'Job', chapter: 26 },
          { bookName: 'Job', chapter: 27 },
          { bookName: 'Job', chapter: 28 },
          { bookName: 'Job', chapter: 29 },
          { bookName: 'Job', chapter: 30 },
          { bookName: 'Job', chapter: 31 },
        ]
      },
      {
        title: 'God Speaks',
        chapters: [
          { bookName: 'Job', chapter: 32 },
          { bookName: 'Job', chapter: 33 },
          { bookName: 'Job', chapter: 34 },
          { bookName: 'Job', chapter: 35 },
          { bookName: 'Job', chapter: 36 },
          { bookName: 'Job', chapter: 37 },
          { bookName: 'Job', chapter: 38 },
          { bookName: 'Job', chapter: 39 },
          { bookName: 'Job', chapter: 40 },
          { bookName: 'Job', chapter: 41 },
        ]
      },
      {
        title: 'Restoration & Legacy',
        chapters: [
          { bookName: 'Job', chapter: 42 },
          { bookName: 'Ezekiel', chapter: 14 },
          { bookName: 'James', chapter: 5 },
        ]
      }
    ]
  },
  
  Joseph: {
    iconKey: 'coat',
    accentColorKey: 'emerald',
    hook: 'God was working, even in the pit.',
    description: 'Trace Joseph's journey from betrayal to leadership as God uses hardship to accomplish His purposes.',
    sections: [
      {
        title: 'Formation & Family Context',
        chapters: [
          { bookName: 'Genesis', chapter: 37 },
        ]
      },
      {
        title: 'Defining Trials',
        chapters: [
          { bookName: 'Genesis', chapter: 39 },
          { bookName: 'Genesis', chapter: 40 },
        ]
      },
      {
        title: 'God's Promotion',
        chapters: [
          { bookName: 'Genesis', chapter: 41 },
        ]
      },
      {
        title: 'God's Purpose Revealed',
        chapters: [
          { bookName: 'Genesis', chapter: 42 },
          { bookName: 'Genesis', chapter: 43 },
          { bookName: 'Genesis', chapter: 44 },
          { bookName: 'Genesis', chapter: 45 },
          { bookName: 'Genesis', chapter: 46 },
          { bookName: 'Genesis', chapter: 47 },
          { bookName: 'Genesis', chapter: 48 },
          { bookName: 'Genesis', chapter: 49 },
          { bookName: 'Genesis', chapter: 50 },
        ]
      },
      {
        title: 'Legacy & Remembrance',
        chapters: [
          { bookName: 'Psalms', chapter: 105 },
          { bookName: 'Acts', chapter: 7 },
        ]
      }
    ]
  },
  
  Moses: {
    iconKey: 'tablets',
    accentColorKey: 'purple',
    hook: 'Chosen by God. Tested by people.',
    description: 'Explore Moses' life from reluctant shepherd to faithful servant leading God's people.',
    sections: [
      {
        title: 'Formation & Calling',
        chapters: [
          { bookName: 'Exodus', chapter: 1 },
          { bookName: 'Exodus', chapter: 2 },
          { bookName: 'Exodus', chapter: 3 },
          { bookName: 'Exodus', chapter: 4 },
          { bookName: 'Exodus', chapter: 5 },
          { bookName: 'Exodus', chapter: 6 },
        ]
      },
      {
        title: 'Defining Test',
        chapters: [
          { bookName: 'Exodus', chapter: 7 },
          { bookName: 'Exodus', chapter: 8 },
          { bookName: 'Exodus', chapter: 9 },
          { bookName: 'Exodus', chapter: 10 },
          { bookName: 'Exodus', chapter: 11 },
          { bookName: 'Exodus', chapter: 12 },
          { bookName: 'Exodus', chapter: 13 },
          { bookName: 'Exodus', chapter: 14 },
        ]
      },
      {
        title: 'Leadership Under Pressure',
        chapters: [
          { bookName: 'Exodus', chapter: 15 },
          { bookName: 'Exodus', chapter: 16 },
          { bookName: 'Exodus', chapter: 17 },
          { bookName: 'Exodus', chapter: 18 },
          { bookName: 'Exodus', chapter: 19 },
          { bookName: 'Exodus', chapter: 20 },
          { bookName: 'Exodus', chapter: 21 },
          { bookName: 'Exodus', chapter: 22 },
          { bookName: 'Exodus', chapter: 23 },
          { bookName: 'Exodus', chapter: 24 },
          { bookName: 'Exodus', chapter: 25 },
          { bookName: 'Exodus', chapter: 26 },
          { bookName: 'Exodus', chapter: 27 },
          { bookName: 'Exodus', chapter: 28 },
          { bookName: 'Exodus', chapter: 29 },
          { bookName: 'Exodus', chapter: 30 },
          { bookName: 'Exodus', chapter: 31 },
          { bookName: 'Exodus', chapter: 32 },
          { bookName: 'Exodus', chapter: 33 },
          { bookName: 'Exodus', chapter: 34 },
          { bookName: 'Numbers', chapter: 11 },
          { bookName: 'Numbers', chapter: 12 },
          { bookName: 'Numbers', chapter: 13 },
          { bookName: 'Numbers', chapter: 14 },
          { bookName: 'Numbers', chapter: 20 },
        ]
      },
      {
        title: 'Final Years & Instruction',
        chapters: [
          { bookName: 'Deuteronomy', chapter: 1 },
          { bookName: 'Deuteronomy', chapter: 2 },
          { bookName: 'Deuteronomy', chapter: 3 },
          { bookName: 'Deuteronomy', chapter: 4 },
          { bookName: 'Deuteronomy', chapter: 5 },
          { bookName: 'Deuteronomy', chapter: 6 },
          { bookName: 'Deuteronomy', chapter: 7 },
          { bookName: 'Deuteronomy', chapter: 8 },
          { bookName: 'Deuteronomy', chapter: 9 },
          { bookName: 'Deuteronomy', chapter: 10 },
          { bookName: 'Deuteronomy', chapter: 28 },
          { bookName: 'Deuteronomy', chapter: 29 },
          { bookName: 'Deuteronomy', chapter: 30 },
          { bookName: 'Deuteronomy', chapter: 31 },
          { bookName: 'Deuteronomy', chapter: 32 },
          { bookName: 'Deuteronomy', chapter: 33 },
          { bookName: 'Deuteronomy', chapter: 34 },
        ]
      },
      {
        title: 'Legacy & Remembrance',
        chapters: [
          { bookName: 'Psalms', chapter: 90 },
          { bookName: 'Psalms', chapter: 105 },
          { bookName: 'Acts', chapter: 7 },
          { bookName: 'Hebrews', chapter: 11 },
          { bookName: 'Jude', chapter: 1 },
        ]
      }
    ]
  },
  
  Joshua: {
    iconKey: 'sword',
    accentColorKey: 'orange',
    hook: 'Strong, courageous, obedient.',
    description: 'Follow Joshua from servant under Moses to faithful leader of Israel, emphasizing obedience to God's Word.',
    sections: [
      {
        title: 'Formation under Moses',
        chapters: [
          { bookName: 'Exodus', chapter: 17 },
          { bookName: 'Exodus', chapter: 24 },
          { bookName: 'Exodus', chapter: 32 },
          { bookName: 'Exodus', chapter: 33 },
        ]
      },
      {
        title: 'Defining Test of Faith',
        chapters: [
          { bookName: 'Numbers', chapter: 13 },
          { bookName: 'Numbers', chapter: 14 },
        ]
      },
      {
        title: 'Commissioning',
        chapters: [
          { bookName: 'Numbers', chapter: 27 },
          { bookName: 'Deuteronomy', chapter: 31 },
          { bookName: 'Deuteronomy', chapter: 34 },
          { bookName: 'Joshua', chapter: 1 },
        ]
      },
      {
        title: 'Leadership Narrative',
        chapters: [
          { bookName: 'Joshua', chapter: 2 },
          { bookName: 'Joshua', chapter: 3 },
          { bookName: 'Joshua', chapter: 4 },
          { bookName: 'Joshua', chapter: 5 },
          { bookName: 'Joshua', chapter: 6 },
          { bookName: 'Joshua', chapter: 7 },
          { bookName: 'Joshua', chapter: 8 },
          { bookName: 'Joshua', chapter: 9 },
          { bookName: 'Joshua', chapter: 10 },
          { bookName: 'Joshua', chapter: 11 },
          { bookName: 'Joshua', chapter: 12 },
          { bookName: 'Joshua', chapter: 13 },
          { bookName: 'Joshua', chapter: 14 },
          { bookName: 'Joshua', chapter: 15 },
          { bookName: 'Joshua', chapter: 16 },
          { bookName: 'Joshua', chapter: 17 },
          { bookName: 'Joshua', chapter: 18 },
          { bookName: 'Joshua', chapter: 19 },
          { bookName: 'Joshua', chapter: 20 },
          { bookName: 'Joshua', chapter: 21 },
          { bookName: 'Joshua', chapter: 22 },
          { bookName: 'Joshua', chapter: 23 },
          { bookName: 'Joshua', chapter: 24 },
        ]
      },
      {
        title: 'Legacy & Remembrance',
        chapters: [
          { bookName: 'Judges', chapter: 2 },
          { bookName: 'Nehemiah', chapter: 9 },
          { bookName: 'Psalms', chapter: 44 },
          { bookName: 'Psalms', chapter: 105 },
        ]
      }
    ]
  },
  
  David: {
    iconKey: 'harp',
    accentColorKey: 'cyan',
    hook: 'A heart for God—even when he failed.',
    description: 'Study the rise, reign, repentance, and legacy of Israel's greatest king.',
    sections: [
      {
        title: 'Formation & Calling',
        chapters: [
          { bookName: '1 Samuel', chapter: 16 },
          { bookName: '1 Samuel', chapter: 17 },
        ]
      },
      {
        title: 'Defining Trials',
        chapters: [
          { bookName: '1 Samuel', chapter: 18 },
          { bookName: '1 Samuel', chapter: 19 },
          { bookName: '1 Samuel', chapter: 20 },
          { bookName: '1 Samuel', chapter: 21 },
          { bookName: '1 Samuel', chapter: 22 },
          { bookName: '1 Samuel', chapter: 23 },
          { bookName: '1 Samuel', chapter: 24 },
          { bookName: '1 Samuel', chapter: 25 },
          { bookName: '1 Samuel', chapter: 26 },
          { bookName: '1 Samuel', chapter: 27 },
          { bookName: '1 Samuel', chapter: 28 },
          { bookName: '1 Samuel', chapter: 29 },
          { bookName: '1 Samuel', chapter: 30 },
          { bookName: '1 Samuel', chapter: 31 },
        ]
      },
      {
        title: 'Kingship Established',
        chapters: [
          { bookName: '2 Samuel', chapter: 1 },
          { bookName: '2 Samuel', chapter: 2 },
          { bookName: '2 Samuel', chapter: 3 },
          { bookName: '2 Samuel', chapter: 4 },
          { bookName: '2 Samuel', chapter: 5 },
          { bookName: '2 Samuel', chapter: 6 },
          { bookName: '2 Samuel', chapter: 7 },
          { bookName: '2 Samuel', chapter: 8 },
          { bookName: '2 Samuel', chapter: 9 },
          { bookName: '2 Samuel', chapter: 10 },
        ]
      },
      {
        title: 'Leadership & Failure',
        chapters: [
          { bookName: '2 Samuel', chapter: 11 },
          { bookName: '2 Samuel', chapter: 12 },
          { bookName: '2 Samuel', chapter: 13 },
          { bookName: '2 Samuel', chapter: 14 },
          { bookName: '2 Samuel', chapter: 15 },
          { bookName: '2 Samuel', chapter: 16 },
          { bookName: '2 Samuel', chapter: 17 },
          { bookName: '2 Samuel', chapter: 18 },
          { bookName: '2 Samuel', chapter: 19 },
          { bookName: '2 Samuel', chapter: 20 },
          { bookName: '2 Samuel', chapter: 21 },
          { bookName: '2 Samuel', chapter: 22 },
          { bookName: '2 Samuel', chapter: 23 },
          { bookName: '2 Samuel', chapter: 24 },
          { bookName: '1 Kings', chapter: 1 },
          { bookName: '1 Kings', chapter: 2 },
        ]
      },
      {
        title: 'Legacy & Remembrance',
        chapters: [
          { bookName: 'Psalms', chapter: 3 },
          { bookName: 'Psalms', chapter: 18 },
          { bookName: 'Psalms', chapter: 23 },
          { bookName: 'Psalms', chapter: 51 },
          { bookName: 'Psalms', chapter: 103 },
          { bookName: 'Acts', chapter: 13 },
          { bookName: 'Romans', chapter: 1 },
        ]
      }
    ]
  },
  
  Elijah: {
    iconKey: 'fire',
    accentColorKey: 'red',
    hook: 'Faithful when standing alone.',
    description: 'Walk with Elijah through bold faith, deep discouragement, and renewed strength from God.',
    sections: [
      {
        title: 'Sudden Calling',
        chapters: [
          { bookName: '1 Kings', chapter: 17 },
        ]
      },
      {
        title: 'Defining Confrontation',
        chapters: [
          { bookName: '1 Kings', chapter: 18 },
        ]
      },
      {
        title: 'Discouragement & Renewal',
        chapters: [
          { bookName: '1 Kings', chapter: 19 },
        ]
      },
      {
        title: 'Final Ministry & Transition',
        chapters: [
          { bookName: '1 Kings', chapter: 20 },
          { bookName: '1 Kings', chapter: 21 },
          { bookName: '1 Kings', chapter: 22 },
          { bookName: '2 Kings', chapter: 1 },
          { bookName: '2 Kings', chapter: 2 },
        ]
      },
      {
        title: 'Legacy & Remembrance',
        chapters: [
          { bookName: 'Malachi', chapter: 4 },
          { bookName: 'Matthew', chapter: 17 },
          { bookName: 'Luke', chapter: 4 },
          { bookName: 'James', chapter: 5 },
        ]
      }
    ]
  },
  
  Daniel: {
    iconKey: 'lion',
    accentColorKey: 'amber',
    hook: 'Faithful in a hostile world.',
    description: 'Follow Daniel's unwavering faith and trust in God's sovereignty while living in exile.',
    sections: [
      {
        title: 'Formation in Captivity',
        chapters: [
          { bookName: 'Daniel', chapter: 1 },
        ]
      },
      {
        title: 'Defining Stands',
        chapters: [
          { bookName: 'Daniel', chapter: 2 },
          { bookName: 'Daniel', chapter: 3 },
          { bookName: 'Daniel', chapter: 6 },
        ]
      },
      {
        title: 'God's Revelation',
        chapters: [
          { bookName: 'Daniel', chapter: 4 },
          { bookName: 'Daniel', chapter: 5 },
          { bookName: 'Daniel', chapter: 7 },
          { bookName: 'Daniel', chapter: 8 },
          { bookName: 'Daniel', chapter: 9 },
        ]
      },
      {
        title: 'Endurance in Leadership',
        chapters: [
          { bookName: 'Daniel', chapter: 10 },
          { bookName: 'Daniel', chapter: 11 },
          { bookName: 'Daniel', chapter: 12 },
        ]
      },
      {
        title: 'Legacy & Remembrance',
        chapters: [
          { bookName: 'Ezekiel', chapter: 14 },
          { bookName: 'Matthew', chapter: 24 },
        ]
      }
    ]
  },
  
  Peter: {
    iconKey: 'keys',
    accentColorKey: 'indigo',
    hook: 'Restored by grace, strengthened for service.',
    description: 'Trace Peter's transformation from fearful disciple to faithful shepherd of the early church.',
    sections: [
      {
        title: 'Formation as a Disciple',
        chapters: [
          { bookName: 'Matthew', chapter: 4 },
          { bookName: 'Luke', chapter: 5 },
          { bookName: 'John', chapter: 1 },
        ]
      },
      {
        title: 'Defining Failure',
        chapters: [
          { bookName: 'Matthew', chapter: 14 },
          { bookName: 'Matthew', chapter: 16 },
          { bookName: 'Matthew', chapter: 26 },
          { bookName: 'Luke', chapter: 22 },
        ]
      },
      {
        title: 'Restoration & Commissioning',
        chapters: [
          { bookName: 'John', chapter: 21 },
        ]
      },
      {
        title: 'Leadership in the Church',
        chapters: [
          { bookName: 'Acts', chapter: 1 },
          { bookName: 'Acts', chapter: 2 },
          { bookName: 'Acts', chapter: 3 },
          { bookName: 'Acts', chapter: 4 },
          { bookName: 'Acts', chapter: 5 },
          { bookName: 'Acts', chapter: 10 },
          { bookName: 'Acts', chapter: 11 },
          { bookName: 'Acts', chapter: 12 },
        ]
      },
      {
        title: 'Legacy & Teaching',
        chapters: [
          { bookName: '1 Peter', chapter: 1 },
          { bookName: '1 Peter', chapter: 2 },
          { bookName: '1 Peter', chapter: 3 },
          { bookName: '1 Peter', chapter: 4 },
          { bookName: '1 Peter', chapter: 5 },
          { bookName: '2 Peter', chapter: 1 },
          { bookName: '2 Peter', chapter: 2 },
          { bookName: '2 Peter', chapter: 3 },
          { bookName: 'Galatians', chapter: 2 },
        ]
      }
    ]
  },
  
  Paul: {
    iconKey: 'scroll',
    accentColorKey: 'rose',
    hook: 'Saved by grace. Sent with purpose.',
    description: 'Journey through Paul's conversion, missionary ministry, and final testimony of faith.',
    sections: [
      {
        title: 'Formation & Opposition',
        chapters: [
          { bookName: 'Acts', chapter: 7 },
          { bookName: 'Acts', chapter: 8 },
        ]
      },
      {
        title: 'Defining Conversion',
        chapters: [
          { bookName: 'Acts', chapter: 9 },
        ]
      },
      {
        title: 'Calling Confirmed',
        chapters: [
          { bookName: 'Acts', chapter: 13 },
          { bookName: 'Acts', chapter: 26 },
        ]
      },
      {
        title: 'Missionary Leadership',
        chapters: [
          { bookName: 'Acts', chapter: 14 },
          { bookName: 'Acts', chapter: 15 },
          { bookName: 'Acts', chapter: 16 },
          { bookName: 'Acts', chapter: 17 },
          { bookName: 'Acts', chapter: 18 },
          { bookName: 'Acts', chapter: 19 },
          { bookName: 'Acts', chapter: 20 },
          { bookName: 'Acts', chapter: 21 },
          { bookName: 'Acts', chapter: 22 },
          { bookName: 'Acts', chapter: 23 },
          { bookName: 'Acts', chapter: 24 },
          { bookName: 'Acts', chapter: 25 },
          { bookName: 'Acts', chapter: 27 },
          { bookName: 'Acts', chapter: 28 },
          { bookName: 'Romans', chapter: 1 },
          { bookName: 'Romans', chapter: 2 },
          { bookName: 'Romans', chapter: 3 },
          { bookName: 'Romans', chapter: 4 },
          { bookName: 'Romans', chapter: 5 },
          { bookName: 'Romans', chapter: 6 },
          { bookName: 'Romans', chapter: 7 },
          { bookName: 'Romans', chapter: 8 },
          { bookName: 'Romans', chapter: 9 },
          { bookName: 'Romans', chapter: 10 },
          { bookName: 'Romans', chapter: 11 },
          { bookName: 'Romans', chapter: 12 },
          { bookName: 'Romans', chapter: 13 },
          { bookName: 'Romans', chapter: 14 },
          { bookName: 'Romans', chapter: 15 },
          { bookName: 'Romans', chapter: 16 },
        ]
      },
      {
        title: 'Legacy & Final Testimony',
        chapters: [
          { bookName: '1 Timothy', chapter: 1 },
          { bookName: '1 Timothy', chapter: 2 },
          { bookName: '1 Timothy', chapter: 3 },
          { bookName: '1 Timothy', chapter: 4 },
          { bookName: '1 Timothy', chapter: 5 },
          { bookName: '1 Timothy', chapter: 6 },
          { bookName: '2 Timothy', chapter: 1 },
          { bookName: '2 Timothy', chapter: 2 },
          { bookName: '2 Timothy', chapter: 3 },
          { bookName: '2 Timothy', chapter: 4 },
          { bookName: 'Titus', chapter: 1 },
          { bookName: 'Titus', chapter: 2 },
          { bookName: 'Titus', chapter: 3 },
          { bookName: 'Philemon', chapter: 1 },
        ]
      }
    ]
  },
};

/**
 * Flatten a character's sections into a single chapter list
 */
export function flattenCharacterSections(characterKey) {
  const character = CHARACTER_LIBRARY[characterKey];
  if (!character) return [];
  
  const chapters = [];
  character.sections.forEach(section => {
    section.chapters.forEach(ch => {
      chapters.push(ch);
    });
  });
  
  return chapters;
}