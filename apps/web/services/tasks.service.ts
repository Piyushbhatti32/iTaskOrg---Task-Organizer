/**
 * Task service - client-safe business logic
 * Can be called from components via fetch() or directly from API routes
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
} from "firebase/firestore";

/**
 * Create a new task
 */
export async function createTask(data: {
  title: string;
  description?: string;
  assignedTo: string;
  status?: "pending" | "in-progress" | "completed";
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  [key: string]: any;
}) {
  const db = getFirestoreDb();
  const taskRef = await addDoc(collection(db, "tasks"), {
    ...data,
    status: data.status || "pending",
    priority: data.priority || "medium",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return taskRef;
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  data: Record<string, any>
) {
  const db = getFirestoreDb();
  const docRef = doc(db, "tasks", taskId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
  return docRef;
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string) {
  const db = getFirestoreDb();
  await deleteDoc(doc(db, "tasks", taskId));
}

/**
 * Get a single task
 */
export async function getTask(taskId: string) {
  const db = getFirestoreDb();
  const docRef = doc(db, "tasks", taskId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

/**
 * Get user tasks with optional filters
 */
export async function getUserTasks(
  userId: string,
  filters: {
    status?: string;
    priority?: string;
    teamId?: string;
    groupId?: string;
    limit?: number;
  } = {}
) {
  const db = getFirestoreDb();
  const { status, priority, teamId, groupId, limit: queryLimit = 20 } = filters;

  let q = query(
    collection(db, "tasks"),
    where("assignedTo", "==", userId),
    orderBy("createdAt", "desc"),
    limit(queryLimit)
  );

  if (status) {
    q = query(
      collection(db, "tasks"),
      where("assignedTo", "==", userId),
      where("status", "==", status),
      orderBy("createdAt", "desc"),
      limit(queryLimit)
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
