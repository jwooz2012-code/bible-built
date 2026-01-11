import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Sparkles, Cloud, Shirt, Scroll as ScrollIcon, Sword, Music, Flame, Key, Ship } from 'lucide-react';
import { motion } from 'framer-motion';
import { CHARACTER_LIBRARY, flattenCharacterSections } from '@/components/bible/plans/characterLibrary';
import CustomizePlanSheet from './CustomizePlanSheet';

const ICON_MAP = {
  stars: Sparkles,
  storm: Cloud,
  coat: Shirt,
  tablets: ScrollIcon,
  sword: Sword,
  harp: Music,
  fire: Flame,
  lion: Sparkles,
  keys: Key,
  scroll: Ship,
};

const COLOR_MAP = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  red: 'bg-red-500/10 text-red-600 dark:text-red-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
};

export default function CharacterDetailCard({ open, onClose, characterKey, onConfirm, onStartPlan }) {
  const [showCustomize, setShowCustomize] = useState(false);

  if (!characterKey) return null;
  
  const character = CHARACTER_LIBRARY[characterKey];
  if (!character) return null;
  
  const Icon = ICON_MAP[character.iconKey] || Sparkles;
  const colorClass = COLOR_MAP[character.accentColorKey] || COLOR_MAP.blue;
  
  const totalChapters = character.sections.reduce((sum, section) => {
    return sum + section.chapters.length;
  }, 0);
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
              <SheetTitle className="text-2xl">{characterKey}</SheetTitle>
              <SheetDescription className="text-sm italic mt-1">
                {character.hook}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="mt-6 space-y-6 pb-40">
          {/* Description */}
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {character.description}
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium text-muted-foreground">
              {totalChapters} chapters
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium text-muted-foreground">
              Intensive Deep Dive
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-primary/10 text-xs font-semibold text-primary">
              Recommended: ~{recommendedDays} days
            </div>
          </div>
          
          {/* Sections */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Plan Structure</h3>
            <div className="space-y-2">
              {character.sections.map((section, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-semibold text-foreground">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{section.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {section.chapters.length} chapter{section.chapters.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* CTA */}
          <div className="p-4 bg-background border-t border-border rounded-lg">
            <div className="max-w-lg mx-auto space-y-2">
              <Button 
                onClick={() => {
                  onClose();
                  setShowCustomize(true);
                }} 
                className="w-full"
              >
                Start / Customize
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </div>
        </motion.div>
        </SheetContent>
        </Sheet>

        <CustomizePlanSheet
          open={showCustomize}
          onClose={() => setShowCustomize(false)}
          planName={characterKey}
          chapterList={flattenCharacterSections(characterKey)}
          onConfirm={(planData) => {
            setShowCustomize(false);
            if (onStartPlan) {
              onStartPlan(characterKey, planData);
            }
          }}
        />
        </>
        );
        }