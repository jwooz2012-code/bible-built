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
        <h1 className="text-3xl font-black mb-2 text-foreground">What should we call you?</h1>
        <p className="text-sm text-muted-foreground mb-8">This helps us personalize your experience.</p>

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
          className="h-12 rounded-xl text-base mb-6"
          autoFocus
        />

        {name && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground italic"
          >
            Let's build something strong, <span className="text-foreground font-semibold">{name}</span>.
          </motion.p>
        )}
      </div>

      <Button
        onClick={handleContinue}
        disabled={!name.trim()}
        size="lg"
        className="w-full h-12 rounded-full font-semibold"
      >
        Continue
      </Button>
    </motion.div>
  );
}