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
  signInWithPopup,
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
  const [isRedirectResultChecked, setIsRedirectResultChecked] = useState(false);
  const updateProfile = useStore(state => state.updateProfile);

  // Sync user profile data with store
  const syncUserProfile = (user) => {
    if (!user) return;
    console.log('Syncing user profile:', user.email);

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

  // Set auth cookie with proper expiration
  const setAuthCookie = async (user, remember = false) => {
    try {
      if (!user) {
        console.log('Removing auth cookie');
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
        return;
      }

      console.log('Setting auth cookie for user:', user.email);
      const token = await user.getIdToken(true); // Force token refresh
      const maxAge = remember ? 7 * 24 * 60 * 60 : 3600; // 7 days if remember, 1 hour if not
      
      // Set cookie with less strict SameSite policy
      document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      
      // Verify cookie was set
      const cookieCheck = document.cookie.includes('auth-token=');
      console.log('Cookie set verification:', cookieCheck);
      
      if (!cookieCheck) {
        console.warn('Cookie may not have been set properly');
        // Fallback cookie setting
        document.cookie = `auth-token=${token}; path=/`;
      }
    } catch (error) {
      console.error('Error setting auth cookie:', error);
    }
  };

  // Handle auth state changes and redirect results
  useEffect(() => {
    let unsubscribe;

    const initAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // First, check for redirect result
        try {
          console.log('Checking for redirect result...');
          const result = await getRedirectResult(auth);
          if (result?.user) {
            console.log('Got redirect result for user:', result.user.email);
            setUser(result.user);
            syncUserProfile(result.user);
            await setAuthCookie(result.user, true); // Set cookie with remember me for OAuth
          }
        } catch (redirectError) {
          console.error('Error handling redirect result:', redirectError);
        } finally {
          setIsRedirectResultChecked(true);
        }

        // Then set up auth state listener
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          console.log('Auth state changed:', user?.email);
          if (user) {
            setUser(user);
            syncUserProfile(user);
            await setAuthCookie(user);
          } else {
            setUser(null);
            await setAuthCookie(null);
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
      console.log('Attempting login for:', email);
      // Set persistence based on remember me
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful for:', email);
      setUser(userCredential.user);
      syncUserProfile(userCredential.user);
      await setAuthCookie(userCredential.user, remember);
    } catch (error) {
      console.error('Login error:', error);
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
      console.log('Attempting signup for:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Signup successful for:', email);
      setUser(userCredential.user);
      syncUserProfile(userCredential.user);
      await setAuthCookie(userCredential.user);
    } catch (error) {
      console.error('Signup error:', error);
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
      console.log('Starting Google sign in...');
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Try popup first
      try {
        console.log('Attempting popup sign in...');
        const result = await signInWithPopup(auth, provider);
        console.log('Popup sign in successful for:', result.user.email);
        setUser(result.user);
        syncUserProfile(result.user);
        await setAuthCookie(result.user, true);
        return;
      } catch (popupError) {
        console.error('Popup failed:', popupError);
        
        // If popup fails, try redirect
        console.log('Falling back to redirect...');
        await signInWithRedirect(auth, provider);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Failed to sign in with Google. Please try again.');
      throw error;
    } finally {
      setLoading(false);
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
      // First sign out from Firebase
      await signOut(auth);
      
      // Reset user state
      setUser(null);
      
      // Reset profile in store
      updateProfile({
        name: '',
        email: '',
        avatar: '',
        bio: '',
        timezone: 'UTC',
        joinDate: '',
        lastSignIn: '',
        emailVerified: false,
        providerId: 'email',
        stats: {
          tasksCompleted: 0,
          totalTasks: 0,
          completionRate: 0,
          weeklyProgress: [],
          monthlyProgress: []
        }
      });
      
      // Remove auth cookie with proper attributes
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict; Secure';
      
      // Reset any error state
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
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
    isRedirectResultChecked,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
