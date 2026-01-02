// lib/google-signin.ts
import {
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
} from "firebase/auth";
import { getFirebaseAuth } from "../lib/firebase-client";
import { isMobileApp } from "../lib/platform";

export async function googleSignIn() {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();

  try {
    if (isMobileApp) {
      await signInWithRedirect(auth, provider);
      return null; // redirect happens
    }

    return await signInWithPopup(auth, provider);
  } catch (err: any) {
    // USER CANCEL — NOT ERROR
    if (
      err?.message?.toLowerCase().includes("cancel") ||
      err?.code === "auth/popup-closed-by-user"
    ) {
      return null;
    }

    // REAL ERROR
    console.error("Google Sign-In failed:", err);
    throw err;
  }
}

export async function handleRedirectResult() {
  const auth = getFirebaseAuth();
  try {
    return await getRedirectResult(auth);
  } catch (err) {
    console.error("Redirect result error:", err);
    return null;
  }
}
