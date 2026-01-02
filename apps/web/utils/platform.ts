// lib/platform.ts
export const isMobileApp =
  typeof window !== "undefined" && !!(window as any).Capacitor;
