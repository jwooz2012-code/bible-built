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
      {/* Logo with animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-20 h-20 mb-12 flex items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/70 shadow-lg"
      >
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6953bfa67629f34f674461da/6d21a8071_AppIcon.png"
          alt="Bible Built"
          className="w-16 h-16 rounded-2xl"
        />
      </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="max-w-sm"
      >
        <h1 className="text-4xl font-black mb-3 text-foreground">Let's Build Something Strong</h1>
        <p className="text-lg font-semibold text-muted-foreground mb-3">Welcome to Bible Built</p>
        <p className="text-base text-muted-foreground leading-relaxed">
          Track your Bible reading. Build real consistency. See your growth.
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="mt-12 w-full max-w-sm"
      >
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onContinue}
            size="lg"
            className="w-full h-14 rounded-full text-base font-bold transition-all"
          >
            Let's Go 🚀
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}