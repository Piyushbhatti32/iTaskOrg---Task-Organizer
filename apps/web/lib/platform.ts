// lib/platform.ts
// Detects if the app is running inside a mobile WebView (Capacitor)

export const isMobileApp =
  typeof window !== "undefined" && !!(window as any).Capacitor;

export const isPlatformWeb = !isMobileApp;
