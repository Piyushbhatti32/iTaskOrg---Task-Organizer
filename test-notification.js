// Simple test notification script

async function testNotification() {
  try {
    // Use Node's built-in fetch (Node 18+) or import node-fetch
    const fetch = globalThis.fetch || (await import('node-fetch')).default;
    
    console.log('🔔 Testing notification system...\n');
    
    // Test with your actual user ID - replace with your Firebase user ID
    // You can find this in your browser's dev tools > Application > localStorage > firebase:authUser
    const userId = process.argv[2] || 'your-user-id-here';
    
    const notificationData = {
      recipientId: userId,
      type: 'system',
      title: '🎉 Welcome to the new Notification Center!',
      message: 'Great news! We\'ve just launched our comprehensive notification center. You can now track task assignments, team updates, system alerts, and more - all in one convenient place. Click the bell icon in your navigation bar to explore this exciting new feature!',
      senderName: 'iTaskOrg Team',
      data: {
        featureTitle: 'New Notification Center',
        description: 'Comprehensive notification system for tasks, teams, and announcements',
        type: 'feature_announcement',
        subtype: 'notification_center_launch',
        link: '/notifications',
        priority: 'high',
        category: 'product_update',
        isWelcome: true
      }
    };

    console.log('📡 Sending notification...');
    console.log('User ID:', userId);
    console.log('Title:', notificationData.title);
    
    // Try to send the notification
    try {
      const response = await fetch('http://localhost:3000/api/notifications/send', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('\n✅ SUCCESS! Notification sent successfully!');
        console.log('📝 Response:', JSON.stringify(result, null, 2));
        console.log('\n🔔 The notification should now appear in your notification center.');
        console.log('   - Check the bell icon in your navigation bar');
        console.log('   - Or visit /notifications page directly');
      } else {
        const errorText = await response.text();
        console.log(`\n❌ Failed to send notification (${response.status}):`);
        console.log(errorText);
        
        if (response.status === 500) {
          console.log('\n💡 This might mean:');
          console.log('   - The Next.js app is not running (try: npm run dev)');
          console.log('   - Database connection issue');
          console.log('   - API endpoint not working properly');
        }
      }
    } catch (fetchError) {
      console.log('\n❌ Connection Error:', fetchError.message);
      console.log('\n💡 Possible solutions:');
      console.log('   - Make sure your Next.js app is running: npm run dev');
      console.log('   - Check if the app is running on http://localhost:3000');
      console.log('   - Verify your API endpoints are working');
    }

  } catch (error) {
    console.error('\n❌ Script Error:', error.message);
  }
}

// Run the test
testNotification();
