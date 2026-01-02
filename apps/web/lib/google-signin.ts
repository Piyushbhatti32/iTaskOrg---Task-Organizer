// lib/google-signin.ts
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import {
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { getFirebaseAuth } from "../lib/firebase-client";
import { isMobileApp } from "../lib/platform";

export async function googleSignIn() {
  const auth = getFirebaseAuth();

  try {
    if (isMobileApp) {
      const result = await GoogleAuth.signIn();

      // 🔥 USER CANCELED → SILENT EXIT
      if (!result?.authentication?.idToken) {
        return null;
      }

      const credential = GoogleAuthProvider.credential(
        result.authentication.idToken
      );

      return await signInWithCredential(auth, credential);
    }

    // 🌐 Web fallback
    const { signInWithPopup } = await import("firebase/auth");
    return await signInWithPopup(auth, new GoogleAuthProvider());

  } catch (err: any) {
    // USER CANCEL — NOT ERROR
    if (
      err?.message?.toLowerCase().includes("cancel") ||
      err?.code === "user_cancelled"
    ) {
      return null;
    }

    // REAL ERROR
    console.error("Google Sign-In failed:", err);
    throw err;
  }
}
