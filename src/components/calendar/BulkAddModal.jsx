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
import { motion } from 'framer-motion';
import { Layers, BookOpen, ArrowRight, CalendarDays } from 'lucide-react';

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
    ? new Date(dateKey + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
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
      <DialogContent className="max-w-sm p-0 overflow-hidden gap-0">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent px-6 pt-6 pb-4">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 flex items-center justify-center">
              <Layers className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <DialogTitle className="text-center text-base">Bulk Add Chapters</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Log a range of chapters at once</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Book selector */}
          <div className="space-y-1.5">
            <Label htmlFor="book" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Book</Label>
            <Select value={selectedBook} onValueChange={(val) => {
              setSelectedBook(val);
              setStartChapter('');
              setEndChapter('');
            }}>
              <SelectTrigger id="book" className="h-11">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Select book" />
                </div>
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

          {/* Chapter range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startChapter" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">From</Label>
              <Input
                id="startChapter"
                type="number"
                min={1}
                max={maxChapters}
                placeholder="1"
                value={startChapter}
                onChange={(e) => setStartChapter(e.target.value)}
                disabled={!selectedBook}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endChapter" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">To</Label>
              <Input
                id="endChapter"
                type="number"
                min={1}
                max={maxChapters}
                placeholder={String(maxChapters)}
                value={endChapter}
                onChange={(e) => setEndChapter(e.target.value)}
                disabled={!selectedBook}
                className="h-11"
              />
            </div>
          </div>

          {selectedBook && maxChapters > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              {book.name} has {maxChapters} chapter{maxChapters !== 1 ? 's' : ''}
            </p>
          )}

          {/* Preview card */}
          {isValid && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-primary/20 bg-primary/5 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-base font-bold text-primary">{chapterCount}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {book.name} {startNum}{endNum !== startNum ? `–${endNum}` : ''}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <CalendarDays className="w-3 h-3" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className="px-6 pb-5 gap-2 sm:gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isAdding} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleAddChapters} disabled={!isValid || isAdding} className="flex-1">
            {isAdding ? (
              'Adding...'
            ) : (
              <span className="flex items-center gap-1.5">
                Add {chapterCount > 0 ? chapterCount : ''} Chapter{chapterCount !== 1 ? 's' : ''}
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}