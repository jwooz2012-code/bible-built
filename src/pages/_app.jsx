import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ReviewModeProvider } from '@/components/ReviewModeProvider';

export default function App({ children }) {
  return (
    <ReviewModeProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </ReviewModeProvider>
  );
}