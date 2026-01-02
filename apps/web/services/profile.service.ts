/**
 * Profile service - user profile operations
 */

import { getFirestoreDb } from "../lib/firebase-client";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  teams?: string[];
  groups?: string[];
  [key: string]: any;
}

/**
 * Create or get user profile
 */
export async function createUserProfile(
  userId: string,
  data: Omit<UserProfile, "userId">
) {
  const db = getFirestoreDb();
  const docRef = doc(db, "users", userId);

  await setDoc(
    docRef,
    {
      userId,
      ...data,
      teams: data.teams || [],
      groups: data.groups || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return docRef;
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
  const db = getFirestoreDb();
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>
) {
  const db = getFirestoreDb();
  const docRef = doc(db, "users", userId);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });

  return docRef;
}
