import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DisplayNameScreen({ onContinue, initialValue = '' }) {
  const [name, setName] = useState(initialValue);

  const handleContinue = () => {
    if (name.trim()) {
      onContinue(name.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col justify-between px-6 pt-12 pb-20"
    >
      <div>
        <h1 className="text-3xl font-black mb-2 text-foreground">First—what should we call you?</h1>
        <p className="text-sm text-muted-foreground mb-8">Let's personalize this.</p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) {
                handleContinue();
              }
            }}
            className="h-12 rounded-xl text-base mb-6 font-semibold"
            autoFocus
            maxLength={50}
          />
        </motion.div>

        {name && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-muted-foreground italic"
          >
            Alright <span className="text-foreground font-bold">{name}</span>… let's get to work. 💪
          </motion.p>
        )}
      </div>

      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleContinue}
          disabled={!name.trim()}
          size="lg"
          className="w-full h-12 rounded-full font-bold transition-all"
        >
          Continue
        </Button>
      </motion.div>
    </motion.div>
  );
}