import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Users, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { computeBadgeState } from '@/components/badges/badgeEngine';
import { getAchievementIcon, getAchievementColor } from '@/components/badges/badgeIcons';

export default function Accountability() {
  const queryClient = useQueryClient();
  const [adjusting, setAdjusting] = useState(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  const updateCountMutation = useMutation({
    mutationFn: async ({ field, delta }) => {
      const currentValue = user?.[field] || 0;
      const newValue = Math.max(0, currentValue + delta);
      await base44.auth.updateMe({ [field]: newValue });
      return { field, newValue };
    },
    onMutate: ({ field }) => {
      setAdjusting(field);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Updated');
    },
    onError: () => {
      toast.error('Failed to update');
    },
    onSettled: () => {
      setAdjusting(null);
    },
  });

  const statsShared = user?.statsSharedCount || 0;
  const statsReceived = user?.statsReceivedCount || 0;

  // Calculate accountability badges
  const accountabilityBadges = defineBadges({
    totalChaptersRead: 0,
    daysWithReadingDistinct: 0,
    totalBooksCompletedDistinct: 0,
    lifetimeUniqueChapters: 0,
    ntReadThroughCount: 0,
    otOrNtCompletedFlag: false,
    mostCompletedBookCount: 0,
    statsSharedCount: statsShared,
    statsReceivedCount: statsReceived
  }).filter(b => b.isAccountability);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-5 py-8">
        <PageHeader 
          title="Accountability" 
          subtitle="Walk with others in the faith"
        />

        {/* Main Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-4xl font-bold text-center text-foreground mb-2">
              {statsShared}
            </p>
            <p className="text-xs text-center text-muted-foreground font-medium uppercase tracking-wide">
              Stats Shared
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: 0.05 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-4xl font-bold text-center text-foreground mb-2">
              {statsReceived}
            </p>
            <p className="text-xs text-center text-muted-foreground font-medium uppercase tracking-wide">
              Accountability Received
            </p>
          </motion.div>
        </div>

        {/* Log Accountability Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-5 mb-8"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Log Accountability</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <span className="text-sm text-foreground">I shared my stats</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateCountMutation.mutate({ field: 'statsSharedCount', delta: -1 })}
                  disabled={adjusting === 'statsSharedCount' || statsShared === 0}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => updateCountMutation.mutate({ field: 'statsSharedCount', delta: 1 })}
                  disabled={adjusting === 'statsSharedCount'}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <span className="text-sm text-foreground">Someone shared with me</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateCountMutation.mutate({ field: 'statsReceivedCount', delta: -1 })}
                  disabled={adjusting === 'statsReceivedCount' || statsReceived === 0}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => updateCountMutation.mutate({ field: 'statsReceivedCount', delta: 1 })}
                  disabled={adjusting === 'statsReceivedCount'}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            Accountability is about honesty, not performance
          </p>
        </motion.div>

        {/* Accountability Badges */}
        {accountabilityBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Accountability Badges</h2>
            
            <div className="grid grid-cols-1 gap-3">
              {accountabilityBadges.map((badge) => {
                const color = getAchievementColor(badge.title);
                const isBW = color === 'BLACK_WHITE';
                return (
                  <div
                    key={badge.id}
                    className={`rounded-xl p-4 border transition-all ${
                      badge.achieved
                        ? 'bg-card border-border'
                        : 'bg-secondary border-border/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          badge.achieved
                            ? isBW
                              ? 'bg-foreground'
                              : `bg-gradient-to-br ${color}`
                            : 'bg-muted'
                        }`}
                        style={{ 
                          opacity: badge.achieved ? 1 : 0.5,
                          boxShadow: badge.achieved 
                            ? '0 1px 3px rgba(0,0,0,0.1)'
                            : 'none',
                          border: '1.5px solid',
                          borderColor: badge.achieved 
                            ? 'color-mix(in srgb, var(--border) 60%, transparent)'
                            : 'var(--border)'
                        }}
                      >
                        {getAchievementIcon(badge.title, badge.achieved)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-[15px] ${
                          badge.achieved ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {badge.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {badge.subtitle}
                        </p>
                        {!badge.achieved && (
                          <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                            {badge.current} / {badge.target}
                          </p>
                        )}
                      </div>
                      {badge.achieved && (
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0 bg-green-500"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}