import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { GuestModeProvider } from '@/components/GuestModeProvider';

export default function App({ children }) {
  return (
    <GuestModeProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </GuestModeProvider>
  );
}