import { db } from '../config/firebase.js';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';

async function testFirestoreConnection() {
  console.log('Testing Firestore connection...\n');
  
  try {
    // Test 1: Write a test document
    console.log('1. Testing write operation...');
    const testData = {
      test: true,
      message: 'This is a test document',
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'test_collection'), testData);
    console.log('✓ Document written with ID:', docRef.id);
    
    // Test 2: Read the document back
    console.log('\n2. Testing read operation...');
    const docSnap = await getDoc(doc(db, 'test_collection', docRef.id));
    
    if (docSnap.exists()) {
      console.log('✓ Document data:', docSnap.data());
    } else {
      console.log('✗ No such document!');
    }
    
    // Test 3: Query all documents in test collection
    console.log('\n3. Testing query operation...');
    const querySnapshot = await getDocs(collection(db, 'test_collection'));
    console.log(`✓ Found ${querySnapshot.size} documents in test_collection`);
    
    // Test 4: Test tasks collection
    console.log('\n4. Checking tasks collection...');
    const tasksSnapshot = await getDocs(collection(db, 'tasks'));
    console.log(`✓ Found ${tasksSnapshot.size} documents in tasks collection`);
    
    if (tasksSnapshot.size > 0) {
      console.log('\nFirst 3 tasks:');
      let count = 0;
      tasksSnapshot.forEach((doc) => {
        if (count < 3) {
          const data = doc.data();
          console.log(`- ${doc.id}: ${data.title || 'No title'} (assignedTo: ${data.assignedTo || 'None'})`);
          count++;
        }
      });
    }
    
    // Test 5: Check Firestore rules (try to read without auth)
    console.log('\n5. Testing Firestore security rules...');
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      console.log(`✓ Can read users collection (${usersSnapshot.size} users)`);
    } catch (error) {
      console.log('✗ Cannot read users collection (expected if auth is required)');
      console.log('  Error:', error.message);
    }
    
    console.log('\n✅ Firestore connection test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Firestore test failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
  }
}

// Run the test
testFirestoreConnection();
