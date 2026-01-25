/**
 * CHART COLORS — SINGLE SOURCE OF TRUTH
 * 
 * Provides theme-aware color tokens for all charts/graphs/bars across the app.
 * Ensures Energy mode has proper contrast and consistency.
 */

export const getChartColors = (resolvedTheme, energyMode) => {
  const isEnergy = energyMode;
  const isDark = resolvedTheme === 'dark';

  if (isEnergy) {
    return {
      // Primary bars/fills (vibrant accent in energy mode)
      primary: 'hsl(var(--primary))',
      primaryOpacity: 'hsla(var(--primary) / 0.3)',
      
      // Secondary/muted bars
      secondary: 'hsl(var(--chart-2))',
      secondaryOpacity: 'hsla(var(--chart-2) / 0.3)',
      
      // Track/background (subtle but visible)
      track: 'hsla(var(--muted) / 0.4)',
      trackBorder: 'hsla(var(--border) / 0.6)',
      
      // Text/labels (high contrast)
      text: 'hsl(var(--foreground))',
      textMuted: 'hsl(var(--muted-foreground))',
      
      // Grid lines/dividers
      grid: 'hsla(var(--border) / 0.4)',
      
      // Success/trend colors
      success: '#10B981',
      successBg: 'rgba(16, 185, 129, 0.15)',
      error: '#EF4444',
      errorBg: 'rgba(239, 68, 68, 0.15)',
      neutral: '#9CA3AF',
      neutralBg: 'rgba(156, 163, 175, 0.1)'
    };
  }

  if (isDark) {
    return {
      primary: 'hsl(var(--primary))',
      primaryOpacity: 'hsla(var(--primary) / 0.3)',
      secondary: 'hsl(var(--chart-2))',
      secondaryOpacity: 'hsla(var(--chart-2) / 0.3)',
      track: 'hsl(var(--secondary))',
      trackBorder: 'hsl(var(--border))',
      text: 'hsl(var(--foreground))',
      textMuted: 'hsl(var(--muted-foreground))',
      grid: 'hsla(var(--border) / 0.3)',
      success: '#10B981',
      successBg: 'rgba(16, 185, 129, 0.1)',
      error: '#EF4444',
      errorBg: 'rgba(239, 68, 68, 0.1)',
      neutral: '#9CA3AF',
      neutralBg: 'rgba(156, 163, 175, 0.1)'
    };
  }

  // Light mode (default)
  return {
    primary: 'hsl(var(--primary))',
    primaryOpacity: 'hsla(var(--primary) / 0.3)',
    secondary: 'hsl(var(--chart-2))',
    secondaryOpacity: 'hsla(var(--chart-2) / 0.3)',
    track: 'hsl(var(--secondary))',
    trackBorder: 'hsl(var(--border))',
    text: 'hsl(var(--foreground))',
    textMuted: 'hsl(var(--muted-foreground))',
    grid: 'hsla(var(--border) / 0.5)',
    success: '#10B981',
    successBg: 'rgba(16, 185, 129, 0.1)',
    error: '#EF4444',
    errorBg: 'rgba(239, 68, 68, 0.1)',
    neutral: '#9CA3AF',
    neutralBg: 'rgba(156, 163, 175, 0.1)'
  };
};