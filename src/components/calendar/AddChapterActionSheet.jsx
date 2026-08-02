import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { BookOpen, Layers, Sparkles } from 'lucide-react';

export default function AddChapterActionSheet({ open, onOpenChange, onAddOne, onBulkAdd }) {
  const options = [
    {
      key: 'one',
      icon: BookOpen,
      title: 'Add One Chapter',
      subtitle: 'Pick a single book and chapter',
      gradient: 'from-emerald-500/15 to-teal-500/10',
      iconBg: 'bg-emerald-500/15 text-emerald-500',
      onClick: onAddOne,
    },
    {
      key: 'bulk',
      icon: Layers,
      title: 'Bulk Add Range',
      subtitle: 'Add multiple chapters at once',
      gradient: 'from-amber-500/15 to-orange-500/10',
      iconBg: 'bg-amber-500/15 text-amber-500',
      onClick: onBulkAdd,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs p-0 overflow-hidden gap-0">
        {/* Decorative header */}
        <div className="relative bg-gradient-to-br from-primary/8 via-primary/4 to-transparent px-6 pt-6 pb-4">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-center text-base">Add Reading</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Choose how you'd like to log</p>
            </div>
          </div>
        </div>

        <div className="px-4 pb-5 pt-1 space-y-2.5">
          {options.map((opt, i) => (
            <motion.button
              key={opt.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.06, duration: 0.3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                onOpenChange(false);
                opt.onClick();
              }}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-gradient-to-br ${opt.gradient} hover:border-primary/30 transition-colors text-left`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${opt.iconBg}`}>
                <opt.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{opt.title}</p>
                <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}