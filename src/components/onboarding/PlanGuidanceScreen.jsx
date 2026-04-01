import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight } from 'lucide-react';

export default function PlanGuidanceScreen({ onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col px-6 pt-12 pb-8"
    >
      <div>
        <h1 className="text-3xl font-black mb-4 text-foreground">We've got you covered 📖</h1>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            You'll be able to choose from multiple Bible reading plans once you enter the app.
          </p>

          {/* Visual hint - matches the Explore Reading Plans button from Home */}
          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            disabled
            className="w-full text-left rounded-2xl px-4 py-3.5 flex items-center gap-3.5"
            style={{
              background: 'color-mix(in srgb, rgb(34,197,94) 6%, hsl(var(--card)) 94%)',
              border: '1px solid color-mix(in srgb, rgb(34,197,94) 14%, hsl(var(--border)) 86%)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.07), 0 0 0 0 rgba(34,197,94,0)',
              cursor: 'default'
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'color-mix(in srgb, rgb(34,197,94) 15%, hsl(var(--card)) 85%)',
                boxShadow: '0 0 10px rgba(34,197,94,0.18)'
              }}
            >
              <BookOpen className="w-4 h-4" style={{ color: 'rgb(34,197,94)' }} />
            </div>
            <span className="flex-1 text-[14px] font-semibold text-foreground/90">Explore Reading Plans</span>
            <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgb(34,197,94)', opacity: 0.7 }} />
          </motion.button>

          <p className="text-xs text-muted-foreground italic">
            You'll find this button right on your home screen.
          </p>
        </div>
      </div>

      <motion.div whileTap={{ scale: 0.98 }} className="mt-8">
        <Button
          onClick={onContinue}
          size="lg"
          className="w-full h-12 rounded-full font-bold transition-all"
        >
          Got it
        </Button>
      </motion.div>
    </motion.div>
  );
}