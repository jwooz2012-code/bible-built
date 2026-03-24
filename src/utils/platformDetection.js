/**
 * Platform detection utilities for iOS, PWA, and notification support
 */

export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isAndroid() {
  return /Android/.test(navigator.userAgent);
}

export function isPWAInstalled() {
  // Check if running as PWA (installed to home screen)
  // Multiple detection methods to be thorough
  
  // Method 1: Check display mode (iOS 15+)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Method 2: Check for navigator.standalone (legacy iOS)
  if (navigator.standalone === true) {
    return true;
  }
  
  // Method 3: Check for display mode minimal-ui
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return true;
  }
  
  return false;
}

export function canRequestNotificationPermission() {
  // Feature detection: is Notification API available?
  if (!('Notification' in window)) {
    return false;
  }
  
  // Android: Can always request (browser-based)
  if (isAndroid()) {
    return true;
  }
  
  // iOS: Only if PWA installed
  if (isIOS()) {
    return isPWAInstalled();
  }
  
  // Desktop/other: Can request
  return true;
}

export function getPlatformInfo() {
  return {
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isPWA: isPWAInstalled(),
    canRequest: canRequestNotificationPermission(),
    platform: isIOS() ? 'iOS' : isAndroid() ? 'Android' : 'Web',
    environment: isPWAInstalled() ? 'PWA' : 'Browser',
  };
}