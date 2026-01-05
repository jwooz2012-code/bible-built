// components/bible/bibleSections.js

import { BIBLE_BOOKS } from "./bibleData";

export const SECTION_ORDER = [
  "Law",
  "History",
  "Poetry/Wisdom",
  "Major Prophets",
  "Minor Prophets",
  "Gospels",
  "Acts",
  "Pauline Epistles",
  "General Epistles",
  "Revelation"
];

export const BOOK_TO_SECTION = {
  "Genesis": "Law",
  "Exodus": "Law",
  "Leviticus": "Law",
  "Numbers": "Law",
  "Deuteronomy": "Law",
  "Joshua": "History",
  "Judges": "History",
  "Ruth": "History",
  "1 Samuel": "History",
  "2 Samuel": "History",
  "1 Kings": "History",
  "2 Kings": "History",
  "1 Chronicles": "History",
  "2 Chronicles": "History",
  "Ezra": "History",
  "Nehemiah": "History",
  "Esther": "History",
  "Job": "Poetry/Wisdom",
  "Psalms": "Poetry/Wisdom",
  "Proverbs": "Poetry/Wisdom",
  "Ecclesiastes": "Poetry/Wisdom",
  "Song of Solomon": "Poetry/Wisdom",
  "Isaiah": "Major Prophets",
  "Jeremiah": "Major Prophets",
  "Lamentations": "Major Prophets",
  "Ezekiel": "Major Prophets",
  "Daniel": "Major Prophets",
  "Hosea": "Minor Prophets",
  "Joel": "Minor Prophets",
  "Amos": "Minor Prophets",
  "Obadiah": "Minor Prophets",
  "Jonah": "Minor Prophets",
  "Micah": "Minor Prophets",
  "Nahum": "Minor Prophets",
  "Habakkuk": "Minor Prophets",
  "Zephaniah": "Minor Prophets",
  "Haggai": "Minor Prophets",
  "Zechariah": "Minor Prophets",
  "Malachi": "Minor Prophets",
  "Matthew": "Gospels",
  "Mark": "Gospels",
  "Luke": "Gospels",
  "John": "Gospels",
  "Acts": "Acts",
  "Romans": "Pauline Epistles",
  "1 Corinthians": "Pauline Epistles",
  "2 Corinthians": "Pauline Epistles",
  "Galatians": "Pauline Epistles",
  "Ephesians": "Pauline Epistles",
  "Philippians": "Pauline Epistles",
  "Colossians": "Pauline Epistles",
  "1 Thessalonians": "Pauline Epistles",
  "2 Thessalonians": "Pauline Epistles",
  "1 Timothy": "Pauline Epistles",
  "2 Timothy": "Pauline Epistles",
  "Titus": "Pauline Epistles",
  "Philemon": "Pauline Epistles",
  "Hebrews": "General Epistles",
  "James": "General Epistles",
  "1 Peter": "General Epistles",
  "2 Peter": "General Epistles",
  "1 John": "General Epistles",
  "2 John": "General Epistles",
  "3 John": "General Epistles",
  "Jude": "General Epistles",
  "Revelation": "Revelation"
};

export function computeSectionTotals(books, bookToSectionMap) {
  const totals = {};
  for (const section of SECTION_ORDER) {
    totals[section] = 0;
  }
  for (const book of books) {
    const section = bookToSectionMap[book.name];
    if (section) {
      totals[section] += book.chapters;
    }
  }
  return totals;
}