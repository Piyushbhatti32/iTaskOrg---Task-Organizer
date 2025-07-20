import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app;
let adminDb;
let adminAuth;

if (getApps().length === 0) {
  try {
    let firebaseAdminConfig;
    
    // Check if we have service account credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Use service account credentials from environment variable
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      firebaseAdminConfig = {
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
      };
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use service account key file path
      const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      firebaseAdminConfig = {
        credential: cert(serviceAccountPath),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
      };
    } else if (process.env.FIREBASE_TYPE && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      // Use individual service account environment variables (for Vercel)
      const serviceAccount = {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || 'googleapis.com'
      };
      firebaseAdminConfig = {
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
      };
    } else {
      // Fallback to project ID only (for local development with gcloud auth)
      firebaseAdminConfig = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
      };
    }
    
    app = initializeApp(firebaseAdminConfig);
    adminDb = getFirestore(app);
    adminAuth = getAuth(app);
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    // Set to null to indicate initialization failure
    app = null;
    adminDb = null;
    adminAuth = null;
  }
} else {
  app = getApps()[0];
  try {
    adminDb = getFirestore(app);
    adminAuth = getAuth(app);
  } catch (error) {
    console.error('Error getting Firebase services:', error);
    adminDb = null;
    adminAuth = null;
  }
}

export { adminDb, adminAuth };
