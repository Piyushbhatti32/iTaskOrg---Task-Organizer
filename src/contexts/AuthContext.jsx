"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { auth } from "../config/firebase";
import { useStore } from "../store";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const updateProfile = useStore(state => state.updateProfile);

  // Sync user profile data with store
  const syncUserProfile = (user) => {
    if (!user) return;

    const profileData = {
      name: user.displayName || '',
      email: user.email || '',
      joinDate: user.metadata.creationTime,
      lastSignIn: user.metadata.lastSignInTime,
      emailVerified: user.emailVerified,
      providerId: user.providerData[0]?.providerId || 'email'
    };

    // Get current profile to check existing avatar
    const currentProfile = useStore.getState().profile;
    
    // Only set photoURL as avatar if there's no existing avatar
    if (!currentProfile.avatar && user.photoURL) {
      profileData.avatar = user.photoURL;
    } else if (currentProfile.avatar) {
      profileData.avatar = currentProfile.avatar;
    }

    updateProfile(profileData);
  };

  // Handle auth state changes and redirect results
  useEffect(() => {
    let unsubscribe;

    const initAuth = async () => {
      try {
        // First, check for redirect result
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setUser(result.user);
          syncUserProfile(result.user);
          // Set auth cookie
          document.cookie = `auth-token=${await result.user.getIdToken()}; path=/`;
        }

        // Then set up auth state listener
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            setUser(user);
            syncUserProfile(user);
            // Set auth cookie
            document.cookie = `auth-token=${await user.getIdToken()}; path=/`;
          } else {
            setUser(null);
            // Remove auth cookie
            document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Auth initialization error:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [updateProfile]);

  const login = async (email, password, remember = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // Set persistence based on remember me
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      syncUserProfile(userCredential.user);
      // Set auth cookie
      document.cookie = `auth-token=${await userCredential.user.getIdToken()}; path=/`;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      syncUserProfile(userCredential.user);
      // Set auth cookie
      document.cookie = `auth-token=${await userCredential.user.getIdToken()}; path=/`;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Use redirect instead of popup
      await signInWithRedirect(auth, provider);
      // Note: The result will be handled by getRedirectResult in useEffect
    } catch (error) {
      setError(error.message);
      setLoading(false);
      throw error;
    }
  };

  const githubSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const provider = new GithubAuthProvider();
      provider.addScope('user:email');
      
      // Use redirect instead of popup
      await signInWithRedirect(auth, provider);
      // Note: The result will be handled by getRedirectResult in useEffect
    } catch (error) {
      setError(error.message);
      setLoading(false);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await signOut(auth);
      setUser(null);
      // Reset profile in store
      updateProfile({
        name: '',
        email: '',
        avatar: '',
        bio: '',
        timezone: 'UTC'
      });
      // Remove auth cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    login,
    signUp,
    googleSignIn,
    githubSignIn,
    resetPassword,
    logout,
    error,
    loading,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
