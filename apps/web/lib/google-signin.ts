// lib/google-signin.ts
import {
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  signInWithCredential,
} from "firebase/auth";
import { getFirebaseAuth } from "../lib/firebase-client";
import { isMobileApp } from "../lib/platform";
import { SocialLogin } from '@capgo/capacitor-social-login';

export async function googleSignIn() {
  const auth = getFirebaseAuth();

  try {
    if (isMobileApp) {
      // Use SocialLogin for mobile
      const res = await SocialLogin.login({
        provider: 'google',
        options: {}
      });

      if (res.result && res.result.responseType === 'online') {
        const credential = GoogleAuthProvider.credential(res.result.idToken, res.result.accessToken);
        const result = await signInWithCredential(auth, credential);
        return result;
      }

      return null;
    } else {
      // Use Google One Tap for web (HTML-based approach)
      return new Promise((resolve, reject) => {
        const googleAny = (window as any)?.google;
        if (!googleAny?.accounts?.id) {
          reject(new Error("Google One Tap not available"));
          return;
        }

        // Initialize using JavaScript if not already done
        if (!(window as any).googleOneTapInitialized) {
          googleAny.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            callback: async (response: any) => {
              try {
                (window as any).googleOneTapCompleted = true;
                const auth = getFirebaseAuth();
                const credential = GoogleAuthProvider.credential(response.credential);
                const result = await signInWithCredential(auth, credential);
                resolve(result);
              } catch (err) {
                console.error("One Tap sign-in failed", err);
                reject(err);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          (window as any).googleOneTapInitialized = true;
        }

        // Store resolvers for the callback to use
        (window as any).googleOneTapResolver = resolve;
        (window as any).googleOneTapRejecter = reject;
        (window as any).googleOneTapCompleted = false;

        // The HTML element handles initialization, just prompt
        googleAny.accounts.id.prompt();

        // Set a timeout to fallback to popup if One Tap doesn't respond
        setTimeout(() => {
          if (!(window as any).googleOneTapCompleted) {
            console.log("One Tap timeout, falling back to popup");
            // Clean up resolvers
            (window as any).googleOneTapResolver = null;
            (window as any).googleOneTapRejecter = null;
            
            signInWithPopup(auth, new GoogleAuthProvider())
              .then(resolve)
              .catch(reject);
          }
        }, 10000); // 10 second timeout
      });
    }
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
  // Only needed for mobile redirect flow, but SocialLogin handles it
  return null;
}
