// lib/init-mobile-auth.ts
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { isMobileApp } from "../lib/platform";

export function initMobileAuth() {
  if (!isMobileApp) return;

  GoogleAuth.initialize({
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    scopes: ["profile", "email"],
    grantOfflineAccess: true,
  });
}
