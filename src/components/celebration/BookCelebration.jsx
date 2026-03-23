import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export default function BookCelebration({ bookName, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-end justify-center p-6 pb-28"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onDismiss}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <motion.div
        className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-background" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1">
              Book Completed
            </p>
            <h3 className="text-lg font-bold text-foreground leading-tight mb-1 truncate">
              {bookName}
            </h3>
            <p className="text-sm text-muted-foreground">
              Another book completed. Keep building.
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 h-10 text-sm font-medium rounded-xl"
            onClick={onDismiss}
          >
            Continue
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}