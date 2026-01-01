import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2, BookCheck } from 'lucide-react';
import { BIBLE_BOOKS } from './bibleData';
import { Checkbox } from "@/components/ui/checkbox";
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
  onAddMultipleChapters,
  onMarkBookComplete,
  onRemoveLog, 
  onBulkRemoveLogs,
  isAdding,
  isRemoving 
}) {
  const [isAddMode, setIsAddMode] = useState(false);
  const [selectedBookIndex, setSelectedBookIndex] = useState(null);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  const handleAdd = async () => {
    if (selectedBookIndex !== null && selectedChapters.length > 0) {
      await onAddMultipleChapters(selectedDay.localDate, parseInt(selectedBookIndex), selectedChapters);
      setIsAddMode(false);
      setSelectedBookIndex(null);
      setSelectedChapters([]);
    }
  };

  const handleMarkComplete = async () => {
    if (selectedBookIndex !== null) {
      await onMarkBookComplete(selectedDay.localDate, parseInt(selectedBookIndex));
      setIsAddMode(false);
      setSelectedBookIndex(null);
      setSelectedChapters([]);
    }
  };

  const toggleChapter = (chapter) => {
    setSelectedChapters(prev => 
      prev.includes(chapter) 
        ? prev.filter(c => c !== chapter)
        : [...prev, chapter]
    );
  };

  const selectedBook = selectedBookIndex !== null ? BIBLE_BOOKS[selectedBookIndex] : null;

  const toggleLogSelection = (logId) => {
    setSelectedLogs(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedLogs.length > 0) {
      await onBulkRemoveLogs(selectedLogs);
      setSelectedLogs([]);
      setIsBulkMode(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Existing logs */}
      {logs.length > 0 && (
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {logs.length} chapter{logs.length !== 1 ? 's' : ''} read
          </p>
          {logs.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsBulkMode(!isBulkMode);
                setSelectedLogs([]);
              }}
              className="text-xs"
            >
              {isBulkMode ? 'Cancel' : 'Select Multiple'}
            </Button>
          )}
        </div>
      )}
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {logs.map((log, index) => {
          const book = BIBLE_BOOKS[log.book_index];
          const isSelected = selectedLogs.includes(log.id);
          
          return (
            <div
              key={`${log.event_id}-${index}`}
              className={`
                flex items-center justify-between p-3 rounded-xl transition-all
                ${isSelected ? 'bg-red-50 dark:bg-red-950/20 ring-2 ring-red-500 dark:ring-red-400' : 'bg-gray-50 dark:bg-slate-800'}
              `}
            >
              <div className="flex items-center gap-3 flex-1">
                {isBulkMode && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleLogSelection(log.id)}
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">{book?.name}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Chapter {log.chapter}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 dark:text-slate-500">
                  {new Date(log.occurred_at).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </p>
                {!isBulkMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveLog(log.id)}
                    disabled={isRemoving}
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {isBulkMode && selectedLogs.length > 0 && (
        <Button
          onClick={handleBulkDelete}
          disabled={isRemoving}
          variant="destructive"
          className="w-full"
        >
          {isRemoving ? 'Deleting...' : `Delete ${selectedLogs.length} Selected`}
        </Button>
      )}

      {/* Add chapter section */}
      {isAddMode ? (
        <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/50">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-gray-900 dark:text-slate-100">Add Reading</p>
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
            setSelectedChapters([]);
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
            <>
              <div className="bg-white dark:bg-slate-900 rounded-lg p-3 max-h-48 overflow-y-auto border border-gray-200 dark:border-slate-700">
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
                    <div key={ch} className="flex items-center space-x-2">
                      <Checkbox
                        id={`chapter-${ch}`}
                        checked={selectedChapters.includes(ch)}
                        onCheckedChange={() => toggleChapter(ch)}
                      />
                      <label
                        htmlFor={`chapter-${ch}`}
                        className="text-sm cursor-pointer"
                      >
                        {ch}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAdd}
                  disabled={selectedBookIndex === null || selectedChapters.length === 0 || isAdding}
                  className="flex-1"
                >
                  {isAdding ? 'Adding...' : `Add ${selectedChapters.length} Chapter${selectedChapters.length !== 1 ? 's' : ''}`}
                </Button>
                <Button
                  onClick={handleMarkComplete}
                  disabled={selectedBookIndex === null || isAdding}
                  variant="secondary"
                  className="flex-1"
                >
                  <BookCheck className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              </div>
            </>
          )}
        </div>
      ) : (
        <Button
          onClick={() => setIsAddMode(true)}
          variant="outline"
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Reading
        </Button>
      )}
    </div>
  );
}