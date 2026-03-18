import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';

const STORAGE_KEY = 'bb_calendar_coachmark_count';
const MAX_SHOWS = 2;

export default function CalendarCoachmark() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleReadingAction = () => {
      const count = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
      if (count >= MAX_SHOWS) return;

      localStorage.setItem(STORAGE_KEY, String(count + 1));
      setVisible(true);

      setTimeout(() => setVisible(false), 2200);
    };

    window.addEventListener('biblebuilt:chapterMarkedRead', handleReadingAction);
    return () => window.removeEventListener('biblebuilt:chapterMarkedRead', handleReadingAction);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed z-50 pointer-events-none"
          style={{
            bottom: 'calc(var(--sab) + 88px)',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg"
              style={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              }}
            >
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground whitespace-nowrap">
                Edit or add readings anytime from Calendar
              </span>
            </div>
            {/* Arrow pointing down toward Calendar tab */}
            <div
              className="w-2 h-2 rotate-45"
              style={{
                backgroundColor: 'hsl(var(--card))',
                borderRight: '1px solid hsl(var(--border))',
                borderBottom: '1px solid hsl(var(--border))',
                marginTop: '-5px',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}