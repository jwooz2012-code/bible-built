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
  Joshua: {
    iconKey: 'sword',
    accentColorKey: 'orange',
    sections: [
      {
        title: 'Formation & Early Context',
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
        title: 'Calling & Commissioning',
        chapters: [
          { bookName: 'Numbers', chapter: 27 },
          { bookName: 'Deuteronomy', chapter: 31 },
          { bookName: 'Deuteronomy', chapter: 34 },
          { bookName: 'Joshua', chapter: 1 },
        ]
      },
      {
        title: 'Leadership / Ministry Narrative',
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
          { bookName: 'Joshua', chapter: 23 },
          { bookName: 'Joshua', chapter: 24 },
        ]
      },
      {
        title: 'Legacy & Later Remembrance',
        chapters: [
          { bookName: 'Judges', chapter: 2 },
          { bookName: 'Nehemiah', chapter: 9 },
          { bookName: 'Psalms', chapter: 44 },
          { bookName: 'Psalms', chapter: 105 },
        ]
      }
    ]
  },
  
  Abraham: {
    iconKey: 'stars',
    accentColorKey: 'blue',
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
        title: 'Calling & Commissioning',
        chapters: [
          { bookName: 'Genesis', chapter: 12 },
          { bookName: 'Genesis', chapter: 13 },
        ]
      },
      {
        title: 'Leadership / Ministry Narrative',
        chapters: [
          { bookName: 'Genesis', chapter: 14 },
          { bookName: 'Genesis', chapter: 18 },
          { bookName: 'Genesis', chapter: 19 },
          { bookName: 'Genesis', chapter: 20 },
          { bookName: 'Genesis', chapter: 21 },
          { bookName: 'Genesis', chapter: 23 },
          { bookName: 'Genesis', chapter: 24 },
        ]
      },
      {
        title: 'Legacy & Later Remembrance',
        chapters: [
          { bookName: 'Genesis', chapter: 25 },
          { bookName: 'Romans', chapter: 4 },
          { bookName: 'Hebrews', chapter: 11 },
        ]
      }
    ]
  },
  
  Job: {
    iconKey: 'storm',
    accentColorKey: 'slate',
    sections: [
      {
        title: 'Formation & Early Context',
        chapters: [
          { bookName: 'Job', chapter: 1 },
        ]
      },
      {
        title: 'Defining Test of Faith',
        chapters: [
          { bookName: 'Job', chapter: 2 },
          { bookName: 'Job', chapter: 3 },
          { bookName: 'Job', chapter: 6 },
          { bookName: 'Job', chapter: 7 },
        ]
      },
      {
        title: 'Calling & Commissioning',
        chapters: [
          { bookName: 'Job', chapter: 13 },
          { bookName: 'Job', chapter: 19 },
        ]
      },
      {
        title: 'Leadership / Ministry Narrative',
        chapters: [
          { bookName: 'Job', chapter: 28 },
          { bookName: 'Job', chapter: 29 },
          { bookName: 'Job', chapter: 31 },
          { bookName: 'Job', chapter: 38 },
          { bookName: 'Job', chapter: 40 },
          { bookName: 'Job', chapter: 42 },
        ]
      },
      {
        title: 'Legacy & Later Remembrance',
        chapters: [
          { bookName: 'Ezekiel', chapter: 14 },
          { bookName: 'James', chapter: 5 },
        ]
      }
    ]
  },
  
  Joseph: {
    iconKey: 'coat',
    accentColorKey: 'emerald',
    sections: [
      {
        title: 'Formation & Early Context',
        chapters: [
          { bookName: 'Genesis', chapter: 37 },
        ]
      },
      {
        title: 'Defining Test of Faith',
        chapters: [
          { bookName: 'Genesis', chapter: 39 },
          { bookName: 'Genesis', chapter: 40 },
        ]
      },
      {
        title: 'Calling & Commissioning',
        chapters: [
          { bookName: 'Genesis', chapter: 41 },
        ]
      },
      {
        title: 'Leadership / Ministry Narrative',
        chapters: [
          { bookName: 'Genesis', chapter: 42 },
          { bookName: 'Genesis', chapter: 43 },
          { bookName: 'Genesis', chapter: 44 },
          { bookName: 'Genesis', chapter: 45 },
          { bookName: 'Genesis', chapter: 46 },
          { bookName: 'Genesis', chapter: 47 },
          { bookName: 'Genesis', chapter: 50 },
        ]
      },
      {
        title: 'Legacy & Later Remembrance',
        chapters: [
          { bookName: 'Hebrews', chapter: 11 },
        ]
      }
    ]
  },
  
  Moses: {
    iconKey: 'tablets',
    accentColorKey: 'purple',
    sections: [
      {
        title: 'Formation & Early Context',
        chapters: [
          { bookName: 'Exodus', chapter: 2 },
        ]
      },
      {
        title: 'Defining Test of Faith',
        chapters: [
          { bookName: 'Exodus', chapter: 3 },
          { bookName: 'Exodus', chapter: 4 },
        ]
      },
      {
        title: 'Calling & Commissioning',
        chapters: [
          { bookName: 'Exodus', chapter: 3 },
          { bookName: 'Exodus', chapter: 6 },
        ]
      },
      {
        title: 'Leadership / Ministry Narrative',
        chapters: [
          { bookName: 'Exodus', chapter: 7 },
          { bookName: 'Exodus', chapter: 12 },
          { bookName: 'Exodus', chapter: 14 },
          { bookName: 'Exodus', chapter: 19 },
          { bookName: 'Exodus', chapter: 20 },
          { bookName: 'Exodus', chapter: 32 },
          { bookName: 'Exodus', chapter: 33 },
          { bookName: 'Numbers', chapter: 11 },
          { bookName: 'Numbers', chapter: 13 },
          { bookName: 'Numbers', chapter: 14 },
          { bookName: 'Numbers', chapter: 20 },
        ]
      },
      {
        title: 'Legacy & Later Remembrance',
        chapters: [
          { bookName: 'Deuteronomy', chapter: 34 },
          { bookName: 'Hebrews', chapter: 11 },
        ]
      }
    ]
  },
  
  David: {
    iconKey: 'harp',
    accentColorKey: 'cyan',
    sections: [
      {
        title: 'Formation & Early Context',
        chapters: [
          { bookName: '1 Samuel', chapter: 16 },
        ]
      },
      {
        title: 'Defining Test of Faith',
        chapters: [
          { bookName: '1 Samuel', chapter: 17 },
          { bookName: '1 Samuel', chapter: 24 },
          { bookName: '1 Samuel', chapter: 26 },
        ]
      },
      {
        title: 'Calling & Commissioning',
        chapters: [
          { bookName: '2 Samuel', chapter: 5 },
          { bookName: '2 Samuel', chapter: 7 },
        ]
      },
      {
        title: 'Leadership / Ministry Narrative',
        chapters: [
          { bookName: '2 Samuel', chapter: 6 },
          { bookName: '2 Samuel', chapter: 11 },
          { bookName: '2 Samuel', chapter: 12 },
          { bookName: '2 Samuel', chapter: 15 },
          { bookName: '1 Kings', chapter: 2 },
        ]
      },
      {
        title: 'Legacy & Later Remembrance',
        chapters: [
          { bookName: 'Psalms', chapter: 23 },
          { bookName: 'Psalms', chapter: 51 },
          { bookName: 'Psalms', chapter: 89 },
          { bookName: 'Acts', chapter: 13 },
        ]
      }
    ]
  },
  
  Elijah: {
    iconKey: 'fire',
    accentColorKey: 'red',
    sections: [
      {
        title: 'Formation & Early Context',
        chapters: [
          { bookName: '1 Kings', chapter: 17 },
        ]
      },
      {
        title: 'Defining Test of Faith',
        chapters: [
          { bookName: '1 Kings', chapter: 18 },
        ]
      },
      {
        title: 'Calling & Commissioning',
        chapters: [
          { bookName: '1 Kings', chapter: 19 },
        ]
      },
      {
        title: 'Leadership / Ministry Narrative',
        chapters: [
          { bookName: '1 Kings', chapter: 21 },
          { bookName: '2 Kings', chapter: 1 },
        ]
      },
      {
        title: 'Legacy & Later Remembrance',
        chapters: [
          { bookName: '2 Kings', chapter: 2 },
          { bookName: 'Malachi', chapter: 4 },
          { bookName: 'Matthew', chapter: 17 },
        ]
      }
    ]
  },
  
  Daniel: {
    iconKey: 'lion',
    accentColorKey: 'amber',
    sections: [
      {
        title: 'Formation & Early Context',
        chapters: [
          { bookName: 'Daniel', chapter: 1 },
        ]
      },
      {
        title: 'Defining Test of Faith',
        chapters: [
          { bookName: 'Daniel', chapter: 3 },
          { bookName: 'Daniel', chapter: 6 },
        ]
      },
      {
        title: 'Calling & Commissioning',
        chapters: [
          { bookName: 'Daniel', chapter: 2 },
        ]
      },
      {
        title: 'Leadership / Ministry Narrative',
        chapters: [
          { bookName: 'Daniel', chapter: 4 },
          { bookName: 'Daniel', chapter: 5 },
          { bookName: 'Daniel', chapter: 9 },
        ]
      },
      {
        title: 'Legacy & Later Remembrance',
        chapters: [
          { bookName: 'Daniel', chapter: 10 },
          { bookName: 'Daniel', chapter: 12 },
          { bookName: 'Ezekiel', chapter: 14 },
        ]
      }
    ]
  },
  
  Peter: {
    iconKey: 'keys',
    accentColorKey: 'indigo',
    sections: [
      {
        title: 'Formation & Early Context',
        chapters: [
          { bookName: 'Matthew', chapter: 4 },
          { bookName: 'Luke', chapter: 5 },
        ]
      },
      {
        title: 'Defining Test of Faith',
        chapters: [
          { bookName: 'Matthew', chapter: 14 },
          { bookName: 'Matthew', chapter: 16 },
          { bookName: 'Matthew', chapter: 26 },
        ]
      },
      {
        title: 'Calling & Commissioning',
        chapters: [
          { bookName: 'John', chapter: 21 },
        ]
      },
      {
        title: 'Leadership / Ministry Narrative',
        chapters: [
          { bookName: 'Acts', chapter: 2 },
          { bookName: 'Acts', chapter: 3 },
          { bookName: 'Acts', chapter: 4 },
          { bookName: 'Acts', chapter: 10 },
        ]
      },
      {
        title: 'Legacy & Later Remembrance',
        chapters: [
          { bookName: '1 Peter', chapter: 1 },
          { bookName: '1 Peter', chapter: 5 },
          { bookName: '2 Peter', chapter: 1 },
        ]
      }
    ]
  },
  
  Paul: {
    iconKey: 'scroll',
    accentColorKey: 'rose',
    sections: [
      {
        title: 'Formation & Early Context',
        chapters: [
          { bookName: 'Acts', chapter: 7 },
          { bookName: 'Acts', chapter: 8 },
        ]
      },
      {
        title: 'Defining Test of Faith',
        chapters: [
          { bookName: 'Acts', chapter: 9 },
        ]
      },
      {
        title: 'Calling & Commissioning',
        chapters: [
          { bookName: 'Acts', chapter: 13 },
          { bookName: 'Acts', chapter: 26 },
        ]
      },
      {
        title: 'Leadership / Ministry Narrative',
        chapters: [
          { bookName: 'Acts', chapter: 16 },
          { bookName: 'Acts', chapter: 17 },
          { bookName: 'Acts', chapter: 20 },
          { bookName: 'Acts', chapter: 27 },
          { bookName: 'Acts', chapter: 28 },
        ]
      },
      {
        title: 'Legacy & Later Remembrance',
        chapters: [
          { bookName: 'Romans', chapter: 8 },
          { bookName: 'Philippians', chapter: 4 },
          { bookName: '2 Timothy', chapter: 4 },
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