/**
 * Notifications service - client-safe business logic
 */

import { getFirestoreDb } from "../lib/firebase-client";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  read?: boolean;
  link?: string;
  source?: string;
  createdAt?: any;
}

/**
 * Create a notification
 */
export async function createNotification(data: Notification) {
  const db = getFirestoreDb();
  const notificationRef = await addDoc(collection(db, "notifications"), {
    ...data,
    read: data.read || false,
    createdAt: serverTimestamp(),
  });
  return notificationRef;
}

/**
 * Get user's notifications
 */
export async function getUserNotifications(
  userId: string,
  filters: {
    status?: "read" | "unread";
    type?: string;
    limit?: number;
  } = {}
) {
  const db = getFirestoreDb();
  const { status, type, limit: queryLimit = 20 } = filters;

  let q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(queryLimit)
  );

  if (status === "unread") {
    q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false),
      orderBy("createdAt", "desc"),
      limit(queryLimit)
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const db = getFirestoreDb();
  const docRef = doc(db, "notifications", notificationId);
  await updateDoc(docRef, {
    read: true,
  });
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
  const db = getFirestoreDb();
  await deleteDoc(doc(db, "notifications", notificationId));
}
