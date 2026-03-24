import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

export default function InviteScreen({ onContinue }) {
  const handleInvite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bible Built',
          text: 'Join me on Bible Built and build your reading habit together.',
          url: window.location.origin
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
    onContinue();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col justify-between px-6 pt-12 pb-20"
    >
      <div className="text-center">
        <h1 className="text-3xl font-black mb-2 text-foreground">Don't build alone</h1>
        <p className="text-sm text-muted-foreground mb-8">Invite someone to grow with you.</p>

        <div className="bg-card rounded-2xl p-8 border border-border">
          <p className="text-sm text-foreground/70">Growing together makes the journey more meaningful. Share your commitment with a friend or family member.</p>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleInvite}
          size="lg"
          className="w-full h-12 rounded-full font-semibold"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Invite Friends
        </Button>
        <Button
          onClick={onContinue}
          variant="outline"
          size="lg"
          className="w-full h-12 rounded-full font-semibold"
        >
          Skip for now
        </Button>
      </div>
    </motion.div>
  );
}