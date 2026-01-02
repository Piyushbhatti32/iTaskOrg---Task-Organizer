// lib/google-auth.ts
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { getFirebaseAuth } from "./firebase-client";
import { isMobileApp } from "./platform";

// Initialize Google Auth for mobile
export const initGoogleAuth = () => {
  if (!isMobileApp) return;

  GoogleAuth.initialize({
    clientId: "514738590363-50iarlr0qon24at6df0or5m9abeopbrn.apps.googleusercontent.com",
    scopes: ["profile", "email"],
    grantOfflineAccess: true,
  });
};

/**
 * Check if error is a user cancellation (not a real error)
 * User cancellation is normal control flow, not an exception
 */
function isCancellationError(error: any): boolean {
  if (!error) return false;

  const message = error?.message?.toLowerCase() || "";
  const code = error?.code?.toLowerCase() || "";

  return (
    message.includes("canceled") ||
    message.includes("cancelled") ||
    message.includes("user_cancelled") ||
    code.includes("user_cancelled") ||
    code === "popup_closed_by_user" ||
    code === "cancelled_popup_request"
  );
}

// Mobile-specific Google Sign-In flow
export async function signInWithGoogleMobile() {
  const auth = getFirebaseAuth();

  if (!isMobileApp) {
    throw new Error("signInWithGoogleMobile should only be called on mobile");
  }

  try {
    // 🔥 Native Google account picker (no popup blocking)
    const googleUser = await GoogleAuth.signIn();

    // ✅ USER CANCELED → SILENT EXIT (user dismissed the picker)
    if (!googleUser?.authentication?.idToken) {
      return null;
    }

    // Convert native auth to Firebase credential
    const credential = GoogleAuthProvider.credential(
      googleUser.authentication.idToken
    );

    // Sign in to Firebase
    const result = await signInWithCredential(auth, credential);
    return result;
  } catch (error) {
    // ✅ User canceled sign-in → return null silently (not an error)
    if (isCancellationError(error)) {
      return null;
    }

    // ❌ Real error → rethrow
    console.error("Mobile Google Sign-In error:", error);
    throw error;
  }
}

// Web-specific Google Sign-In flow (fallback)
export async function signInWithGoogleWeb() {
  const auth = getFirebaseAuth();

  if (isMobileApp) {
    throw new Error("signInWithGoogleWeb should only be called on web");
  }

  const { signInWithPopup } = await import("firebase/auth");
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    // ✅ User canceled popup → return null silently (not an error)
    if (isCancellationError(error)) {
      return null;
    }

    // Fallback to redirect if popup is blocked (real error)
    console.warn("Popup failed, trying redirect:", error);
    try {
      const { signInWithRedirect } = await import("firebase/auth");
      await signInWithRedirect(auth, provider);
      return null; // Result will be handled by onAuthStateChanged
    } catch (redirectError) {
      // Redirect also failed
      throw redirectError;
    }
  }
}
