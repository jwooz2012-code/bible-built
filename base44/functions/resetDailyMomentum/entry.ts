import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CURATED_CHAPTERS = [
  { book: 'Psalms', chapter: 23, label: 'Psalm 23', theme: 'The Lord is my shepherd' },
  { book: 'John', chapter: 3, label: 'John 3', theme: 'For God so loved the world' },
  { book: 'Romans', chapter: 8, label: 'Romans 8', theme: 'No condemnation in Christ' },
  { book: 'Matthew', chapter: 5, label: 'Matthew 5', theme: 'The Beatitudes' },
  { book: 'Psalms', chapter: 91, label: 'Psalm 91', theme: 'Dwelling in God\'s shelter' },
  { book: 'Isaiah', chapter: 40, label: 'Isaiah 40', theme: 'Renewed strength' },
  { book: 'Philippians', chapter: 4, label: 'Philippians 4', theme: 'Peace that surpasses understanding' },
  { book: 'Proverbs', chapter: 3, label: 'Proverbs 3', theme: 'Trust in the Lord' },
  { book: 'Hebrews', chapter: 11, label: 'Hebrews 11', theme: 'The hall of faith' },
  { book: '1 Corinthians', chapter: 13, label: '1 Corinthians 13', theme: 'The way of love' },
  { book: 'Romans', chapter: 12, label: 'Romans 12', theme: 'Living sacrifices' },
  { book: 'John', chapter: 1, label: 'John 1', theme: 'In the beginning was the Word' },
  { book: 'Ephesians', chapter: 6, label: 'Ephesians 6', theme: 'The armor of God' },
  { book: 'James', chapter: 1, label: 'James 1', theme: 'Faith and wisdom' },
  { book: 'Psalms', chapter: 119, label: 'Psalm 119', theme: 'Your word is a lamp' },
  { book: 'Matthew', chapter: 6, label: 'Matthew 6', theme: 'The Lord\'s Prayer' },
  { book: 'Isaiah', chapter: 53, label: 'Isaiah 53', theme: 'The suffering servant' },
  { book: 'John', chapter: 15, label: 'John 15', theme: 'Abide in the vine' },
  { book: 'Psalms', chapter: 51, label: 'Psalm 51', theme: 'A prayer of restoration' },
  { book: 'Galatians', chapter: 5, label: 'Galatians 5', theme: 'Fruit of the Spirit' },
];

const CURATED_REVELATIONS = [
  "Scripture is not merely a book to be read — it is a living word meant to be encountered. Each verse you take in today is a seed being planted in the soil of your heart. Return often, and watch what grows.",
  "God's Word has a way of finding you exactly where you are. Whether you come with questions or with confidence, the text meets you with truth that has outlasted every era. You are reading something eternal.",
  "Consistency in Scripture is one of the most powerful spiritual disciplines available to you. It is not the dramatic moments but the faithful daily ones that form a life shaped by the Word.",
  "There is a depth in the Bible that no single reading can exhaust. Every time you return, you bring new experiences, new questions, and new eyes. The text has been waiting for exactly this version of you.",
  "The chapters you read today are forming pathways in your mind and spirit. Over time, these pathways become the instinctive routes your heart takes when life gets hard, uncertain, or joyful.",
  "Scripture was never meant to be rushed. It was meant to be returned to. The readers who are most shaped by the Word are those who come back again and again, finding fresh meaning in familiar passages.",
  "Your reading today is an act of faith. You may not feel it, but something shifts every time you open Scripture with intention. Keep going — transformation is rarely visible in the moment it is happening.",
  "The Bible is a conversation across thousands of years. Every writer was shaped by the stories that came before them, and every reader carries those stories forward. You are part of an unbroken chain of faith.",
  "What you read in Scripture today can become the anchor for your thoughts throughout the day. Carry a single verse or image with you. Let it work on you quietly, the way good things do.",
  "God's Word is a mirror and a map at once. It shows you who you are, and it shows you the way forward. Both are gifts. Both require you to look honestly and trust what you see.",
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Pick today's focus and revelation deterministically by day-of-year so all users get the same
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    const focusIndex = dayOfYear % CURATED_CHAPTERS.length;
    const revelationIndex = dayOfYear % CURATED_REVELATIONS.length;

    const dailyScriptureFocus = CURATED_CHAPTERS[focusIndex];
    const dailyRevelationContent = CURATED_REVELATIONS[revelationIndex];

    // Fetch all users and reset their daily momentum fields
    const users = await base44.asServiceRole.entities.User.list();
    let resetCount = 0;

    for (const u of users) {
      await base44.asServiceRole.entities.User.update(u.id, {
        versesReadToday: 0,
        hasUnlockedDailyRevelation: false,
        dailyScriptureFocus,
        dailyRevelationContent,
      });
      resetCount++;
    }

    return Response.json({
      success: true,
      resetCount,
      todaysFocus: dailyScriptureFocus.label,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});