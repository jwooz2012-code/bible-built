import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function WelcomeScreen({ onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center pb-20"
    >
      {/* Logo placeholder */}
      <div className="w-16 h-16 mb-12 flex items-center justify-center">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6953bfa67629f34f674461da/6d21a8071_AppIcon.png"
          alt="Bible Built"
          className="w-full h-full rounded-lg"
        />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="max-w-sm"
      >
        <h1 className="text-4xl font-black mb-4 text-foreground">Welcome to Bible Built</h1>
        <p className="text-lg text-foreground/70 mb-3">Track what matters. Grow where it counts.</p>
        <p className="text-sm text-muted-foreground mb-12">Build a life rooted in God's Word.</p>
      </motion.div>

      {/* CTA Button */}
      <Button
        onClick={onContinue}
        size="lg"
        className="w-full max-w-sm h-14 rounded-full text-base font-semibold"
      >
        Start My Journey
      </Button>
    </motion.div>
  );
}