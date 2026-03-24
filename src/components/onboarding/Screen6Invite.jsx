import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useOnboarding } from './OnboardingContext';
import { Share2 } from 'lucide-react';

export default function Screen6Invite() {
  const { formData, updateFormData, nextScreen } = useOnboarding();

  const handleShare = async () => {
    updateFormData({ inviteClicked: true });
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bible Built',
          text: 'Join me on Bible Built — track your Scripture reading, build streaks, and grow deeper in God\'s Word.',
          url: window.location.origin,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      const text = `Join me on Bible Built — track your Scripture reading, build streaks, and grow deeper in God's Word. ${window.location.origin}`;
      navigator.clipboard.writeText(text).catch(console.error);
    }

    nextScreen();
  };

  const handleSkip = () => {
    updateFormData({ inviteClicked: false });
    nextScreen();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 pb-20 pt-12"
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-4xl font-bold text-foreground">
            Don't Do This Alone
          </h2>
          <p className="text-lg text-muted-foreground max-w-sm">
            Growth is stronger together. Invite someone to walk with you.
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 opacity-20"
        />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="w-full max-w-sm space-y-3"
      >
        <Button
          onClick={handleShare}
          size="lg"
          className="w-full h-12 text-base font-semibold gap-2"
        >
          <Share2 className="w-5 h-5" />
          Share App
        </Button>
        <Button
          onClick={handleSkip}
          variant="outline"
          size="lg"
          className="w-full h-12 text-base"
        >
          Skip
        </Button>
      </motion.div>
    </motion.div>
  );
}