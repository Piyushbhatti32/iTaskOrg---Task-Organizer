// Test script to announce the NotificationCenter feature
// Run this script to send the feature announcement notification to all users

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function announceNotificationCenter() {
  try {
    console.log('🔔 Announcing NotificationCenter feature...\n');
    
    // You'll need to get an auth token first
    // For testing, you can get this from your browser's developer tools
    // when logged into your app (check Network tab for Authorization headers)
    const authToken = process.env.TEST_AUTH_TOKEN || 'YOUR_AUTH_TOKEN_HERE';
    
    if (authToken === 'YOUR_AUTH_TOKEN_HERE') {
      console.error('❌ Please set a valid auth token in the script or TEST_AUTH_TOKEN env variable');
      console.log('\nTo get your auth token:');
      console.log('1. Open your app in the browser and log in');
      console.log('2. Open Developer Tools (F12)');
      console.log('3. Go to Network tab');
      console.log('4. Look for any API request and copy the Authorization header value (after "Bearer ")');
      return;
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/announce/notification-center`;
    
    console.log(`📡 Sending POST request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('\n✅ Success!', result.message);
      if (result.details) {
        console.log('\n📊 Details:');
        console.log(`   - Users notified: ${result.details.usersNotified}`);
        console.log(`   - Feature: ${result.details.featureTitle}`);
        console.log(`   - Description: ${result.details.description}`);
      }
    } else {
      console.error('\n❌ Failed:', result.message || result.error);
      if (result.details) {
        console.error('Error details:', result.details);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error announcing NotificationCenter feature:', error.message);
  }
}

// Run the announcement
announceNotificationCenter();
