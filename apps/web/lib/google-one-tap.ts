/* apps/web/lib/google-one-tap.ts */
'use client';

import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { getFirebaseAuth } from "./firebase-client";

/**
 * Google One Tap (Web ONLY)
 * Safe for Turbopack
 */
let isInitialized = false;

export function initGoogleOneTap() {
  if (typeof window === "undefined" || isInitialized) return;

  const googleAny = (window as any)?.google;
  if (!googleAny?.accounts?.id) return;

  googleAny.accounts.id.initialize({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    callback: async (response: any) => {
      try {
        const auth = getFirebaseAuth();
        const credential = GoogleAuthProvider.credential(response.credential);
        await signInWithCredential(auth, credential);
      } catch (err) {
        console.error("One Tap sign-in failed", err);
      }
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  googleAny.accounts.id.prompt();
  isInitialized = true;
}

/* 🚨 THIS LINE IS CRITICAL FOR TURBOPACK */
export {};
