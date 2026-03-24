import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Share2, Users, CalendarDays, CalendarRange } from 'lucide-react';

export default function ShareAndGrowScreen({ onContinue }) {
  const sections = [
    {
      title: 'Accountability',
      icon: Share2,
      description: 'Share your weekly, monthly, and yearly progress',
      example: 'Transparency builds consistency'
    },
    {
      title: 'Community',
      icon: Users,
      description: 'Invite friends to grow together',
      example: 'Stay accountable with others'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col justify-between px-6 pt-12 pb-20"
    >
      <div>
        <h1 className="text-3xl font-black mb-2 text-foreground">Track it. Share it. Build together.</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Your profile has two sections to deepen your journey:
        </p>

        {/* Feature Cards */}
        <div className="space-y-4 mb-12">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-4 p-4 rounded-2xl bg-card border border-border/60 hover:bg-accent/20 transition-colors"
              >
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-secondary">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[15px] font-semibold text-foreground mb-1">{section.title}</h3>
                  <p className="text-[13px] text-muted-foreground mb-2">{section.description}</p>
                  <p className="text-[11px] text-muted-foreground/60 italic">{section.example}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Helper Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-muted-foreground/60 text-center"
        >
          Find both sections in your Profile page.
        </motion.p>
      </div>

      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          onClick={onContinue}
          size="lg"
          className="w-full h-12 rounded-full font-bold transition-all"
        >
          Continue
        </Button>
      </motion.div>
    </motion.div>
  );
}