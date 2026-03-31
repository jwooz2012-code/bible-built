import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { triggerHaptic } from '@/components/utils/haptics';

// Static mock month: March 2026, starts on Sunday
const MOCK_MONTH = 'March 2026';
const DAYS_IN_MONTH = 31;
const FIRST_DOW = 0; // Sunday

// Pre-seed some days with readings
const INITIAL_LOGS = {
  3:  [{ id: 1, label: 'Genesis 1' }, { id: 2, label: 'Genesis 2' }],
  7:  [{ id: 3, label: 'Psalms 23' }],
  10: [{ id: 4, label: 'John 3' }, { id: 5, label: 'Romans 8' }, { id: 6, label: 'Genesis 3' }],
  14: [{ id: 7, label: 'Matthew 5' }],
  18: [{ id: 8, label: 'Proverbs 3' }, { id: 9, label: 'Isaiah 40' }],
  21: [{ id: 10, label: 'Luke 15' }],
  25: [{ id: 11, label: 'Genesis 4' }],
};

const ADD_OPTIONS = [
  'Genesis 5', 'Exodus 1', 'Psalms 1', 'John 1', 'Romans 1',
  'Matthew 1', 'Proverbs 1', 'Isaiah 1', 'Luke 1', 'Acts 1',
];

let nextId = 100;

export default function DailyCommitmentScreen({ onContinue }) {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isActivating, setIsActivating] = useState(false);
  const [hasTappedCalendar, setHasTappedCalendar] = useState(false);

  const handleDayTap = (day) => {
    triggerHaptic();
    setSelectedDay(day);
    setHasTappedCalendar(true);
  };

  const handleDelete = (day, id) => {
    triggerHaptic();
    setLogs(prev => ({
      ...prev,
      [day]: (prev[day] || []).filter(l => l.id !== id),
    }));
  };

  const handleAdd = (day) => {
    triggerHaptic();
    const option = ADD_OPTIONS[nextId % ADD_OPTIONS.length];
    nextId++;
    setLogs(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), { id: nextId, label: option }],
    }));
  };

  const handleContinue = () => {
    if (!hasTappedCalendar || isActivating) return;
    setIsActivating(true);
    triggerHaptic();
    setTimeout(() => onContinue(), 300);
  };

  // Build calendar grid
  const blanks = Array(FIRST_DOW).fill(null);
  const days = Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1);
  const grid = [...blanks, ...days];
  const todayNum = 25; // mock "today"

  const selectedLogs = selectedDay ? (logs[selectedDay] || []) : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 pb-24"
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="w-full max-w-sm flex flex-col items-center space-y-6"
      >
        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-foreground">Oops, made a mistake?</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No stress — tap any day on the Calendar to add or remove readings.
          </p>
        </div>

        {/* Mini Calendar */}
        <motion.div
          initial={{ scale: 0.93, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="w-full bg-card border border-border rounded-2xl p-4 shadow-md"
        >
          {/* Month header */}
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" className="opacity-30 cursor-default" tabIndex={-1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold text-foreground">{MOCK_MONTH}</span>
            <Button variant="ghost" size="icon" className="opacity-30 cursor-default" tabIndex={-1}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Day tiles */}
          <div className="grid grid-cols-7 gap-1">
            {grid.map((day, i) => {
              if (!day) return <div key={i} />;
              const count = (logs[day] || []).length;
              const isToday = day === todayNum;
              const isSelected = day === selectedDay;

              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.88 }}
                  transition={{ duration: 0.12 }}
                  onClick={() => handleDayTap(day)}
                  className="aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all"
                  style={
                    isSelected
                      ? { background: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary))' }
                      : isToday
                        ? { background: 'hsl(var(--accent))', borderColor: 'hsl(var(--primary))', borderWidth: '2px' }
                        : count > 0
                          ? { background: 'hsl(var(--accent))', borderColor: 'hsl(var(--accent))' }
                          : { background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }
                  }
                >
                  <span
                    className="text-[12px] font-semibold leading-none"
                    style={{ color: isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))' }}
                  >
                    {day}
                  </span>
                  <span
                    className="text-[10px] font-bold leading-none"
                    style={{ color: count > 0 ? (isSelected ? 'hsl(var(--primary-foreground))' : '#10B981') : 'transparent' }}
                  >
                    {count > 0 ? count : '·'}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Day detail panel */}
        <AnimatePresence mode="wait">
          {selectedDay && (
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25 }}
              className="w-full bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">March {selectedDay}, 2026</span>
                <button onClick={() => setSelectedDay(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Add button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleAdd(selectedDay)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Reading
              </Button>

              {/* Log list */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedLogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">No chapters logged — tap Add Reading!</p>
                ) : (
                  selectedLogs.map(log => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      className="flex items-center justify-between px-3 py-2 bg-secondary rounded-xl"
                    >
                      <span className="text-sm font-medium text-foreground">{log.label}</span>
                      <button
                        onClick={() => handleDelete(selectedDay, log.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedDay && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xs text-center text-muted-foreground/60"
          >
            👆 Try tapping a day above
          </motion.p>
        )}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="mt-8 w-full max-w-sm"
      >
        <motion.div whileTap={{ scale: 0.96 }}>
          <Button
            onClick={handleContinue}
            disabled={!hasTappedCalendar || isActivating}
            size="lg"
            className="w-full h-14 rounded-full text-base font-bold"
          >
            {hasTappedCalendar ? 'Got it! 👍' : 'Tap a day to continue'}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}