import { initWebFirebase, getFirestoreDb } from "@/lib/firebase-client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  deleteField
} from 'firebase/firestore';

const getDb = () => {
  initWebFirebase();
  const db = getFirestoreDb();
  if (!db) {
    throw new Error("Firestore not initialized");
  }
  return db;
};
/**
 * Generic CRUD operations
 */
export const createDocument = async (collectionName, id, data) => {
  if (!id || typeof id !== 'string') {
    throw new Error(`Invalid document ID provided: ${id}`);
  }
  if (!collectionName || typeof collectionName !== 'string') {
    throw new Error(`Invalid collection name provided: ${collectionName}`);
  }
  
  try {
    const db = getDb();
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

export const updateDocument = async (collectionName, id, data) => {
  const db = getDb();
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
  return docRef;
};

export const deleteDocument = async (collectionName, id) => {
  const db = getDb();
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

export const getDocument = async (collectionName, id) => {
  if (!id || typeof id !== 'string') {
    console.warn(`Invalid document ID provided: ${id}`);
    return null;
  }
  const db = getDb();
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

/**
 * User operations
 */
export const createUserProfile = async (userId, data) => {
  return createDocument('users', userId, {
    ...data,
    teams: [],
    groups: []
  });
};

export const createOrUpdateUserProfile = async (userId, data) => {
  try {
    const existingUser = await getUserProfile(userId);
    if (existingUser) {
      // Update existing user
      return updateUserProfile(userId, data);
    } else {
      // Create new user profile
      return createUserProfile(userId, data);
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
};

export const searchUsers = async (searchQuery, limitCount = 10) => {
  try {
    const db = getDb();
    const usersRef = collection(db, 'users');
    
    if (searchQuery.trim()) {
      // Get all users and filter client-side for better search
      const allUsersQuery = query(usersRef, limit(100));
      const snapshot = await getDocs(allUsersQuery);
      
      const lowerQuery = searchQuery.toLowerCase();
      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(user => {
          const name = user.displayName || user.name || '';
          const email = user.email || '';
          return name.toLowerCase().includes(lowerQuery) || 
                 email.toLowerCase().includes(lowerQuery);
        })
        .slice(0, limitCount);
    } else {
      // Return recent users
      const recentQuery = query(
        usersRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(recentQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, data) => {
  return updateDocument('users', userId, data);
};

export const getUserProfile = async (userId) => {
  return getDocument('users', userId);
};

export const createTask = async (data) => {
  const db = getDb();
  const taskRef = await addDoc(collection(db, 'tasks'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: data.status || 'pending'
  });
  return taskRef;
};

export const updateTask = async (taskId, data) => {
  return updateDocument('tasks', taskId, data);
};

export const deleteTask = async (taskId) => {
  return deleteDocument('tasks', taskId);
};

export const getTask = async (taskId) => {
  return getDocument('tasks', taskId);
};

export const getUserTasks = async (userId, filters = {}) => {
  const { status, priority, teamId, groupId, limit: queryLimit = 20, lastDoc } = filters;
  const db = getDb();
  
  let q = query(
    collection(db, 'tasks'),
    where('assignedTo', '==', userId),
    orderBy('createdAt', 'desc')
  );

  if (status) q = query(q, where('status', '==', status));
  if (priority) q = query(q, where('priority', '==', priority));
  if (teamId) q = query(q, where('teamId', '==', teamId));
  if (groupId) q = query(q, where('groupId', '==', groupId));
  
  q = query(q, limit(queryLimit));
  if (lastDoc) q = query(q, startAfter(lastDoc));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Team operations
 */
export const createTeam = async (data) => {
  const db = getDb();
  const teamRef = await addDoc(collection(db, 'teams'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return teamRef;
};

export const updateTeam = async (teamId, data) => {
  return updateDocument('teams', teamId, data);
};

export const deleteTeam = async (teamId) => {
  return deleteDocument('teams', teamId);
};

export const getTeam = async (teamId) => {
  return getDocument('teams', teamId);
};

export const addTeamMember = async (teamId, userId, role = 'member') => {
  const db = getDb();
  const teamRef = doc(db, 'teams', teamId);
  const userRef = doc(db, 'users', userId);

  await updateDoc(teamRef, {
    [`members.${userId}`]: {
      role,
      joinedAt: serverTimestamp()
    }
  });

  await updateDoc(userRef, {
    teams: arrayUnion(teamId)
  });
};

export const removeTeamMember = async (teamId, userId) => {
  const db = getDb();
  const teamRef = doc(db, 'teams', teamId);
  const userRef = doc(db, 'users', userId);

  await updateDoc(teamRef, {
    [`members.${userId}`]: deleteField()
  });

  await updateDoc(userRef, {
    teams: arrayRemove(teamId)
  });
};

/**
 * Group operations
 */
export const createGroup = async (data) => {
  const db = getDb();
  const groupRef = await addDoc(collection(db, 'groups'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return groupRef;
};

export const updateGroup = async (groupId, data) => {
  return updateDocument('groups', groupId, data);
};

export const deleteGroup = async (groupId) => {
  return deleteDocument('groups', groupId);
};

export const getGroup = async (groupId) => {
  return getDocument('groups', groupId);
};

export const addGroupMember = async (groupId, userId, role = 'member') => {
  const db = getDb();
  const groupRef = doc(db, 'groups', groupId);
  const userRef = doc(db, 'users', userId);

  await updateDoc(groupRef, {
    [`members.${userId}`]: {
      role,
      joinedAt: serverTimestamp()
    }
  });

  await updateDoc(userRef, {
    groups: arrayUnion(groupId)
  });
};

export const removeGroupMember = async (groupId, userId) => {
  const db = getDb();
  const groupRef = doc(db, 'groups', groupId);
  const userRef = doc(db, 'users', userId);

  await updateDoc(groupRef, {
    [`members.${userId}`]: deleteField()
  });

  await updateDoc(userRef, {
    groups: arrayRemove(groupId)
  });
};

/**
 * Message operations
 */
export const createMessage = async (data) => {
  const db = getDb();
  const messageRef = await addDoc(collection(db, 'messages'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    readBy: []
  });
  return messageRef;
};

export const updateMessage = async (messageId, data) => {
  return updateDocument('messages', messageId, data);
};

export const deleteMessage = async (messageId) => {
  return deleteDocument('messages', messageId);
};

export const getMessage = async (messageId) => {
  return getDocument('messages', messageId);
};

export const markMessageAsRead = async (messageId, userId) => {
  const db = getDb();
  const messageRef = doc(db, 'messages', messageId);
  await updateDoc(messageRef, {
    readBy: arrayUnion({
      userId,
      readAt: serverTimestamp()
    })
  });
};

/**
 * Notification operations
 */
export const createNotification = async (data) => {
  const db = getDb();
  const notificationRef = await addDoc(collection(db, 'notifications'), {
    ...data,
    createdAt: serverTimestamp(),
    status: 'unread'
  });
  return notificationRef;
};

export const updateNotification = async (notificationId, data) => {
  return updateDocument('notifications', notificationId, data);
};

export const deleteNotification = async (notificationId) => {
  return deleteDocument('notifications', notificationId);
};

export const getNotification = async (notificationId) => {
  return getDocument('notifications', notificationId);
};

export const markNotificationAsRead = async (notificationId) => {
  return updateDocument('notifications', notificationId, {
    status: 'read'
  });
};

export const getUserNotifications = async (userId, filters = {}) => {
  const { status, type, limit: queryLimit = 20, lastDoc } = filters;
  const db = getDb();
  
  let q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  if (status) q = query(q, where('status', '==', status));
  if (type) q = query(q, where('type', '==', type));
  
  q = query(q, limit(queryLimit));
  if (lastDoc) q = query(q, startAfter(lastDoc));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Template operations
 */
export const createTemplate = async (userId, data) => {
  const db = getDb();
  const templateRef = await addDoc(collection(db, 'templates'), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return templateRef;
};

export const updateTemplate = async (templateId, data) => {
  return updateDocument('templates', templateId, data);
};

export const deleteTemplate = async (templateId) => {
  return deleteDocument('templates', templateId);
};

export const getTemplate = async (templateId) => {
  return getDocument('templates', templateId);
};

export const getUserTemplates = async (userId, filters = {}) => {
  const { limit: queryLimit = 20, lastDoc } = filters;
  const db = getDb();
  
  let q = query(
    collection(db, 'templates'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(queryLimit)
  );
  
  if (lastDoc) q = query(q, startAfter(lastDoc));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Settings operations
 */
export const createOrUpdateUserSettings = async (userId, settings) => {
  const db = getDb();
  const settingsRef = doc(db, 'userSettings', userId);
  await setDoc(settingsRef, {
    ...settings,
    userId,
    updatedAt: serverTimestamp()
  }, { merge: true });
  return settingsRef;
};

export const getUserSettings = async (userId) => {
  return getDocument('userSettings', userId);
};

export const updateUserSettings = async (userId, settings) => {
  return updateDocument('userSettings', userId, settings);
};

export const deleteUserSettings = async (userId) => {
  return deleteDocument('userSettings', userId);
};
