import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Search } from 'lucide-react';
import { BIBLE_BOOKS } from '@/components/bible/bibleData';
import { CHRONOLOGICAL_OT_ORDER } from '@/components/bible/chronologicalOrder';

export default function BooksTab({ selectedBooks, onBooksChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [bookOrder, setBookOrder] = useState('canonical');

  const filteredBooks = useMemo(() => {
    if (!searchQuery) return BIBLE_BOOKS;
    const query = searchQuery.toLowerCase();
    return BIBLE_BOOKS.filter(book => book.name.toLowerCase().includes(query));
  }, [searchQuery]);

  const toggleBook = (bookName) => {
    if (selectedBooks.includes(bookName)) {
      onBooksChange(selectedBooks.filter(b => b !== bookName));
    } else {
      onBooksChange([...selectedBooks, bookName]);
    }
  };

  const handlePreset = (preset) => {
    let books = [];
    switch (preset) {
      case 'ot':
        books = BIBLE_BOOKS.filter(b => b.testament === 'OT').map(b => b.name);
        break;
      case 'nt':
        books = BIBLE_BOOKS.filter(b => b.testament === 'NT').map(b => b.name);
        break;
      case 'gospels':
        books = ['Matthew', 'Mark', 'Luke', 'John'];
        break;
      case 'pauline':
        books = ['Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 
                'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', 
                '1 Timothy', '2 Timothy', 'Titus', 'Philemon'];
        break;
      case 'wisdom':
        books = ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon'];
        break;
      case 'prophets':
        books = ['Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 
                'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 
                'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'];
        break;
      case 'chronological_ot':
        books = CHRONOLOGICAL_OT_ORDER;
        break;
      default:
        books = [];
    }
    onBooksChange(books);
  };

  const handleBookOrderChange = (order) => {
    setBookOrder(order);
    if (order === 'chronological') {
      onBooksChange(CHRONOLOGICAL_OT_ORDER);
    } else if (order === 'canonical') {
      onBooksChange(BIBLE_BOOKS.filter(b => b.testament === 'OT').map(b => b.name));
    }
  };

  const handleSelectAll = () => {
    onBooksChange(BIBLE_BOOKS.map(b => b.name));
  };

  const handleClear = () => {
    onBooksChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Book Order Selector */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Book Order</p>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={bookOrder === 'canonical' ? 'secondary' : 'outline'}
            onClick={() => handleBookOrderChange('canonical')}
          >
            Canonical
          </Button>
          <Button 
            size="sm" 
            variant={bookOrder === 'chronological' ? 'secondary' : 'outline'}
            onClick={() => handleBookOrderChange('chronological')}
          >
            Chronological (OT)
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search books..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => handlePreset('ot')}>OT</Button>
        <Button size="sm" variant="outline" onClick={() => handlePreset('nt')}>NT</Button>
        <Button size="sm" variant="outline" onClick={() => handlePreset('gospels')}>Gospels</Button>
        <Button size="sm" variant="outline" onClick={() => handlePreset('pauline')}>Pauline</Button>
        <Button size="sm" variant="outline" onClick={() => handlePreset('wisdom')}>Wisdom</Button>
        <Button size="sm" variant="outline" onClick={() => handlePreset('prophets')}>Prophets</Button>
        <Button size="sm" variant="outline" onClick={() => handlePreset('chronological_ot')}>Chronological OT</Button>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={handleSelectAll}>Select All</Button>
        <Button size="sm" variant="outline" onClick={handleClear}>Clear</Button>
      </div>

      {/* Book List */}
      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
        {filteredBooks.map((book) => (
          <div
            key={book.name}
            className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-accent cursor-pointer"
            onClick={() => toggleBook(book.name)}
          >
            <Checkbox
              checked={selectedBooks.includes(book.name)}
              onCheckedChange={() => toggleBook(book.name)}
            />
            <span className="text-sm">{book.name}</span>
          </div>
        ))}
      </div>

      {selectedBooks.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {selectedBooks.length} book{selectedBooks.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}