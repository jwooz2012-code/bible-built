export const CURATED_PLANS = {
  CHRONOLOGICAL_OT: [
    // Genesis 1-11
    { bookName: "Genesis", chapter: 1 }, { bookName: "Genesis", chapter: 2 }, { bookName: "Genesis", chapter: 3 }, 
    { bookName: "Genesis", chapter: 4 }, { bookName: "Genesis", chapter: 5 }, { bookName: "Genesis", chapter: 6 }, 
    { bookName: "Genesis", chapter: 7 }, { bookName: "Genesis", chapter: 8 }, { bookName: "Genesis", chapter: 9 }, 
    { bookName: "Genesis", chapter: 10 }, { bookName: "Genesis", chapter: 11 },
    // Job 1-42
    { bookName: "Job", chapter: 1 }, { bookName: "Job", chapter: 2 }, { bookName: "Job", chapter: 3 }, 
    { bookName: "Job", chapter: 4 }, { bookName: "Job", chapter: 5 }, { bookName: "Job", chapter: 6 }, 
    { bookName: "Job", chapter: 7 }, { bookName: "Job", chapter: 8 }, { bookName: "Job", chapter: 9 }, 
    { bookName: "Job", chapter: 10 }, { bookName: "Job", chapter: 11 }, { bookName: "Job", chapter: 12 }, 
    { bookName: "Job", chapter: 13 }, { bookName: "Job", chapter: 14 }, { bookName: "Job", chapter: 15 }, 
    { bookName: "Job", chapter: 16 }, { bookName: "Job", chapter: 17 }, { bookName: "Job", chapter: 18 }, 
    { bookName: "Job", chapter: 19 }, { bookName: "Job", chapter: 20 }, { bookName: "Job", chapter: 21 }, 
    { bookName: "Job", chapter: 22 }, { bookName: "Job", chapter: 23 }, { bookName: "Job", chapter: 24 }, 
    { bookName: "Job", chapter: 25 }, { bookName: "Job", chapter: 26 }, { bookName: "Job", chapter: 27 }, 
    { bookName: "Job", chapter: 28 }, { bookName: "Job", chapter: 29 }, { bookName: "Job", chapter: 30 }, 
    { bookName: "Job", chapter: 31 }, { bookName: "Job", chapter: 32 }, { bookName: "Job", chapter: 33 }, 
    { bookName: "Job", chapter: 34 }, { bookName: "Job", chapter: 35 }, { bookName: "Job", chapter: 36 }, 
    { bookName: "Job", chapter: 37 }, { bookName: "Job", chapter: 38 }, { bookName: "Job", chapter: 39 }, 
    { bookName: "Job", chapter: 40 }, { bookName: "Job", chapter: 41 }, { bookName: "Job", chapter: 42 },
    // Genesis 12-50
    { bookName: "Genesis", chapter: 12 }, { bookName: "Genesis", chapter: 13 }, { bookName: "Genesis", chapter: 14 }, 
    { bookName: "Genesis", chapter: 15 }, { bookName: "Genesis", chapter: 16 }, { bookName: "Genesis", chapter: 17 }, 
    { bookName: "Genesis", chapter: 18 }, { bookName: "Genesis", chapter: 19 }, { bookName: "Genesis", chapter: 20 }, 
    { bookName: "Genesis", chapter: 21 }, { bookName: "Genesis", chapter: 22 }, { bookName: "Genesis", chapter: 23 }, 
    { bookName: "Genesis", chapter: 24 }, { bookName: "Genesis", chapter: 25 }, { bookName: "Genesis", chapter: 26 }, 
    { bookName: "Genesis", chapter: 27 }, { bookName: "Genesis", chapter: 28 }, { bookName: "Genesis", chapter: 29 }, 
    { bookName: "Genesis", chapter: 30 }, { bookName: "Genesis", chapter: 31 }, { bookName: "Genesis", chapter: 32 }, 
    { bookName: "Genesis", chapter: 33 }, { bookName: "Genesis", chapter: 34 }, { bookName: "Genesis", chapter: 35 }, 
    { bookName: "Genesis", chapter: 36 }, { bookName: "Genesis", chapter: 37 }, { bookName: "Genesis", chapter: 38 }, 
    { bookName: "Genesis", chapter: 39 }, { bookName: "Genesis", chapter: 40 }, { bookName: "Genesis", chapter: 41 }, 
    { bookName: "Genesis", chapter: 42 }, { bookName: "Genesis", chapter: 43 }, { bookName: "Genesis", chapter: 44 }, 
    { bookName: "Genesis", chapter: 45 }, { bookName: "Genesis", chapter: 46 }, { bookName: "Genesis", chapter: 47 }, 
    { bookName: "Genesis", chapter: 48 }, { bookName: "Genesis", chapter: 49 }, { bookName: "Genesis", chapter: 50 },
    // Exodus 1-40
    ...Array.from({length: 40}, (_, i) => ({ bookName: "Exodus", chapter: i + 1 })),
    // Leviticus 1-27
    ...Array.from({length: 27}, (_, i) => ({ bookName: "Leviticus", chapter: i + 1 })),
    // Numbers 1-36
    ...Array.from({length: 36}, (_, i) => ({ bookName: "Numbers", chapter: i + 1 })),
    // Psalm 90
    { bookName: "Psalms", chapter: 90 },
    // Deuteronomy 1-34
    ...Array.from({length: 34}, (_, i) => ({ bookName: "Deuteronomy", chapter: i + 1 })),
    // Joshua 1-24
    ...Array.from({length: 24}, (_, i) => ({ bookName: "Joshua", chapter: i + 1 })),
    // Judges 1-21
    ...Array.from({length: 21}, (_, i) => ({ bookName: "Judges", chapter: i + 1 })),
    // Ruth 1-4
    ...Array.from({length: 4}, (_, i) => ({ bookName: "Ruth", chapter: i + 1 })),
    // 1 Samuel 1-31
    ...Array.from({length: 31}, (_, i) => ({ bookName: "1 Samuel", chapter: i + 1 })),
    // Psalms (David's early years)
    { bookName: "Psalms", chapter: 7 }, { bookName: "Psalms", chapter: 34 }, { bookName: "Psalms", chapter: 52 }, 
    { bookName: "Psalms", chapter: 54 }, { bookName: "Psalms", chapter: 56 }, { bookName: "Psalms", chapter: 57 }, 
    { bookName: "Psalms", chapter: 59 }, { bookName: "Psalms", chapter: 142 },
    // 2 Samuel 1-24
    ...Array.from({length: 24}, (_, i) => ({ bookName: "2 Samuel", chapter: i + 1 })),
    // Psalms (David's reign)
    { bookName: "Psalms", chapter: 2 }, { bookName: "Psalms", chapter: 3 }, { bookName: "Psalms", chapter: 4 }, 
    { bookName: "Psalms", chapter: 18 }, { bookName: "Psalms", chapter: 20 }, { bookName: "Psalms", chapter: 21 }, 
    { bookName: "Psalms", chapter: 22 }, { bookName: "Psalms", chapter: 23 }, { bookName: "Psalms", chapter: 24 }, 
    { bookName: "Psalms", chapter: 32 }, { bookName: "Psalms", chapter: 38 }, { bookName: "Psalms", chapter: 51 }, 
    { bookName: "Psalms", chapter: 63 }, { bookName: "Psalms", chapter: 101 }, { bookName: "Psalms", chapter: 103 }, 
    { bookName: "Psalms", chapter: 110 }, { bookName: "Psalms", chapter: 122 }, { bookName: "Psalms", chapter: 124 }, 
    { bookName: "Psalms", chapter: 131 }, { bookName: "Psalms", chapter: 133 }, { bookName: "Psalms", chapter: 138 }, 
    { bookName: "Psalms", chapter: 139 }, { bookName: "Psalms", chapter: 140 }, { bookName: "Psalms", chapter: 141 }, 
    { bookName: "Psalms", chapter: 142 }, { bookName: "Psalms", chapter: 143 }, { bookName: "Psalms", chapter: 144 }, 
    { bookName: "Psalms", chapter: 145 },
    // 1 Chronicles 1-29
    ...Array.from({length: 29}, (_, i) => ({ bookName: "1 Chronicles", chapter: i + 1 })),
    // 1 Kings 1-11
    ...Array.from({length: 11}, (_, i) => ({ bookName: "1 Kings", chapter: i + 1 })),
    // 2 Chronicles 1-9
    ...Array.from({length: 9}, (_, i) => ({ bookName: "2 Chronicles", chapter: i + 1 })),
    // Psalms (Solomon)
    { bookName: "Psalms", chapter: 72 }, { bookName: "Psalms", chapter: 127 },
    // Proverbs 1-31
    ...Array.from({length: 31}, (_, i) => ({ bookName: "Proverbs", chapter: i + 1 })),
    // Ecclesiastes 1-12
    ...Array.from({length: 12}, (_, i) => ({ bookName: "Ecclesiastes", chapter: i + 1 })),
    // Song of Solomon 1-8
    ...Array.from({length: 8}, (_, i) => ({ bookName: "Song of Solomon", chapter: i + 1 })),
    // 1 Kings 12-22
    ...Array.from({length: 11}, (_, i) => ({ bookName: "1 Kings", chapter: i + 12 })),
    // 2 Kings 1-17
    ...Array.from({length: 17}, (_, i) => ({ bookName: "2 Kings", chapter: i + 1 })),
    // 2 Chronicles 10-28
    ...Array.from({length: 19}, (_, i) => ({ bookName: "2 Chronicles", chapter: i + 10 })),
    // Psalms (divided kingdom)
    { bookName: "Psalms", chapter: 42 }, { bookName: "Psalms", chapter: 43 }, { bookName: "Psalms", chapter: 44 }, 
    { bookName: "Psalms", chapter: 45 }, { bookName: "Psalms", chapter: 46 }, { bookName: "Psalms", chapter: 47 }, 
    { bookName: "Psalms", chapter: 48 }, { bookName: "Psalms", chapter: 49 }, { bookName: "Psalms", chapter: 73 }, 
    { bookName: "Psalms", chapter: 74 }, { bookName: "Psalms", chapter: 75 }, { bookName: "Psalms", chapter: 76 }, 
    { bookName: "Psalms", chapter: 77 }, { bookName: "Psalms", chapter: 78 }, { bookName: "Psalms", chapter: 79 }, 
    { bookName: "Psalms", chapter: 80 }, { bookName: "Psalms", chapter: 81 }, { bookName: "Psalms", chapter: 82 }, 
    { bookName: "Psalms", chapter: 83 }, { bookName: "Psalms", chapter: 84 }, { bookName: "Psalms", chapter: 85 }, 
    { bookName: "Psalms", chapter: 87 }, { bookName: "Psalms", chapter: 88 },
    // Jonah 1-4
    ...Array.from({length: 4}, (_, i) => ({ bookName: "Jonah", chapter: i + 1 })),
    // Amos 1-9
    ...Array.from({length: 9}, (_, i) => ({ bookName: "Amos", chapter: i + 1 })),
    // Hosea 1-14
    ...Array.from({length: 14}, (_, i) => ({ bookName: "Hosea", chapter: i + 1 })),
    // Isaiah 1-39
    ...Array.from({length: 39}, (_, i) => ({ bookName: "Isaiah", chapter: i + 1 })),
    // Micah 1-7
    ...Array.from({length: 7}, (_, i) => ({ bookName: "Micah", chapter: i + 1 })),
    // 2 Kings 18-25
    ...Array.from({length: 8}, (_, i) => ({ bookName: "2 Kings", chapter: i + 18 })),
    // 2 Chronicles 29-36
    ...Array.from({length: 8}, (_, i) => ({ bookName: "2 Chronicles", chapter: i + 29 })),
    // Nahum 1-3
    ...Array.from({length: 3}, (_, i) => ({ bookName: "Nahum", chapter: i + 1 })),
    // Zephaniah 1-3
    ...Array.from({length: 3}, (_, i) => ({ bookName: "Zephaniah", chapter: i + 1 })),
    // Habakkuk 1-3
    ...Array.from({length: 3}, (_, i) => ({ bookName: "Habakkuk", chapter: i + 1 })),
    // Jeremiah 1-52
    ...Array.from({length: 52}, (_, i) => ({ bookName: "Jeremiah", chapter: i + 1 })),
    // Lamentations 1-5
    ...Array.from({length: 5}, (_, i) => ({ bookName: "Lamentations", chapter: i + 1 })),
    // Ezekiel 1-48
    ...Array.from({length: 48}, (_, i) => ({ bookName: "Ezekiel", chapter: i + 1 })),
    // Daniel 1-12
    ...Array.from({length: 12}, (_, i) => ({ bookName: "Daniel", chapter: i + 1 })),
    // Psalms (exile)
    { bookName: "Psalms", chapter: 102 }, { bookName: "Psalms", chapter: 137 },
    // Ezra 1-6
    ...Array.from({length: 6}, (_, i) => ({ bookName: "Ezra", chapter: i + 1 })),
    // Haggai 1-2
    ...Array.from({length: 2}, (_, i) => ({ bookName: "Haggai", chapter: i + 1 })),
    // Zechariah 1-14
    ...Array.from({length: 14}, (_, i) => ({ bookName: "Zechariah", chapter: i + 1 })),
    // Ezra 7-10
    ...Array.from({length: 4}, (_, i) => ({ bookName: "Ezra", chapter: i + 7 })),
    // Esther 1-10
    ...Array.from({length: 10}, (_, i) => ({ bookName: "Esther", chapter: i + 1 })),
    // Nehemiah 1-13
    ...Array.from({length: 13}, (_, i) => ({ bookName: "Nehemiah", chapter: i + 1 })),
    // Psalms (songs of ascent)
    ...Array.from({length: 15}, (_, i) => ({ bookName: "Psalms", chapter: i + 120 })),
    // Malachi 1-4
    ...Array.from({length: 4}, (_, i) => ({ bookName: "Malachi", chapter: i + 1 })),
    // Psalms (final praise)
    { bookName: "Psalms", chapter: 146 }, { bookName: "Psalms", chapter: 147 }, { bookName: "Psalms", chapter: 148 }, 
    { bookName: "Psalms", chapter: 149 }, { bookName: "Psalms", chapter: 150 },
  ],
  WHO_IS_JESUS: [
    // SECTION 1: PROMISED MESSIAH (PROPHECY)
    { bookName: 'Genesis', chapter: 3 },
    { bookName: 'Genesis', chapter: 12 },
    { bookName: 'Genesis', chapter: 22 },
    { bookName: 'Deuteronomy', chapter: 18 },
    { bookName: 'Psalms', chapter: 2 },
    { bookName: 'Psalms', chapter: 22 },
    { bookName: 'Psalms', chapter: 110 },
    { bookName: 'Isaiah', chapter: 7 },
    { bookName: 'Isaiah', chapter: 9 },
    { bookName: 'Isaiah', chapter: 11 },
    { bookName: 'Isaiah', chapter: 53 },
    { bookName: 'Micah', chapter: 5 },
    { bookName: 'Daniel', chapter: 7 },
    // SECTION 2: INCARNATION & IDENTITY
    { bookName: 'Matthew', chapter: 1 },
    { bookName: 'Matthew', chapter: 2 },
    { bookName: 'Luke', chapter: 1 },
    { bookName: 'Luke', chapter: 2 },
    { bookName: 'John', chapter: 1 },
    { bookName: 'Matthew', chapter: 3 },
    { bookName: 'Luke', chapter: 3 },
    // SECTION 3: MINISTRY & MESSAGE
    { bookName: 'Matthew', chapter: 5 },
    { bookName: 'Matthew', chapter: 6 },
    { bookName: 'Matthew', chapter: 7 },
    { bookName: 'Matthew', chapter: 11 },
    { bookName: 'Matthew', chapter: 12 },
    { bookName: 'Matthew', chapter: 13 },
    { bookName: 'Luke', chapter: 4 },
    { bookName: 'Luke', chapter: 7 },
    { bookName: 'Luke', chapter: 9 },
    { bookName: 'Luke', chapter: 15 },
    { bookName: 'John', chapter: 3 },
    { bookName: 'John', chapter: 6 },
    { bookName: 'John', chapter: 8 },
    { bookName: 'John', chapter: 10 },
    { bookName: 'John', chapter: 11 },
    // SECTION 4: REJECTION, CROSS & ATONEMENT
    { bookName: 'Matthew', chapter: 26 },
    { bookName: 'Matthew', chapter: 27 },
    { bookName: 'Luke', chapter: 22 },
    { bookName: 'Luke', chapter: 23 },
    { bookName: 'John', chapter: 18 },
    { bookName: 'John', chapter: 19 },
    { bookName: 'Psalms', chapter: 22 },
    { bookName: 'Isaiah', chapter: 53 },
    // SECTION 5: RESURRECTION, EXALTATION & ETERNAL REIGN
    { bookName: 'Matthew', chapter: 28 },
    { bookName: 'Luke', chapter: 24 },
    { bookName: 'John', chapter: 20 },
    { bookName: 'John', chapter: 21 },
    { bookName: 'Acts', chapter: 1 },
    { bookName: 'Acts', chapter: 2 },
    { bookName: 'Philippians', chapter: 2 },
    { bookName: 'Colossians', chapter: 1 },
    { bookName: 'Hebrews', chapter: 1 },
    { bookName: 'Hebrews', chapter: 7 },
    { bookName: 'Revelation', chapter: 1 },
    { bookName: 'Revelation', chapter: 5 },
    { bookName: 'Revelation', chapter: 19 },
  ],
  LEADERSHIP_INTENSIVE: [
    // Nehemiah 1–13
    { bookName: 'Nehemiah', chapter: 1 },
    { bookName: 'Nehemiah', chapter: 2 },
    { bookName: 'Nehemiah', chapter: 3 },
    { bookName: 'Nehemiah', chapter: 4 },
    { bookName: 'Nehemiah', chapter: 5 },
    { bookName: 'Nehemiah', chapter: 6 },
    { bookName: 'Nehemiah', chapter: 7 },
    { bookName: 'Nehemiah', chapter: 8 },
    { bookName: 'Nehemiah', chapter: 9 },
    { bookName: 'Nehemiah', chapter: 10 },
    { bookName: 'Nehemiah', chapter: 11 },
    { bookName: 'Nehemiah', chapter: 12 },
    { bookName: 'Nehemiah', chapter: 13 },
    // 1 Timothy 1–6
    { bookName: '1 Timothy', chapter: 1 },
    { bookName: '1 Timothy', chapter: 2 },
    { bookName: '1 Timothy', chapter: 3 },
    { bookName: '1 Timothy', chapter: 4 },
    { bookName: '1 Timothy', chapter: 5 },
    { bookName: '1 Timothy', chapter: 6 },
    // 2 Timothy 1–4
    { bookName: '2 Timothy', chapter: 1 },
    { bookName: '2 Timothy', chapter: 2 },
    { bookName: '2 Timothy', chapter: 3 },
    { bookName: '2 Timothy', chapter: 4 },
    // Titus 1–3
    { bookName: 'Titus', chapter: 1 },
    { bookName: 'Titus', chapter: 2 },
    { bookName: 'Titus', chapter: 3 },
    // Exodus 18–20, 23–25, 32–34, 36–40
    { bookName: 'Exodus', chapter: 18 },
    { bookName: 'Exodus', chapter: 19 },
    { bookName: 'Exodus', chapter: 20 },
    { bookName: 'Exodus', chapter: 23 },
    { bookName: 'Exodus', chapter: 24 },
    { bookName: 'Exodus', chapter: 25 },
    { bookName: 'Exodus', chapter: 32 },
    { bookName: 'Exodus', chapter: 33 },
    { bookName: 'Exodus', chapter: 34 },
    { bookName: 'Exodus', chapter: 36 },
    { bookName: 'Exodus', chapter: 37 },
    { bookName: 'Exodus', chapter: 38 },
    { bookName: 'Exodus', chapter: 39 },
    { bookName: 'Exodus', chapter: 40 },
    // 1 Samuel 12–17, 24–26, 30
    { bookName: '1 Samuel', chapter: 12 },
    { bookName: '1 Samuel', chapter: 13 },
    { bookName: '1 Samuel', chapter: 14 },
    { bookName: '1 Samuel', chapter: 15 },
    { bookName: '1 Samuel', chapter: 16 },
    { bookName: '1 Samuel', chapter: 17 },
    { bookName: '1 Samuel', chapter: 24 },
    { bookName: '1 Samuel', chapter: 25 },
    { bookName: '1 Samuel', chapter: 26 },
    { bookName: '1 Samuel', chapter: 30 },
    // Matthew 20–28
    { bookName: 'Matthew', chapter: 20 },
    { bookName: 'Matthew', chapter: 21 },
    { bookName: 'Matthew', chapter: 22 },
    { bookName: 'Matthew', chapter: 23 },
    { bookName: 'Matthew', chapter: 24 },
    { bookName: 'Matthew', chapter: 25 },
    { bookName: 'Matthew', chapter: 26 },
    { bookName: 'Matthew', chapter: 27 },
    { bookName: 'Matthew', chapter: 28 },
    // Acts 1–7, 20
    { bookName: 'Acts', chapter: 1 },
    { bookName: 'Acts', chapter: 2 },
    { bookName: 'Acts', chapter: 3 },
    { bookName: 'Acts', chapter: 4 },
    { bookName: 'Acts', chapter: 5 },
    { bookName: 'Acts', chapter: 6 },
    { bookName: 'Acts', chapter: 7 },
    { bookName: 'Acts', chapter: 20 },
  ],
  WISDOM_PLUNGE: [
    // Proverbs 1–31
    { bookName: 'Proverbs', chapter: 1 },
    { bookName: 'Proverbs', chapter: 2 },
    { bookName: 'Proverbs', chapter: 3 },
    { bookName: 'Proverbs', chapter: 4 },
    { bookName: 'Proverbs', chapter: 5 },
    { bookName: 'Proverbs', chapter: 6 },
    { bookName: 'Proverbs', chapter: 7 },
    { bookName: 'Proverbs', chapter: 8 },
    { bookName: 'Proverbs', chapter: 9 },
    { bookName: 'Proverbs', chapter: 10 },
    { bookName: 'Proverbs', chapter: 11 },
    { bookName: 'Proverbs', chapter: 12 },
    { bookName: 'Proverbs', chapter: 13 },
    { bookName: 'Proverbs', chapter: 14 },
    { bookName: 'Proverbs', chapter: 15 },
    { bookName: 'Proverbs', chapter: 16 },
    { bookName: 'Proverbs', chapter: 17 },
    { bookName: 'Proverbs', chapter: 18 },
    { bookName: 'Proverbs', chapter: 19 },
    { bookName: 'Proverbs', chapter: 20 },
    { bookName: 'Proverbs', chapter: 21 },
    { bookName: 'Proverbs', chapter: 22 },
    { bookName: 'Proverbs', chapter: 23 },
    { bookName: 'Proverbs', chapter: 24 },
    { bookName: 'Proverbs', chapter: 25 },
    { bookName: 'Proverbs', chapter: 26 },
    { bookName: 'Proverbs', chapter: 27 },
    { bookName: 'Proverbs', chapter: 28 },
    { bookName: 'Proverbs', chapter: 29 },
    { bookName: 'Proverbs', chapter: 30 },
    { bookName: 'Proverbs', chapter: 31 },
    // Ecclesiastes 1–12
    { bookName: 'Ecclesiastes', chapter: 1 },
    { bookName: 'Ecclesiastes', chapter: 2 },
    { bookName: 'Ecclesiastes', chapter: 3 },
    { bookName: 'Ecclesiastes', chapter: 4 },
    { bookName: 'Ecclesiastes', chapter: 5 },
    { bookName: 'Ecclesiastes', chapter: 6 },
    { bookName: 'Ecclesiastes', chapter: 7 },
    { bookName: 'Ecclesiastes', chapter: 8 },
    { bookName: 'Ecclesiastes', chapter: 9 },
    { bookName: 'Ecclesiastes', chapter: 10 },
    { bookName: 'Ecclesiastes', chapter: 11 },
    { bookName: 'Ecclesiastes', chapter: 12 },
    // James 1–5
    { bookName: 'James', chapter: 1 },
    { bookName: 'James', chapter: 2 },
    { bookName: 'James', chapter: 3 },
    { bookName: 'James', chapter: 4 },
    { bookName: 'James', chapter: 5 },
    // Job 1–14, 28, 38–42
    { bookName: 'Job', chapter: 1 },
    { bookName: 'Job', chapter: 2 },
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
    { bookName: 'Job', chapter: 28 },
    { bookName: 'Job', chapter: 38 },
    { bookName: 'Job', chapter: 39 },
    { bookName: 'Job', chapter: 40 },
    { bookName: 'Job', chapter: 41 },
    { bookName: 'Job', chapter: 42 },
    // Psalms 1, 19, 37, 49, 73, 90, 119
    { bookName: 'Psalms', chapter: 1 },
    { bookName: 'Psalms', chapter: 19 },
    { bookName: 'Psalms', chapter: 37 },
    { bookName: 'Psalms', chapter: 49 },
    { bookName: 'Psalms', chapter: 73 },
    { bookName: 'Psalms', chapter: 90 },
    { bookName: 'Psalms', chapter: 119 },
  ],
  INTENTIONAL_MOTHERHOOD: [
    // Day 1: Proverbs 31, Psalm 127
    { bookName: 'Proverbs', chapter: 31 },
    { bookName: 'Psalms', chapter: 127 },
    // Day 2: Deuteronomy 6, Psalm 78
    { bookName: 'Deuteronomy', chapter: 6 },
    { bookName: 'Psalms', chapter: 78 },
    // Day 3: 1 Samuel 1, 1 Samuel 2
    { bookName: '1 Samuel', chapter: 1 },
    { bookName: '1 Samuel', chapter: 2 },
    // Day 4: Luke 1, Luke 2
    { bookName: 'Luke', chapter: 1 },
    { bookName: 'Luke', chapter: 2 },
    // Day 5: Titus 2, Proverbs 14
    { bookName: 'Titus', chapter: 2 },
    { bookName: 'Proverbs', chapter: 14 },
    // Day 6: Isaiah 40, Isaiah 49
    { bookName: 'Isaiah', chapter: 40 },
    { bookName: 'Isaiah', chapter: 49 },
    // Day 7: 2 Timothy 1, 2 Timothy 3
    { bookName: '2 Timothy', chapter: 1 },
    { bookName: '2 Timothy', chapter: 3 },
    // Day 8: Psalm 128, Psalm 139
    { bookName: 'Psalms', chapter: 128 },
    { bookName: 'Psalms', chapter: 139 },
    // Day 9: Proverbs 22, Proverbs 23
    { bookName: 'Proverbs', chapter: 22 },
    { bookName: 'Proverbs', chapter: 23 },
    // Day 10: Joshua 24, Psalm 127
    { bookName: 'Joshua', chapter: 24 },
    { bookName: 'Psalms', chapter: 127 },
  ],
  GODLY_MAN: [
    // Day 1: Joshua 1, Psalm 1
    { bookName: 'Joshua', chapter: 1 },
    { bookName: 'Psalms', chapter: 1 },
    // Day 2: Proverbs 4, Proverbs 20
    { bookName: 'Proverbs', chapter: 4 },
    { bookName: 'Proverbs', chapter: 20 },
    // Day 3: Micah 6, Psalm 15
    { bookName: 'Micah', chapter: 6 },
    { bookName: 'Psalms', chapter: 15 },
    // Day 4: 1 Kings 2, Proverbs 16
    { bookName: '1 Kings', chapter: 2 },
    { bookName: 'Proverbs', chapter: 16 },
    // Day 5: Ephesians 5, Ephesians 6
    { bookName: 'Ephesians', chapter: 5 },
    { bookName: 'Ephesians', chapter: 6 },
    // Day 6: 1 Corinthians 9, 1 Corinthians 16
    { bookName: '1 Corinthians', chapter: 9 },
    { bookName: '1 Corinthians', chapter: 16 },
    // Day 7: 1 Timothy 6, Titus 1
    { bookName: '1 Timothy', chapter: 6 },
    { bookName: 'Titus', chapter: 1 },
    // Day 8: James 1, James 2
    { bookName: 'James', chapter: 1 },
    { bookName: 'James', chapter: 2 },
    // Day 9: Psalm 112, Psalm 128
    { bookName: 'Psalms', chapter: 112 },
    { bookName: 'Psalms', chapter: 128 },
    // Day 10: 2 Timothy 2, Psalm 37
    { bookName: '2 Timothy', chapter: 2 },
    { bookName: 'Psalms', chapter: 37 },
  ],
  LIVE_WITH_PURPOSE: [
    // Day 1: Romans 12, Proverbs 16
    { bookName: 'Romans', chapter: 12 },
    { bookName: 'Proverbs', chapter: 16 },
    // Day 2: Psalm 37, Psalm 90
    { bookName: 'Psalms', chapter: 37 },
    { bookName: 'Psalms', chapter: 90 },
    // Day 3: Matthew 6, Matthew 7
    { bookName: 'Matthew', chapter: 6 },
    { bookName: 'Matthew', chapter: 7 },
    // Day 4: Ecclesiastes 3, Ecclesiastes 12
    { bookName: 'Ecclesiastes', chapter: 3 },
    { bookName: 'Ecclesiastes', chapter: 12 },
    // Day 5: Colossians 1, Colossians 3
    { bookName: 'Colossians', chapter: 1 },
    { bookName: 'Colossians', chapter: 3 },
    // Day 6: Ephesians 2, Ephesians 4
    { bookName: 'Ephesians', chapter: 2 },
    { bookName: 'Ephesians', chapter: 4 },
    // Day 7: Philippians 1, Philippians 3
    { bookName: 'Philippians', chapter: 1 },
    { bookName: 'Philippians', chapter: 3 },
    // Day 8: 2 Timothy 2, Proverbs 4
    { bookName: '2 Timothy', chapter: 2 },
    { bookName: 'Proverbs', chapter: 4 },
    // Day 9: Hebrews 12, Hebrews 13
    { bookName: 'Hebrews', chapter: 12 },
    { bookName: 'Hebrews', chapter: 13 },
    // Day 10: Joshua 1, Psalm 1
    { bookName: 'Joshua', chapter: 1 },
    { bookName: 'Psalms', chapter: 1 },
  ],
  KNOW_KING_DAVID: [
    // Day 1: 1 Samuel 16, Psalm 78
    { bookName: '1 Samuel', chapter: 16 },
    { bookName: 'Psalms', chapter: 78 },
    // Day 2: 1 Samuel 17, Psalm 144
    { bookName: '1 Samuel', chapter: 17 },
    { bookName: 'Psalms', chapter: 144 },
    // Day 3: 1 Samuel 18, 1 Samuel 19
    { bookName: '1 Samuel', chapter: 18 },
    { bookName: '1 Samuel', chapter: 19 },
    // Day 4: 1 Samuel 24, 1 Samuel 26
    { bookName: '1 Samuel', chapter: 24 },
    { bookName: '1 Samuel', chapter: 26 },
    // Day 5: Psalm 57, Psalm 59
    { bookName: 'Psalms', chapter: 57 },
    { bookName: 'Psalms', chapter: 59 },
    // Day 6: 2 Samuel 5, Psalm 2
    { bookName: '2 Samuel', chapter: 5 },
    { bookName: 'Psalms', chapter: 2 },
    // Day 7: 2 Samuel 6, Psalm 132
    { bookName: '2 Samuel', chapter: 6 },
    { bookName: 'Psalms', chapter: 132 },
    // Day 8: 2 Samuel 7, Psalm 89
    { bookName: '2 Samuel', chapter: 7 },
    { bookName: 'Psalms', chapter: 89 },
    // Day 9: 2 Samuel 11, Psalm 51
    { bookName: '2 Samuel', chapter: 11 },
    { bookName: 'Psalms', chapter: 51 },
    // Day 10: 2 Samuel 12, Psalm 32
    { bookName: '2 Samuel', chapter: 12 },
    { bookName: 'Psalms', chapter: 32 },
    // Day 11: Psalm 23, Psalm 63
    { bookName: 'Psalms', chapter: 23 },
    { bookName: 'Psalms', chapter: 63 },
    // Day 12: 2 Samuel 15, Psalm 3
    { bookName: '2 Samuel', chapter: 15 },
    { bookName: 'Psalms', chapter: 3 },
    // Day 13: 1 Kings 2, Psalm 72
    { bookName: '1 Kings', chapter: 2 },
    { bookName: 'Psalms', chapter: 72 },
    // Day 14: Acts 13, Psalm 16
    { bookName: 'Acts', chapter: 13 },
    { bookName: 'Psalms', chapter: 16 },
  ],
  HEART_OF_GOD: [
    // Day 1: Exodus 34, Psalm 103
    { bookName: 'Exodus', chapter: 34 },
    { bookName: 'Psalms', chapter: 103 },
    // Day 2: Psalm 145, Psalm 146
    { bookName: 'Psalms', chapter: 145 },
    { bookName: 'Psalms', chapter: 146 },
    // Day 3: Isaiah 6, Isaiah 55
    { bookName: 'Isaiah', chapter: 6 },
    { bookName: 'Isaiah', chapter: 55 },
    // Day 4: Micah 6, Psalm 15
    { bookName: 'Micah', chapter: 6 },
    { bookName: 'Psalms', chapter: 15 },
    // Day 5: Matthew 5, Matthew 6
    { bookName: 'Matthew', chapter: 5 },
    { bookName: 'Matthew', chapter: 6 },
    // Day 6: Matthew 11, Matthew 22
    { bookName: 'Matthew', chapter: 11 },
    { bookName: 'Matthew', chapter: 22 },
    // Day 7: Luke 15, Luke 19
    { bookName: 'Luke', chapter: 15 },
    { bookName: 'Luke', chapter: 19 },
    // Day 8: John 1, John 3
    { bookName: 'John', chapter: 1 },
    { bookName: 'John', chapter: 3 },
    // Day 9: John 13, John 17
    { bookName: 'John', chapter: 13 },
    { bookName: 'John', chapter: 17 },
    // Day 10: Romans 5, Romans 8
    { bookName: 'Romans', chapter: 5 },
    { bookName: 'Romans', chapter: 8 },
    // Day 11: Ephesians 1, Ephesians 2
    { bookName: 'Ephesians', chapter: 1 },
    { bookName: 'Ephesians', chapter: 2 },
    // Day 12: Colossians 1, Colossians 3
    { bookName: 'Colossians', chapter: 1 },
    { bookName: 'Colossians', chapter: 3 },
    // Day 13: Hebrews 4, Hebrews 12
    { bookName: 'Hebrews', chapter: 4 },
    { bookName: 'Hebrews', chapter: 12 },
    // Day 14: 1 John 1, 1 John 4
    { bookName: '1 John', chapter: 1 },
    { bookName: '1 John', chapter: 4 },
    // Day 15: Psalm 51, Psalm 139
    { bookName: 'Psalms', chapter: 51 },
    { bookName: 'Psalms', chapter: 139 },
    // Day 16: Ezekiel 18, Ezekiel 36
    { bookName: 'Ezekiel', chapter: 18 },
    { bookName: 'Ezekiel', chapter: 36 },
    // Day 17: Jeremiah 9, Jeremiah 31
    { bookName: 'Jeremiah', chapter: 9 },
    { bookName: 'Jeremiah', chapter: 31 },
    // Day 18: Revelation 4, Revelation 5
    { bookName: 'Revelation', chapter: 4 },
    { bookName: 'Revelation', chapter: 5 },
    // Day 19: Revelation 19, Revelation 21
    { bookName: 'Revelation', chapter: 19 },
    { bookName: 'Revelation', chapter: 21 },
    // Day 20: Psalm 73, Psalm 84
    { bookName: 'Psalms', chapter: 73 },
    { bookName: 'Psalms', chapter: 84 },
    // Day 21: Psalm 115, Psalm 118
    { bookName: 'Psalms', chapter: 115 },
    { bookName: 'Psalms', chapter: 118 },
  ],
};