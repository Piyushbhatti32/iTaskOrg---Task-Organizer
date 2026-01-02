// Push notification utility functions
import { sendCustomNotification } from './notifications';

/**
 * Request notification permission from the user
 * @returns {Promise<string>} Permission status ('granted', 'denied', or 'default')
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  // Request permission
  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Show a browser push notification
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 * @returns {Notification} Notification instance
 */
export function showPushNotification(title, options = {}) {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }

  const defaultOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'itaskorg-notification',
    requireInteraction: false,
    silent: false,
    ...options
  };

  try {
    const notification = new Notification(title, defaultOptions);
    
    // Auto-close notification after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  } catch (error) {
    console.error('Error showing push notification:', error);
    return null;
  }
}

/**
 * Send a task assignment push notification
 * @param {string} taskTitle - Title of the task
 * @param {string} assignedBy - Name of the person who assigned the task
 * @param {string} taskId - Task ID for navigation
 */
export function sendTaskAssignmentPushNotification(taskTitle, assignedBy, taskId = null) {
  const title = '🎯 New Task Assignment';
  const body = `You've been assigned: "${taskTitle}" by ${assignedBy}`;
  
  const notification = showPushNotification(title, {
    body,
    icon: '/favicon.ico',
    tag: `task-${taskId}`,
    data: {
      type: 'task_assignment',
      taskId,
      taskTitle,
      assignedBy
    }
  });

  if (notification) {
    notification.onclick = function() {
      window.focus();
      if (taskId) {
        window.location.href = `/tasks/${taskId}`;
      } else {
        window.location.href = '/tasks';
      }
      notification.close();
    };
  }

  return notification;
}

/**
 * Send a group invitation push notification
 * @param {string} groupName - Name of the group
 * @param {string} invitedBy - Name of the person who sent the invitation
 * @param {string} groupId - Group ID for navigation
 */
export function sendGroupInvitationPushNotification(groupName, invitedBy, groupId = null) {
  const title = '🧩 Group Invitation';
  const body = `You've been added to "${groupName}" by ${invitedBy}`;
  
  const notification = showPushNotification(title, {
    body,
    icon: '/favicon.ico',
    tag: `group-${groupId}`,
    data: {
      type: 'group_invitation',
      groupId,
      groupName,
      invitedBy
    }
  });

  if (notification) {
    notification.onclick = function() {
      window.focus();
      if (groupId) {
        window.location.href = `/groups/${groupId}`;
      } else {
        window.location.href = '/groups';
      }
      notification.close();
    };
  }

  return notification;
}

/**
 * Send a team invitation push notification
 * @param {string} teamName - Name of the team
 * @param {string} invitedBy - Name of the person who sent the invitation
 * @param {string} teamId - Team ID for navigation
 */
export function sendTeamInvitationPushNotification(teamName, invitedBy, teamId = null) {
  const title = '👥 Team Invitation';
  const body = `You've been added to "${teamName}" by ${invitedBy}`;
  
  const notification = showPushNotification(title, {
    body,
    icon: '/favicon.ico',
    tag: `team-${teamId}`,
    data: {
      type: 'team_invitation',
      teamId,
      teamName,
      invitedBy
    }
  });

  if (notification) {
    notification.onclick = function() {
      window.focus();
      if (teamId) {
        window.location.href = `/team/${teamId}`;
      } else {
        window.location.href = '/team';
      }
      notification.close();
    };
  }

  return notification;
}

/**
 * Send a task completion push notification
 * @param {string} taskTitle - Title of the completed task
 * @param {string} taskId - Task ID for navigation
 */
export function sendTaskCompletionPushNotification(taskTitle, taskId = null) {
  const title = '✅ Task Completed!';
  const body = `Great job! You completed: "${taskTitle}"`;
  
  const notification = showPushNotification(title, {
    body,
    icon: '/favicon.ico',
    tag: `task-complete-${taskId}`,
    data: {
      type: 'task_completion',
      taskId,
      taskTitle
    }
  });

  if (notification) {
    notification.onclick = function() {
      window.focus();
      window.location.href = '/completed';
      notification.close();
    };
  }

  return notification;
}

/**
 * Send a custom push notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} options - Additional options
 */
export function sendCustomPushNotification(title, body, options = {}) {
  const notification = showPushNotification(title, {
    body,
    ...options
  });

  if (notification && options.onClick) {
    notification.onclick = function() {
      window.focus();
      options.onClick();
      notification.close();
    };
  }

  return notification;
}

/**
 * Check if push notifications are supported and enabled
 * @returns {boolean}
 */
export function isPushNotificationSupported() {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Get current notification permission status
 * @returns {string}
 */
export function getNotificationPermission() {
  if (!('Notification' in window)) {
    return 'not-supported';
  }
  return Notification.permission;
}

/**
 * Initialize push notifications for the app
 * This should be called once when the app loads
 */
export async function initializePushNotifications() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support push notifications');
    return false;
  }

  // Check if permission is already granted
  if (Notification.permission === 'granted') {
    console.log('Push notifications are enabled');
    return true;
  }

  // Don't auto-request permission, let user enable it in settings
  if (Notification.permission === 'default') {
    console.log('Push notification permission not requested yet');
    return false;
  }

  // Permission denied
  if (Notification.permission === 'denied') {
    console.log('Push notification permission denied');
    return false;
  }

  return false;
}
