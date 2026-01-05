import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ThemeProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false }
  }
});

// Apply energy mode early to prevent flash
if (typeof window !== 'undefined') {
  const energyEnabled = localStorage.getItem('bb_energy_mode') === 'true';
  if (energyEnabled) {
    document.documentElement.classList.add('energy');
  } else {
    document.documentElement.classList.remove('energy');
  }
}

export default function App({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}