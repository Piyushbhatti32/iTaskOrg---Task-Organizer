import { sendFeatureAnnouncementNotification } from './notifications';

/**
 * Announces the NotificationCenter feature to all users in the system
 * @returns {Promise<{success: boolean, message: string, details?: any}>}
 */
export async function announceNotificationCenterFeature() {
  try {
    console.log('Starting NotificationCenter feature announcement...');
    
    // Fetch all users from the API
    const response = await fetch('/api/users/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
    }

    const userData = await response.json();
    
    if (!userData.users || userData.users.length === 0) {
      return {
        success: false,
        message: 'No users found to send notifications to'
      };
    }

    // Extract user IDs
    const userIds = userData.users.map(user => user.id);
    
    console.log(`Found ${userIds.length} users to notify`);

    // Feature announcement details
    const featureTitle = 'New Feature: Notification Center';
    const description = 'We\'ve added a comprehensive notification system to help you stay updated on task assignments, team activities, and important announcements. Click the bell icon in your navigation bar to access your notifications.';
    const link = '/notifications'; // Link to the full notifications page

    // Send the feature announcement notification
    const result = await sendFeatureAnnouncementNotification(
      userIds,
      featureTitle,
      description,
      link
    );

    console.log('NotificationCenter feature announcement completed successfully');

    return {
      success: true,
      message: `Feature announcement sent to ${userIds.length} users`,
      details: {
        usersNotified: userIds.length,
        featureTitle,
        description
      }
    };

  } catch (error) {
    console.error('Error announcing NotificationCenter feature:', error);
    
    return {
      success: false,
      message: 'Failed to announce NotificationCenter feature',
      details: {
        error: error.message
      }
    };
  }
}

/**
 * Convenience function to manually trigger the announcement
 * This can be called from admin panels or scripts
 */
export async function triggerNotificationCenterAnnouncement() {
  const result = await announceNotificationCenterFeature();
  
  if (result.success) {
    console.log('✅ Success:', result.message);
    if (result.details) {
      console.log('Details:', result.details);
    }
  } else {
    console.error('❌ Failed:', result.message);
    if (result.details) {
      console.error('Error details:', result.details);
    }
  }
  
  return result;
}
