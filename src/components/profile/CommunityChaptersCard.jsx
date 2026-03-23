import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CommunityChaptersCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['communityStats'],
    queryFn: async () => {
      const res = await base44.functions.invoke('communityStats', {});
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // cache 5 min
  });

  const count = data?.chaptersThisMonth ?? 0;
  const formatted = count.toLocaleString();
  const monthName = new Date().toLocaleString('en-US', { month: 'long' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 px-4 py-3 bg-card border border-border/60 rounded-xl"
    >
      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
        <BookOpen className="w-4 h-4 text-purple-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-muted-foreground leading-tight">
          Bible Built community in {monthName}
        </p>
        <p className="text-[17px] font-bold text-foreground leading-tight mt-0.5">
          {isLoading ? '—' : `${formatted} chapters read`}
        </p>
      </div>
    </motion.div>
  );
}