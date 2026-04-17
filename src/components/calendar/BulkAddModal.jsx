import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function BulkAddModal({ open, onOpenChange, userId, dateKey }) {
  const queryClient = useQueryClient();
  const [selectedBook, setSelectedBook] = useState('');
  const [startChapter, setStartChapter] = useState('');
  const [endChapter, setEndChapter] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const book = useMemo(() => BIBLE_BOOKS.find(b => b.name === selectedBook), [selectedBook]);
  const maxChapters = book?.chapters || 0;

  const startNum = parseInt(startChapter) || 0;
  const endNum = parseInt(endChapter) || 0;

  const isValid = selectedBook && startNum >= 1 && endNum >= startNum && endNum <= maxChapters;
  const chapterCount = isValid ? endNum - startNum + 1 : 0;

  const formattedDate = dateKey 
    ? new Date(dateKey + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  const handleClose = () => {
    setSelectedBook('');
    setStartChapter('');
    setEndChapter('');
    onOpenChange(false);
  };

  const handleAddChapters = async () => {
    if (!isValid || !userId || !dateKey) return;

    setIsAdding(true);

    try {
      const timestamp = new Date(dateKey + 'T12:00:00').toISOString();

      // Build all chapters to attempt
      const chapters = [];
      for (let ch = startNum; ch <= endNum; ch++) {
        const chapterId = generateChapterId(book.index, ch);
        chapters.push({
          userId,
          timestamp,
          dateKey,
          book: book.name,
          bookIndex: book.index,
          chapter: ch,
          chapterId,
          testament: book.testament,
        });
      }

      // Route through trusted server function — handles dedup server-side
      const res = await base44.functions.invoke('logChapterRead', { chapters });
      const { created = [], skipped = [] } = res.data ?? {};
      const addedCount = Array.isArray(created) ? created.length : 0;

      await queryClient.invalidateQueries();

      if (addedCount > 0) {
        const skippedCount = Array.isArray(skipped) ? skipped.length : 0;
        const msg = skippedCount > 0
          ? `Added ${addedCount} chapter${addedCount !== 1 ? 's' : ''} (${skippedCount} already logged)`
          : `Added ${addedCount} chapter${addedCount !== 1 ? 's' : ''}`;
        toast.success(msg);
      } else {
        toast.info('Nothing to add (already logged)');
      }

      handleClose();
    } catch (error) {
      const message = error?.message || error?.response?.data?.message || 'Failed to add chapters';
      toast.error(message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Bulk Add Chapters</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="book">Book</Label>
            <Select value={selectedBook} onValueChange={(val) => {
              setSelectedBook(val);
              setStartChapter('');
              setEndChapter('');
            }}>
              <SelectTrigger id="book">
                <SelectValue placeholder="Select book" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {BIBLE_BOOKS.map(b => (
                  <SelectItem key={b.index} value={b.name}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startChapter">Start Chapter</Label>
              <Input
                id="startChapter"
                type="number"
                min={1}
                max={maxChapters}
                placeholder="1"
                value={startChapter}
                onChange={(e) => setStartChapter(e.target.value)}
                disabled={!selectedBook}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endChapter">End Chapter</Label>
              <Input
                id="endChapter"
                type="number"
                min={1}
                max={maxChapters}
                placeholder={String(maxChapters)}
                value={endChapter}
                onChange={(e) => setEndChapter(e.target.value)}
                disabled={!selectedBook}
              />
            </div>
          </div>

          {selectedBook && maxChapters > 0 && (
            <p className="text-xs text-muted-foreground">
              {book.name} has {maxChapters} chapter{maxChapters !== 1 ? 's' : ''}
            </p>
          )}

          {isValid && (
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-sm text-foreground">
                Adds chapters {startNum}–{endNum} to <span className="font-medium">{formattedDate}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {chapterCount} chapter{chapterCount !== 1 ? 's' : ''} total
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isAdding}>
            Cancel
          </Button>
          <Button onClick={handleAddChapters} disabled={!isValid || isAdding}>
            {isAdding ? 'Adding...' : 'Add Chapters'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}