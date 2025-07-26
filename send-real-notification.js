// Send real notification to actual user in Firebase
// This script uses the Firebase Admin SDK to send notifications

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
let adminDb;
try {
  // Read the service account key
  const serviceAccount = JSON.parse(readFileSync(join(__dirname, 'firebase-service-account.json'), 'utf8'));
  
  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  
  adminDb = getFirestore(app);
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  process.exit(1);
}

async function getAllUsers() {
  try {
    console.log('📋 Fetching all users from Firebase...');
    const usersSnapshot = await adminDb.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        name: userData.displayName || userData.name || userData.email?.split('@')[0] || 'Unknown User',
        email: userData.email,
        createdAt: userData.createdAt
      });
    });
    
    console.log(`👥 Found ${users.length} users in database`);
    return users;
  } catch (error) {
    console.error('❌ Error getting users:', error);
    return [];
  }
}

async function sendNotificationToUser(userId, userName) {
  try {
    console.log(`🔔 Sending notification to user: ${userName} (${userId})`);
    
    const notificationData = {
      userId: userId,
      title: '🔔 New Notification Center Feature',
      content: 'We\'ve added a new notification center to help you stay updated with important information and system updates. Click here to explore this new feature!',
      message: 'We\'ve added a new notification center to help you stay updated with important information and system updates.',
      type: 'system',
      status: 'unread',
      createdAt: new Date(),
      senderName: 'iTaskOrg Team',
      link: '/notifications',
      data: {
        featureTitle: 'New Notification Center Feature',
        description: 'Stay updated with important information and system updates',
        type: 'feature_announcement',
        subtype: 'notification_center',
        priority: 'high',
        category: 'product_update'
      }
    };
    
    // Add the notification to Firestore
    const docRef = await adminDb.collection('notifications').add(notificationData);
    
    console.log('✅ Notification sent successfully!');
    console.log(`📝 Notification ID: ${docRef.id}`);
    console.log(`👤 User: ${userName}`);
    console.log(`📧 Title: ${notificationData.title}`);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting real notification test...\n');
    
    // Get all users
    const users = await getAllUsers();
    
    if (users.length === 0) {
      console.log('❌ No users found in the database');
      console.log('💡 Make sure you have users in your Firebase users collection');
      return;
    }
    
    console.log('\n👥 Available users:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - ID: ${user.id}`);
    });
    
    // Send notification to all users (or just the first one for testing)
    console.log('\n🎯 Sending notifications...\n');
    
    // For safety, let's send to just the first user initially
    const testUser = users[0];
    await sendNotificationToUser(testUser.id, testUser.name);
    
    // Uncomment the following lines to send to all users:
    // for (const user of users) {
    //   await sendNotificationToUser(user.id, user.name);
    //   await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    // }
    
    console.log('\n✅ Notification sending completed!');
    console.log('🔔 Check your notification center (bell icon) to see the announcement.');
    console.log('📱 The notification should appear in the dropdown and on /notifications page');
    
  } catch (error) {
    console.error('\n❌ Script failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
main();
