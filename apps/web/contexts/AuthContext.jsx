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
  browserLocalPersistence,
  AuthError,
} from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase-client";
import { isMobileApp } from "@/lib/platform";
import { googleSignIn as firebaseGoogleSignIn } from "@/lib/google-signin";
import { useStore } from "../store";
import { createOrUpdateUserProfile, getUserProfile } from "../utils/db";

const AuthContext = createContext(null);

/**
 * Maps Firebase error codes to user-friendly messages
 */
const getErrorMessage = (error) => {
  if (!(error instanceof Error)) {
    return "An unexpected error occurred";
  }

  const code = error.code || error.message;

  const errorMap = {
    "auth/user-not-found": "No account found with this email",
    "auth/wrong-password": "Incorrect password",
    "auth/invalid-email": "Invalid email address",
    "auth/user-disabled": "This account has been disabled",
    "auth/too-many-requests": "Too many login attempts. Please try again later",
    "auth/network-request-failed": "Network error. Please check your connection",
    "auth/operation-not-allowed": "Sign in method is not enabled",
    "auth/email-already-in-use": "This email is already registered",
    "auth/weak-password": "Password is too weak. Use at least 6 characters",
    "auth/invalid-credential": "Invalid credentials provided",
    "auth/credential-already-in-use": "This credential is already in use",
    "auth/internal-error": "Internal authentication error. Please try again",
    "auth/invalid-api-key": "API key error. Please contact support",
    "auth/app-not-authorized": "App is not authorized. Please contact support",
    "auth/operation-not-supported-in-this-environment":
      "This operation is not supported in your environment",
    popup_closed_by_user: "Sign-in popup was closed",
    cancelled_popup_request: "Sign-in was cancelled",
    popup_blocked: "Sign-in popup was blocked by your browser",
  };

  return errorMap[code] || error.message || "An unexpected error occurred";
};

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRedirectResultChecked, setIsRedirectResultChecked] = useState(false);

  const updateProfile = useStore((state) => state.updateProfile);
  const loadAllUserData = useStore((state) => state.loadAllUserData);

  const clearError = () => {
    setError(null);
  };

  // ✅ Create auth instance ONCE (after Firebase init)
  useEffect(() => {
    try {
      const authInstance = getFirebaseAuth();
      if (!authInstance) {
        console.error("Failed to initialize Firebase Authentication");
        setError("Authentication service is unavailable");
        setLoading(false);
        return;
      }
      setAuth(authInstance);
    } catch (err) {
      console.error("Firebase initialization error:", err);
      setError("Failed to initialize authentication");
      setLoading(false);
    }
  }, []);

  // -------------------------
  // Helpers
  // -------------------------

  const syncUserProfile = async (firebaseUser) => {
    if (!firebaseUser) return;

    try {
      const userProfile = await getUserProfile(firebaseUser.uid);

      updateProfile({
        name: userProfile?.name || firebaseUser.displayName || "",
        email: firebaseUser.email || "",
        bio: userProfile?.bio || "",
        timezone: userProfile?.timezone || "UTC",
        joinDate: firebaseUser.metadata.creationTime,
        lastSignIn: firebaseUser.metadata.lastSignInTime,
        emailVerified: firebaseUser.emailVerified,
        providerId: firebaseUser.providerData[0]?.providerId || "email",
        avatar: userProfile?.avatar || firebaseUser.photoURL || "",
      });
    } catch (err) {
      console.error("Error syncing user profile:", err);
      // Fallback to basic profile with Firebase data
      updateProfile({
        name: firebaseUser.displayName || "",
        email: firebaseUser.email || "",
        avatar: firebaseUser.photoURL || "",
        timezone: "UTC",
      });
    }
  };

  const setAuthCookie = async (firebaseUser, remember = false) => {
    try {
      if (!firebaseUser) {
        document.cookie =
          "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        document.cookie =
          "user-email=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        document.cookie =
          "email-verified=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        return;
      }

      const token = await firebaseUser.getIdToken(true);
      const maxAge = remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

      document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `user-email=${firebaseUser.email}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `email-verified=${firebaseUser.emailVerified}; path=/; max-age=${maxAge}; SameSite=Lax`;
    } catch (err) {
      console.error("Error setting auth cookie:", err);
      // Continue anyway - cookies are secondary to auth state
    }
  };

  // -------------------------
  // Auth lifecycle (SAFE)
  // -------------------------

  useEffect(() => {
    if (!auth) return; // 🔥 HARD GUARD

    let unsubscribe;

    const initAuth = async () => {
      try {
        // Handle OAuth redirect result (once)
        try {
          const result = await getRedirectResult(auth);
          if (result?.user) {
            setUser(result.user);
            await syncUserProfile(result.user);
            await setAuthCookie(result.user, true);
          }
        } catch (err) {
          console.error("Redirect result error:", err);
          // Don't set error here - redirect handling is not critical
        } finally {
          setIsRedirectResultChecked(true);
        }

        // Subscribe to auth state
        unsubscribe = onAuthStateChanged(
          auth,
          async (firebaseUser) => {
            try {
              if (firebaseUser) {
                setUser(firebaseUser);
                await Promise.all([
                  syncUserProfile(firebaseUser),
                  setAuthCookie(firebaseUser),
                  createOrUpdateUserProfile(firebaseUser.uid, {
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    emailVerified: firebaseUser.emailVerified,
                    lastSignIn: new Date(),
                    isActive: true,
                  }).catch((err) => {
                    console.error("Error updating user profile:", err);
                  }),
                ]);
              } else {
                setUser(null);
                await setAuthCookie(null);
              }
              setError(null);
            } catch (err) {
              console.error("Error in auth state change handler:", err);
              // Don't set error - state update succeeded even if side effects failed
            } finally {
              setLoading(false);
            }
          },
          (err) => {
            // Handle auth state listener errors
            console.error("Auth state listener error:", err);
            setError(getErrorMessage(err));
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Auth init error:", err);
        setError(getErrorMessage(err));
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [auth]);

  // -------------------------
  // Public API
  // -------------------------

  const login = async (email, password, remember = false) => {
    if (!auth) {
      setError("Authentication service is unavailable");
      throw new Error("Authentication service is unavailable");
    }

    setLoading(true);
    setError(null);

    try {
      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      await setPersistence(auth, browserLocalPersistence);
      const cred = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );
      setUser(cred.user);
      await syncUserProfile(cred.user);
      await setAuthCookie(cred.user, remember);
      await loadAllUserData(cred.user.uid);
      return cred.user;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error("Login error:", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    if (!auth) {
      setError("Authentication service is unavailable");
      throw new Error("Authentication service is unavailable");
    }

    setLoading(true);
    setError(null);

    try {
      // Use unified Firebase flow for both mobile and web
      const result = await firebaseGoogleSignIn();

      // ✅ User canceled → return null (not an error)
      if (result === null) {
        return null;
      }

      if (result?.user) {
        setUser(result.user);
        await syncUserProfile(result.user);
        await setAuthCookie(result.user, true);
        await loadAllUserData(result.user.uid);
      }

      return result?.user || null;
    } catch (err) {
      // ✅ User canceled → return null silently
      if (err?.message?.toLowerCase().includes("cancel") || 
          err?.message?.toLowerCase().includes("user_cancel")) {
        return null;
      }

      // ❌ Real error → set error and rethrow
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error("Google sign-in error:", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) return;

    try {
      await signOut(auth);
      setUser(null);
      setError(null);
      updateProfile({});
      
      // Clear local storage
      try {
        localStorage.removeItem("itaskorg-storage");
      } catch (err) {
        console.warn("Error clearing local storage:", err);
      }

      // Full reload on logout (critical for WebView)
      // Avoids cache bugs, history issues, and auth ghost state
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
      setError(getErrorMessage(err));
      // Force navigation even if logout fails
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        clearError,
        login,
        googleSignIn,
        logout,
        isRedirectResultChecked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
