/**
 * Server-side Firebase Admin configuration
 * 🔥 Used ONLY in: app/api/** routes
 * ❌ NEVER import this in client components
 */

import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

let adminApp: admin.app.App | null = null;
let adminAuth: admin.auth.Auth | null = null;
let adminDb: admin.firestore.Firestore | null = null;

/**
 * Initialize Firebase Admin SDK (idempotent)
 */
function initializeAdminApp(): admin.app.App {
  if (!adminApp) {
    // Try to use environment variable first (production)
    const serviceAccountJson = process.env.FIREBASE_ADMIN_SDK_JSON;
    
    if (serviceAccountJson) {
      try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as any),
        });
      } catch (error) {
        console.error("Failed to parse FIREBASE_ADMIN_SDK_JSON:", error);
        throw new Error("Invalid Firebase Admin SDK configuration");
      }
    } else {
      // Development: try to load from file
      const serviceAccountPath = path.join(
        process.cwd(),
        "firebase-service-account.json"
      );
      
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(
          fs.readFileSync(serviceAccountPath, "utf8")
        );
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as any),
        });
      } else {
        throw new Error(
          "Firebase Admin SDK credentials not found. " +
          "Provide FIREBASE_ADMIN_SDK_JSON env var or firebase-service-account.json file"
        );
      }
    }
  }
  
  return adminApp;
}

/**
 * Get Firebase Admin Auth (server-side only)
 * Use this in /api routes to verify tokens
 */
export function getAdminAuth(): admin.auth.Auth {
  if (!adminAuth) {
    adminAuth = admin.auth(initializeAdminApp());
  }
  return adminAuth;
}

/**
 * Get Firestore Admin instance (server-side only)
 * Use this in /api routes for unrestricted database access
 */
export function getAdminDb(): admin.firestore.Firestore {
  if (!adminDb) {
    adminDb = admin.firestore(initializeAdminApp());
  }
  return adminDb;
}

/**
 * Verify ID token (from Authorization header)
 * Returns decoded token or null if invalid
 */
export async function verifyIdToken(token: string) {
  try {
    const auth = getAdminAuth();
    return await auth.verifyIdToken(token);
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Get user by UID
 */
export async function getUser(uid: string) {
  try {
    const auth = getAdminAuth();
    return await auth.getUser(uid);
  } catch (error) {
    console.error(`Failed to get user ${uid}:`, error);
    return null;
  }
}
