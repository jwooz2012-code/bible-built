import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Edit2, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

import ThemeToggle from '@/components/ThemeToggle';
import AchievementCard from '@/components/bible/AchievementCard';
import { useBookProgress } from '@/components/bible/useBookProgress';
import { ACHIEVEMENTS } from '@/components/bible/bibleData';

export default function Achievements() {
  const { achievements, isLoading } = useBookProgress();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editValue, setEditValue] = useState('');
  const queryClient = useQueryClient();

  const { data: bibleProgress = [] } = useQuery({
    queryKey: ['bibleProgress'],
    queryFn: () => base44.entities.BibleProgress.list(),
  });

  const updateBibleProgressMutation = useMutation({
    mutationFn: async ({ id, count }) => {
      if (id) {
        return await base44.entities.BibleProgress.update(id, {
          bible_completion_count: count,
        });
      } else {
        const user = await base44.auth.me();
        return await base44.entities.BibleProgress.create({
          user_id: user.id,
          bible_completion_count: count,
          chapters_completed_in_current_bible_run: {},
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bibleProgress'] });
      toast.success('Bible completion count updated');
      setIsEditDialogOpen(false);
    },
  });

  const currentBibleProgress = bibleProgress[0];
  const bibleCompletionCount = currentBibleProgress?.bible_completion_count || 0;

  const handleOpenEdit = () => {
    setEditValue(bibleCompletionCount.toString());
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    const count = parseInt(editValue) || 0;
    if (count < 0) {
      toast.error('Count cannot be negative');
      return;
    }
    updateBibleProgressMutation.mutate({
      id: currentBibleProgress?.id,
      count,
    });
  };
  
  const unlockedIds = achievements.map(a => a.achievement_id);
  const unlockedCount = unlockedIds.length;
  const totalCount = ACHIEVEMENTS.length;
  const percentUnlocked = Math.round((unlockedCount / totalCount) * 100);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-lg mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-24 w-full rounded-3xl" />
          <div className="grid grid-cols-2 gap-3">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Sort achievements: unlocked first, then by original order
  const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
    const aUnlocked = unlockedIds.includes(a.id);
    const bUnlocked = unlockedIds.includes(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <ThemeToggle />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Achievements</h1>
            <p className="text-sm text-gray-600 dark:text-slate-400">Your reading milestones</p>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-slate-700/50 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-yellow-100 dark:bg-yellow-500/20 rounded-2xl">
              <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-slate-400">Achievements Unlocked</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {unlockedCount} / {totalCount}
              </p>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
                <motion.div
                  className="h-full bg-yellow-500 dark:bg-yellow-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentUnlocked}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bible Completion Count */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-slate-700/50 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-amber-100 dark:bg-amber-500/20 rounded-2xl">
                <BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400">Bible Completions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {bibleCompletionCount}x
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenEdit}
              className="rounded-full"
            >
              <Edit2 className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-2 gap-3">
          {sortedAchievements.map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              unlocked={unlockedIds.includes(achievement.id)}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bible Completions</DialogTitle>
            <DialogDescription>
              Enter the number of times you've read through the entire Bible
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              min="0"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="0"
              className="text-lg"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateBibleProgressMutation.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}