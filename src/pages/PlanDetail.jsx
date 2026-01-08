import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Compass, Crown, Heart, Lamp, Leaf, Hourglass, Scroll } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { base44 } from '@/api/base44Client';
import { PLAN_PRESETS } from '@/components/bible/plans/planPresets';
import { CURATED_PLANS } from '@/components/bible/plans/curatedPlans';
import { BIBLE_BOOKS } from '@/components/bible/bibleData';
import { useUpsertReadingPlan } from '@/components/bible/hooks/useReadingPlan';
import { getDateKey, addDaysKey } from '@/components/bible/utils/dateUtils';
import { toast } from 'sonner';

export default function PlanDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { mutateAsync: upsertPlan, isPending: isSaving } = useUpsertReadingPlan();

  const planId = new URLSearchParams(location.search).get('id');
  const preset = PLAN_PRESETS.find((p) => p.id === planId);

  useEffect(() => {
    let mounted = true;
    base44.auth.me()
      .then((u) => {
        if (mounted) {
          setUser(u);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-20 w-64" />
      </div>
    );
  }

  if (!preset) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Plan not found</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading user...</p>
      </div>
    );
  }

  const isLeadership = preset.id === 'leadership_intensive';
  const isWisdom = preset.id === 'wisdom_plunge';
  const isMotherhood = preset.id === 'intentional_motherhood';
  const isGodlyMan = preset.id === 'godly_man';
  const isPurpose = preset.id === 'live_with_purpose';
  const isDavid = preset.id === 'know_king_david';
  const isHeartOfGod = preset.id === 'heart_of_god';
  const isChronoBible = preset.id === 'chronological_bible';
  const isChronoGospels = preset.id === 'chronological_gospels';
  const isCustomPlan = isLeadership || isWisdom || isMotherhood || isGodlyMan || isPurpose || isDavid || isHeartOfGod || isChronoBible || isChronoGospels;

  const Icon = isLeadership ? Shield : isWisdom ? Lamp : isMotherhood ? Leaf : isGodlyMan ? Shield : isPurpose ? Compass : isDavid ? Crown : isHeartOfGod ? Heart : isChronoBible ? Hourglass : isChronoGospels ? Scroll : null;
  
  const accentColor = isLeadership 
    ? 'rgba(59, 130, 246, 0.1)' 
    : isWisdom 
    ? 'rgba(139, 92, 246, 0.08)' 
    : isMotherhood
    ? 'rgba(236, 72, 153, 0.08)' 
    : isGodlyMan
    ? 'rgba(34, 197, 94, 0.08)' 
    : isPurpose
    ? 'rgba(249, 115, 22, 0.08)' 
    : isDavid
    ? 'rgba(14, 165, 233, 0.08)' 
    : isHeartOfGod
    ? 'rgba(244, 63, 94, 0.08)' 
    : isChronoBible
    ? 'rgba(168, 85, 247, 0.08)' 
    : isChronoGospels
    ? 'rgba(239, 68, 68, 0.08)' 
    : null;

  const iconColor = isLeadership 
    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
    : isWisdom
    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
    : isMotherhood
    ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
    : isGodlyMan
    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
    : isPurpose
    ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
    : isDavid
    ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
    : isHeartOfGod
    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
    : isChronoBible
    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
    : 'bg-red-500/10 text-red-600 dark:text-red-400';

  const badgeColor = isLeadership
    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
    : isWisdom
    ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
    : isMotherhood
    ? 'bg-pink-500/15 text-pink-700 dark:text-pink-300'
    : isGodlyMan
    ? 'bg-green-500/15 text-green-700 dark:text-green-300'
    : isPurpose
    ? 'bg-orange-500/15 text-orange-700 dark:text-orange-300'
    : isDavid
    ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
    : isHeartOfGod
    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
    : isChronoBible
    ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
    : 'bg-red-500/15 text-red-700 dark:text-red-300';

  const startDate = getDateKey();
  const { endDate } = preset.getDates(startDate);
  
  const durationInDays = Math.floor((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

  // Get curated chapters if available
  const curatedChapters = CURATED_PLANS[preset.scope] || [];

  // Preview Day 1, 2, 3
  const dayPreviews = [1, 2, 3].map((dayNum) => {
    const chaptersForDay = [];
    
    if (curatedChapters.length > 0) {
      const startIdx = (dayNum - 1) * preset.chaptersPerDay;
      const endIdx = startIdx + preset.chaptersPerDay;
      for (let i = startIdx; i < endIdx && i < curatedChapters.length; i++) {
        const chap = curatedChapters[i];
        if (chap && chap.bookName && chap.chapter) {
          chaptersForDay.push(`${chap.bookName} ${chap.chapter}`);
        }
      }
    }

    return { day: dayNum, chapters: chaptersForDay };
  });

  // Check if description is long (needs truncation)
  const isDescriptionLong = preset.description && preset.description.length > 180;

  const handleStartPlan = async () => {
    try {
      const planData = {
        userId: user.id,
        scope: preset.scope,
        startDate,
        endDate,
        chaptersPerDay: preset.chaptersPerDay,
      };

      await upsertPlan({ existingPlan: null, planData });
      toast.success('Plan started!');
      navigate('/');
    } catch (error) {
      console.log('Start plan error', error);
      const msg = error?.message || error?.response?.data?.message || error?.data?.message || (typeof error === 'string' ? error : 'Failed to start plan');
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-5 py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm"
          style={{ background: accentColor ? `linear-gradient(135deg, ${accentColor}, transparent)` : undefined }}
        >
          {/* Header Row */}
          <div className="flex items-start gap-4 mb-4">
            {Icon && (
              <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${iconColor}`}>
                <Icon className="w-7 h-7" strokeWidth={2} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground mb-1.5">{preset.name}</h1>
              {preset.shortHook && (
                <p className="text-xs text-muted-foreground truncate mb-1.5">{preset.shortHook}</p>
              )}
              {preset.subtitle && (
                <p className="text-sm text-muted-foreground/90 leading-snug line-clamp-2">{preset.subtitle}</p>
              )}
            </div>
          </div>

          {/* Description */}
          {preset.description && (
            <div className="mb-5">
              <p className={`text-sm text-foreground/80 leading-relaxed ${!showFullDescription && isDescriptionLong ? 'line-clamp-3' : ''}`}>
                {preset.description}
              </p>
              {isDescriptionLong && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-xs text-primary hover:underline mt-1.5"
                >
                  {showFullDescription ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}

          {/* Stat Row */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-muted/40 rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">Duration</p>
              <p className="text-2xl font-bold text-foreground">{durationInDays}</p>
              <p className="text-[10px] text-muted-foreground">days</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">Daily</p>
              <p className="text-2xl font-bold text-foreground">{preset.chaptersPerDay}</p>
              <p className="text-[10px] text-muted-foreground">chapters</p>
            </div>
          </div>

          {/* Reading Preview */}
          {dayPreviews[0].chapters.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Reading Preview</h3>
              {dayPreviews.slice(0, showFullPreview ? 3 : 2).map((preview) => {
                const visibleChapters = preview.chapters.slice(0, 3);
                const remainingCount = preview.chapters.length - visibleChapters.length;
                
                return (
                  <div key={preview.day} className="bg-muted/30 rounded-lg p-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-2">Day {preview.day}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {visibleChapters.map((chap, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-medium text-foreground bg-background/70 px-2 py-1 rounded-md"
                        >
                          {chap}
                        </span>
                      ))}
                      {remainingCount > 0 && (
                        <span className="text-xs font-medium text-muted-foreground bg-background/40 px-2 py-1 rounded-md">
                          +{remainingCount} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {dayPreviews[0].chapters.length > 0 && (
                <button
                  onClick={() => setShowFullPreview(!showFullPreview)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  {showFullPreview ? 'Show less' : 'View full preview'}
                </button>
              )}
            </div>
          )}
        </motion.div>

        <Button
          onClick={handleStartPlan}
          disabled={isSaving}
          className="w-full h-12 text-base font-semibold"
        >
          {isSaving ? 'Starting...' : 'Start This Plan'}
        </Button>
      </div>
    </div>
  );
}