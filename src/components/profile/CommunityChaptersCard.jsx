import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CommunityChaptersCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['communityStats'],
    queryFn: async () => {
      const res = await base44.functions.invoke('communityStats', {});
      return res.data;
    },
    staleTime: 24 * 60 * 60 * 1000,
  });

  const count = data?.chaptersThisMonth ?? 0;
  const formatted = count.toLocaleString();
  const monthName = new Date().toLocaleString('en-US', { month: 'long' });

  if (isLoading) return null;

  return (
    <p className="text-[12px] text-muted-foreground text-center pt-1">
      📖 Community read <span className="font-semibold text-foreground">{formatted}</span> chapters in {monthName}
    </p>
  );
}