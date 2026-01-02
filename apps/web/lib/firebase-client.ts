/**
 * Client-side Firebase configuration
 * 🔥 Used ONLY in: components, hooks, services, contexts
 * ❌ NEVER import this in /api routes
 */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export type FirebaseConfig = {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
};

/**
 * Initialize Firebase app (idempotent - safe to call multiple times)
 */
function initializeFirebaseApp(): FirebaseApp {
  if (!app) {
    if (getApps().length) {
      app = getApp();
    } else {
      app = initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
      });
    }
  }
  return app;
}

/**
 * Legacy: called to initialize on demand
 * @deprecated Use getFirebaseAuth() or getFirestoreDb() directly
 */
export function initWebFirebase() {
  initializeFirebaseApp();
}

/**
 * Get Firebase Auth instance (lazy initialized)
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(initializeFirebaseApp());
  }
  return auth;
}

/**
 * Get Firestore instance (lazy initialized)
 */
export function getFirestoreDb(): Firestore {
  if (!db) {
    db = getFirestore(initializeFirebaseApp());
  }
  return db;
}
