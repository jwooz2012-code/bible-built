import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Shield, Lamp, Leaf, Compass, Crown, Heart, Cross } from 'lucide-react';
import { motion } from 'framer-motion';
import { CURATED_PLANS } from '@/components/bible/plans/curatedPlans';

const ICON_MAP = {
  cross: Cross,
  shield: Shield,
  lamp: Lamp,
  leaf: Leaf,
  compass: Compass,
  crown: Crown,
  heart: Heart,
};

const COLOR_MAP = {
  gold: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  green: 'bg-green-500/10 text-green-600 dark:text-green-400',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

const THEME_INFO = {
  WHO_IS_JESUS: {
    name: 'Who Is Jesus?',
    hook: 'From prophecy to person, from cross to crown.',
    description: 'This intensive study traces the identity of Jesus Christ from Old Testament prophecy through His earthly ministry, sacrificial death, resurrection, exaltation, and eternal reign. Scripture defines who Jesus is—not opinion, tradition, or culture.',
    iconKey: 'cross',
    colorKey: 'gold',
    sections: [
      { title: 'Promised Messiah (Prophecy)', count: 13 },
      { title: 'Incarnation & Identity', count: 7 },
      { title: 'Ministry & Message', count: 15 },
      { title: 'Rejection, Cross & Atonement', count: 8 },
      { title: 'Resurrection, Exaltation & Eternal Reign', count: 13 },
    ]
  },
  LEADERSHIP_INTENSIVE: {
    name: 'Leadership Intensive',
    hook: 'Lead with wisdom and strength.',
    description: 'A comprehensive study of biblical leadership principles drawn from the lives of Moses, Joshua, David, and other key leaders. Learn what it means to lead God\'s way through both triumph and trial.',
    iconKey: 'shield',
    colorKey: 'blue',
  },
  WISDOM_PLUNGE: {
    name: 'Wisdom Plunge',
    hook: 'Seek wisdom above all else.',
    description: 'Immerse yourself in the wisdom literature of Scripture: Proverbs, Ecclesiastes, Job, and selected Psalms. Gain practical insights for daily living and deep understanding of God\'s ways.',
    iconKey: 'lamp',
    colorKey: 'purple',
  },
  INTENTIONAL_MOTHERHOOD: {
    name: 'The Intentional Mom',
    hook: 'Motherhood shaped by Scripture.',
    description: 'A curated journey through passages that speak to motherhood, family, nurture, and godly character. Build your home on biblical foundations with wisdom from Proverbs, Ruth, and the New Testament.',
    iconKey: 'leaf',
    colorKey: 'pink',
  },
  GODLY_MAN: {
    name: 'The Godly Man',
    hook: 'Strength rooted in character.',
    description: 'Explore what it means to be a man of God through the lives of biblical heroes, the teachings of Christ, and the exhortations of the apostles. Develop integrity, courage, and faithfulness.',
    iconKey: 'shield',
    colorKey: 'green',
  },
  LIVE_WITH_PURPOSE: {
    name: 'Live With Purpose',
    hook: 'Your life has meaning.',
    description: 'Discover God\'s purpose for your life through key passages that reveal His calling, mission, and plan. This reading plan will help you align your days with eternal significance.',
    iconKey: 'compass',
    colorKey: 'orange',
  },
  KNOW_KING_DAVID: {
    name: 'Know King David',
    hook: 'A man after God\'s own heart.',
    description: 'Walk through the life of King David from shepherd boy to anointed king. Experience his victories, failures, worship, and repentance as you learn what it means to pursue God wholeheartedly.',
    iconKey: 'crown',
    colorKey: 'cyan',
  },
  HEART_OF_GOD: {
    name: 'Heart of God',
    hook: 'Know His love. Trust His heart.',
    description: 'Journey through Scripture to understand the character, love, and faithfulness of God. See His heart revealed through His words, His works, and His Son.',
    iconKey: 'heart',
    colorKey: 'rose',
  },
};

export default function ThemeDetailCard({ open, onClose, themeKey, onConfirm, onStartPlan }) {
  if (!themeKey) return null;
  
  const theme = THEME_INFO[themeKey];
  if (!theme) return null;
  
  const Icon = ICON_MAP[theme.iconKey] || Shield;
  const colorClass = COLOR_MAP[theme.colorKey] || COLOR_MAP.blue;
  
  const chapters = CURATED_PLANS[themeKey] || [];
  const totalChapters = chapters.length;
  const recommendedDays = Math.ceil(totalChapters / 2);
  
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto p-0">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="h-full flex flex-col overflow-y-auto"
        >
          <SheetHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
              <Icon className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <SheetTitle className="text-2xl">{theme.name}</SheetTitle>
              <SheetDescription className="text-sm italic mt-1">
                {theme.hook}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="mt-6 space-y-6 pb-40">
          {/* Description */}
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {theme.description}
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium text-muted-foreground">
              {totalChapters} chapters
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium text-muted-foreground">
              Thematic Study
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-primary/10 text-xs font-semibold text-primary">
              Recommended: ~{recommendedDays} days
            </div>
          </div>
          
          {/* Plan Structure (if sections provided) */}
          {theme.sections && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Plan Structure</h3>
              <div className="space-y-2">
                {theme.sections.map((section, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                    <span className="text-xs font-medium text-foreground">{section.title}</span>
                    <span className="text-xs text-muted-foreground">{section.count} chapters</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Preview of books included */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Books Included</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(chapters.map(ch => ch.bookName))).map((bookName, idx) => (
                <div key={idx} className="px-2.5 py-1 rounded-md bg-muted/30 text-xs font-medium text-foreground">
                  {bookName}
                </div>
              ))}
            </div>
          </div>
          
          {/* CTA */}
          <div className="p-4 bg-background border-t border-border rounded-lg">
            <div className="max-w-lg mx-auto space-y-2">
              <Button 
                onClick={() => {
                  if (onStartPlan) {
                    onStartPlan(themeKey);
                  }
                  onClose();
                }} 
                className="w-full"
              >
                Start This Plan
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (onConfirm) {
                      onConfirm(themeKey);
                    }
                    onClose();
                  }} 
                  className="flex-1"
                >
                  Customize
                </Button>
              </div>
            </div>
          </div>
        </div>
        </motion.div>
        </SheetContent>
        </Sheet>
        );
        }