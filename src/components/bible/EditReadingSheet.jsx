import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2 } from 'lucide-react';
import { BIBLE_BOOKS } from './bibleData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditReadingSheet({ 
  selectedDay, 
  logs, 
  onAddChapter, 
  onRemoveLog, 
  isAdding,
  isRemoving 
}) {
  const [isAddMode, setIsAddMode] = useState(false);
  const [selectedBookIndex, setSelectedBookIndex] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const handleAdd = async () => {
    if (selectedBookIndex !== null && selectedChapter !== null) {
      await onAddChapter(selectedDay.localDate, parseInt(selectedBookIndex), parseInt(selectedChapter));
      setIsAddMode(false);
      setSelectedBookIndex(null);
      setSelectedChapter(null);
    }
  };

  const selectedBook = selectedBookIndex !== null ? BIBLE_BOOKS[selectedBookIndex] : null;

  return (
    <div className="mt-6 space-y-4">
      {/* Existing logs */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {logs.map((log, index) => {
          const book = BIBLE_BOOKS[log.book_index];
          return (
            <div
              key={`${log.event_id}-${index}`}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-slate-100">{book?.name}</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">Chapter {log.chapter}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 dark:text-slate-500">
                  {new Date(log.occurred_at).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveLog(log.id)}
                  disabled={isRemoving}
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add chapter section */}
      {isAddMode ? (
        <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/50">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-gray-900 dark:text-slate-100">Add Chapter</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsAddMode(false);
                setSelectedBookIndex(null);
                setSelectedChapter(null);
              }}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Select value={selectedBookIndex?.toString()} onValueChange={(val) => {
            setSelectedBookIndex(parseInt(val));
            setSelectedChapter(null);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select book" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {BIBLE_BOOKS.map((book, idx) => (
                <SelectItem key={idx} value={idx.toString()}>
                  {book.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedBook && (
            <Select value={selectedChapter?.toString()} onValueChange={(val) => setSelectedChapter(parseInt(val))}>
              <SelectTrigger>
                <SelectValue placeholder="Select chapter" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
                  <SelectItem key={ch} value={ch.toString()}>
                    Chapter {ch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            onClick={handleAdd}
            disabled={selectedBookIndex === null || selectedChapter === null || isAdding}
            className="w-full"
          >
            {isAdding ? 'Adding...' : 'Add Chapter'}
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setIsAddMode(true)}
          variant="outline"
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Chapter
        </Button>
      )}
    </div>
  );
}