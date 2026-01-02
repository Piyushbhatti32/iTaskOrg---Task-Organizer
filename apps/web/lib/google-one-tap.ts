import {
      GoogleAuthProvider,
        signInWithCredential,
        } from "firebase/auth";
        import { getFirebaseAuth } from "../lib/firebase-client";

        declare global {
          interface Window {
              google?: any;
                }
                }

                export function initGoogleOneTap() {
                  if (typeof window === "undefined") return;
                    if (!window.google) return;

                      window.google.accounts.id.initialize({
                          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                              callback: async (response: any) => {
                                    try {
                                            const auth = getFirebaseAuth();
                                                    const credential = GoogleAuthProvider.credential(
                                                              response.credential
                                                                      );
                                                                              await signInWithCredential(auth, credential);
                                                                                      window.location.href = "/tasks";
                                                                                            } catch (err) {
                                                                                                    console.error("One Tap sign-in failed", err);
                                                                                                          }
                                                                                                              },
                                                                                                                  auto_select: false,
                                                                                                                      cancel_on_tap_outside: true,
                                                                                                                        });

                                                                                                                          window.google.accounts.id.prompt();
                                                                                                                          }
}