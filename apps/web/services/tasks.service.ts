/**
 * Task service - client-safe business logic
 * Can be called from components via fetch() or directly from API routes
 */

import { adminDb } from "../config/firebase-admin";
import type { Firestore, DocumentReference } from "firebase-admin/firestore";

// Helper to ensure we have a valid database instance
function getDb(): Firestore {
  if (!adminDb) {
    throw new Error('Firebase Admin is not initialized. Check your environment variables.');
  }
  return adminDb;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

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
}): Promise<DocumentReference> {
  const db = getDb();
  const taskRef = await db.collection("tasks").add({
    ...data,
    status: data.status || "pending",
    priority: data.priority || "medium",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return taskRef;
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  data: Record<string, any>
): Promise<DocumentReference> {
  const db = getDb();
  const docRef = db.collection("tasks").doc(taskId);
  await docRef.update({
    ...data,
    updatedAt: new Date(),
  });
  return docRef;
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
  const db = getDb();
  await db.collection("tasks").doc(taskId).delete();
}

/**
 * Get a single task
 */
export async function getTask(taskId: string): Promise<Task | null> {
  const db = getDb();
  const docRef = db.collection("tasks").doc(taskId);
  const docSnap = await docRef.get();
  return docSnap.exists ? { id: docSnap.id, ...docSnap.data() } as Task : null;
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
): Promise<Task[]> {
  const db = getDb();
  const { status, priority, teamId, groupId, limit: queryLimit = 20 } = filters;

  let q = db.collection("tasks")
    .where("assignedTo", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(queryLimit);

  if (status) {
    q = db.collection("tasks")
      .where("assignedTo", "==", userId)
      .where("status", "==", status)
      .orderBy("createdAt", "desc")
      .limit(queryLimit);
  }

  const querySnapshot = await q.get();
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task));
}