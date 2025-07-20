'use client';

import { useEffect } from 'react';
import { useLoadAllUserData } from '../store';
import { useAuth } from '../contexts/AuthContext';

/**
 * TaskLoader component handles loading all user data from Firestore
 * when the app initializes or when the user changes.
 * This includes: tasks, templates, settings, and profile data.
 */
export default function TaskLoader({ children }) {
  const loadAllUserData = useLoadAllUserData();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Only load data when user is authenticated and not loading
    if (user && !authLoading) {
      loadAllUserData(user.uid)
        .then(() => {
          console.log('All user data loaded successfully from Firestore');
        })
        .catch((error) => {
          console.error('Failed to load user data from Firestore:', error);
        });
    }
  }, [user, authLoading, loadAllUserData]);

  // Always render children - the loading state doesn't need to block UI
  return children;
}
