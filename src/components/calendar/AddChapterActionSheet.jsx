import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen, Layers } from 'lucide-react';

export default function AddChapterActionSheet({ open, onOpenChange, onAddOne, onBulkAdd }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-center">Add Reading</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Button
            variant="outline"
            className="w-full h-14 justify-start gap-3"
            onClick={() => {
              onOpenChange(false);
              onAddOne();
            }}
          >
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            <div className="text-left">
              <p className="font-medium">Add One Chapter</p>
              <p className="text-xs text-muted-foreground">Select a single chapter</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full h-14 justify-start gap-3"
            onClick={() => {
              onOpenChange(false);
              onBulkAdd();
            }}
          >
            <Layers className="w-5 h-5 text-muted-foreground" />
            <div className="text-left">
              <p className="font-medium">Bulk Add Range</p>
              <p className="text-xs text-muted-foreground">Add multiple chapters at once</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}