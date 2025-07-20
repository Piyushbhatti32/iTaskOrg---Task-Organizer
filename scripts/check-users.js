const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
let app;
try {
  // Try to use service account key if it exists
  const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  } else {
    // Fallback to environment variables
    app = initializeApp({
      credential: applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  process.exit(1);
}

const db = getFirestore(app);

async function checkUsers() {
  try {
    console.log('🔍 Checking for users in Firestore...\n');
    
    // Get all users from the collection
    const usersRef = db.collection('users');
    const snapshot = await usersRef.limit(50).get();
    
    if (snapshot.empty) {
      console.log('❌ No users found in the users collection');
      console.log('💡 This explains why the user search is not working');
      console.log('💡 Users need to be created when they sign up');
      return;
    }
    
    console.log(`✅ Found ${snapshot.size} users in the database:\n`);
    
    snapshot.docs.forEach((doc, index) => {
      const userData = doc.data();
      const displayName = userData.displayName || userData.name || userData.email?.split('@')[0] || 'Unknown User';
      
      console.log(`${index + 1}. User ID: ${doc.id}`);
      console.log(`   Name: ${displayName}`);
      console.log(`   Email: ${userData.email || 'No email'}`);
      console.log(`   Created: ${userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toISOString() : 'No date'}`);
      console.log('');
    });
    
    // Test the search functionality
    console.log('🧪 Testing search functionality...\n');
    
    // Search for users with 'a' in their name or email
    const testQuery = 'a';
    const lowerQuery = testQuery.toLowerCase();
    
    const searchResults = snapshot.docs
      .map(doc => {
        const userData = doc.data();
        return {
          id: doc.id,
          name: userData.displayName || userData.name || userData.email?.split('@')[0] || 'Unknown User',
          email: userData.email || '',
        };
      })
      .filter(user => {
        const nameMatch = user.name.toLowerCase().includes(lowerQuery);
        const emailMatch = user.email.toLowerCase().includes(lowerQuery);
        return nameMatch || emailMatch;
      });
    
    console.log(`Search results for "${testQuery}": ${searchResults.length} matches`);
    searchResults.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
    
    if (error.code === 'permission-denied') {
      console.log('\n💡 Permission denied - check Firebase Admin SDK configuration');
      console.log('💡 Make sure serviceAccountKey.json is present or environment variables are set');
    } else if (error.code === 'not-found') {
      console.log('\n💡 Users collection not found - this is normal if no users have signed up yet');
    }
  }
}

checkUsers().then(() => {
  console.log('\n✨ User check complete');
  process.exit(0);
}).catch(error => {
  console.error('Failed to check users:', error);
  process.exit(1);
});
