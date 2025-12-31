// Local Storage Database for Bible Reading App
const DB_KEYS = {
  BOOK_PROGRESS: 'bibleApp_bookProgress',
  ACHIEVEMENTS: 'bibleApp_achievements',
  BIBLE_PROGRESS: 'bibleApp_bibleProgress',
  READING_LOGS: 'bibleApp_readingLogs',
  LIFETIME_READING: 'bibleApp_lifetimeReading',
};

// Helper to generate unique IDs
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Generic CRUD operations
const getAll = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const getById = (key, id) => {
  const items = getAll(key);
  return items.find(item => item.id === id);
};

const create = (key, data) => {
  const items = getAll(key);
  const newItem = { ...data, id: data.id || generateId(), created_date: new Date().toISOString(), updated_date: new Date().toISOString() };
  items.push(newItem);
  localStorage.setItem(key, JSON.stringify(items));
  return newItem;
};

const update = (key, id, data) => {
  const items = getAll(key);
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...data, updated_date: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(items));
    return items[index];
  }
  return null;
};

const deleteItem = (key, id) => {
  const items = getAll(key);
  const filtered = items.filter(item => item.id !== id);
  localStorage.setItem(key, JSON.stringify(filtered));
  return true;
};

const filter = (key, filterFn) => {
  const items = getAll(key);
  return items.filter(filterFn);
};

// Entity-specific APIs
export const localDB = {
  BookProgress: {
    list: () => getAll(DB_KEYS.BOOK_PROGRESS),
    create: (data) => create(DB_KEYS.BOOK_PROGRESS, data),
    update: (id, data) => update(DB_KEYS.BOOK_PROGRESS, id, data),
    delete: (id) => deleteItem(DB_KEYS.BOOK_PROGRESS, id),
    filter: (filterObj) => filter(DB_KEYS.BOOK_PROGRESS, (item) => {
      return Object.keys(filterObj).every(key => item[key] === filterObj[key]);
    }),
  },
  
  Achievement: {
    list: () => getAll(DB_KEYS.ACHIEVEMENTS),
    create: (data) => create(DB_KEYS.ACHIEVEMENTS, data),
  },
  
  BibleProgress: {
    list: () => {
      const items = getAll(DB_KEYS.BIBLE_PROGRESS);
      return items;
    },
    create: (data) => create(DB_KEYS.BIBLE_PROGRESS, data),
    update: (id, data) => update(DB_KEYS.BIBLE_PROGRESS, id, data),
  },
  
  ReadingLog: {
    list: () => getAll(DB_KEYS.READING_LOGS),
    create: (data) => create(DB_KEYS.READING_LOGS, data),
    delete: (id) => deleteItem(DB_KEYS.READING_LOGS, id),
  },
  
  LifetimeReading: {
    list: () => {
      const items = getAll(DB_KEYS.LIFETIME_READING);
      return items;
    },
    create: (data) => create(DB_KEYS.LIFETIME_READING, data),
    update: (id, data) => update(DB_KEYS.LIFETIME_READING, id, data),
  },
};