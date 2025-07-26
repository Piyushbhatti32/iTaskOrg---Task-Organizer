// Simple script to send notification center feature announcement
// This directly uses the notification sending functions

import fetch from 'node-fetch';

// Make fetch available globally for the notification functions
globalThis.fetch = fetch;

// Simple implementation to send announcement notification
async function sendAnnouncementNotification() {
  try {
    console.log('🔔 Sending Notification Center feature announcement...\n');

    // Sample user IDs - you can replace with actual user IDs from your system
    // For testing, we'll create a notification for a sample user
    const sampleUserIds = [
      'user123',  // Replace with actual user IDs
      'user456',
      'user789'
    ];

    const notifications = [];

    for (const userId of sampleUserIds) {
      const notificationData = {
        recipientId: userId,
        type: 'system',
        title: '🔔 Introducing NotificationCenter!',
        message: 'New NotificationCenter: Stay on top of everything! Our new comprehensive notification center helps you manage task assignments, team updates, system alerts, and more - all in one convenient place with real-time updates and actionable notifications.',
        senderName: 'iTaskOrg Team',
        data: {
          featureTitle: 'New NotificationCenter',
          description: 'Stay on top of everything! Our new comprehensive notification center helps you manage task assignments, team updates, system alerts, and more - all in one convenient place with real-time updates and actionable notifications.',
          type: 'feature_announcement',
          subtype: 'notification_center',
          link: '/notifications',
          priority: 'high',
          category: 'product_update'
        }
      };

      try {
        const response = await fetch('http://localhost:3000/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notificationData)
        });

        if (response.ok) {
          const result = await response.json();
          notifications.push({ userId, success: true, result });
          console.log(`✅ Sent notification to user: ${userId}`);
        } else {
          const error = await response.text();
          notifications.push({ userId, success: false, error });
          console.log(`❌ Failed to send to user ${userId}: ${error}`);
        }
      } catch (error) {
        notifications.push({ userId, success: false, error: error.message });
        console.log(`❌ Error sending to user ${userId}: ${error.message}`);
      }
    }

    const successful = notifications.filter(n => n.success).length;
    const failed = notifications.filter(n => !n.success).length;

    console.log(`\n📊 Summary:`);
    console.log(`   - Successfully sent: ${successful}`);
    console.log(`   - Failed: ${failed}`);
    console.log(`   - Total: ${notifications.length}`);

    if (successful > 0) {
      console.log('\n✅ Notification Center feature announcement sent successfully!');
      console.log('Users should now see the announcement in their notification center.');
    }

  } catch (error) {
    console.error('\n❌ Error sending announcement:', error.message);
  }
}

// Alternative: If you want to test with a specific user ID, uncomment and modify this:
async function sendToSpecificUser(userId) {
  try {
    console.log(`🔔 Sending notification to user: ${userId}\n`);

    const notificationData = {
      recipientId: userId,
      type: 'system', 
      title: '🔔 Welcome to the new Notification Center!',
      message: 'We\'ve just introduced a comprehensive notification system to help you stay updated on task assignments, team activities, and important announcements. Click the bell icon in your navigation bar to explore this new feature!',
      senderName: 'iTaskOrg Team',
      data: {
        featureTitle: 'New Notification Center',
        description: 'Comprehensive notification system for tasks, teams, and announcements',
        type: 'feature_announcement',
        subtype: 'notification_center',
        link: '/notifications',
        priority: 'high',
        category: 'product_update'
      }
    };

    const response = await fetch('http://localhost:3000/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Notification sent successfully!');
      console.log('Result:', JSON.stringify(result, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Failed to send notification:', error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Check if a specific user ID was provided as command line argument
const userIdArg = process.argv[2];

if (userIdArg) {
  console.log(`Using specific user ID: ${userIdArg}`);
  sendToSpecificUser(userIdArg);
} else {
  console.log('Sending to sample users. To send to a specific user, run: node send-notification-announcement.js <userId>');
  sendAnnouncementNotification();
}
