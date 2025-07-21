import { db } from '../../../config/firebase';
import { adminDb } from '../../../config/firebase-admin';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

export async function GET(request) {
  const results = {
    clientConfig: {},
    adminConfig: {},
    testResults: {}
  };

  try {
    // Check client configuration
    results.clientConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Missing',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Missing',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'Missing',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Missing',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Set' : 'Missing'
    };

    // Check admin configuration
    results.adminConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID || 'Missing',
      serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? 'Set' : 'Missing',
      googleAppCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || 'Missing',
      adminDbStatus: adminDb ? 'Initialized' : 'Not initialized'
    };

    // Test client-side Firestore
    if (db) {
      try {
        // Get tasks count
        const tasksSnapshot = await getDocs(collection(db, 'tasks'));
        results.testResults.tasksCount = tasksSnapshot.size;
        
        // Get users count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        results.testResults.usersCount = usersSnapshot.size;
        
        results.testResults.clientFirestore = 'Working';
      } catch (error) {
        results.testResults.clientFirestore = `Error: ${error.message}`;
      }
    } else {
      results.testResults.clientFirestore = 'Not initialized';
    }

    // Test admin Firestore
    if (adminDb) {
      try {
        const tasksRef = adminDb.collection('tasks');
        const snapshot = await tasksRef.limit(1).get();
        results.testResults.adminFirestore = 'Working';
      } catch (error) {
        results.testResults.adminFirestore = `Error: ${error.message}`;
      }
    } else {
      results.testResults.adminFirestore = 'Not initialized';
    }

    return new Response(JSON.stringify(results, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
