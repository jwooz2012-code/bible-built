import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function App({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}