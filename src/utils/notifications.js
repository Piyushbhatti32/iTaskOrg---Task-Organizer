// Notification utility functions for easy integration

/**
 * Send a task assignment notification
 * @param {string} assignedUserId - The ID of the user being assigned the task
 * @param {string} taskTitle - The title of the task being assigned
 * @param {string} assignedBy - The name of the user who assigned the task
 * @param {string} taskId - Optional task ID for linking
 */
export async function sendTaskAssignmentNotification(assignedUserId, taskTitle, assignedBy, taskId = null) {
  try {
    const notificationData = {
      recipientId: assignedUserId,
      type: 'task',
      title: '🎯 New Task Assignment',
      message: `You've been assigned a new task: "${taskTitle}"`,
      senderName: assignedBy,
      data: {
        taskTitle,
        assignedBy,
        taskId,
        type: 'task_assignment',
        link: taskId ? `/tasks/${taskId}` : '/tasks'
      }
    };

    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData)
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending task assignment notification:', error);
    throw error;
  }
}

/**
 * Send a group invitation notification
 * @param {string} invitedUserId - The ID of the user being invited
 * @param {string} groupName - The name of the group
 * @param {string} invitedBy - The name of the user who sent the invitation
 * @param {string} groupId - Optional group ID for linking
 */
export async function sendGroupInvitationNotification(invitedUserId, groupName, invitedBy, groupId = null) {
  try {
    const notificationData = {
      recipientId: invitedUserId,
      type: 'group',
      title: '🧩 Group Invitation',
      message: `You've been added to the group: "${groupName}"`,
      senderName: invitedBy,
      data: {
        groupName,
        invitedBy,
        groupId,
        type: 'group_invitation',
        link: groupId ? `/groups/${groupId}` : '/groups'
      }
    };

    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData)
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending group invitation notification:', error);
    throw error;
  }
}

/**
 * Send a team invitation notification
 * @param {string} invitedUserId - The ID of the user being invited
 * @param {string} teamName - The name of the team
 * @param {string} invitedBy - The name of the user who sent the invitation
 * @param {string} teamId - Optional team ID for linking
 */
export async function sendTeamInvitationNotification(invitedUserId, teamName, invitedBy, teamId = null) {
  try {
    const notificationData = {
      recipientId: invitedUserId,
      type: 'team',
      title: '👥 Team Invitation',
      message: `You've been added to the team: "${teamName}"`,
      senderName: invitedBy,
      data: {
        teamName,
        invitedBy,
        teamId,
        type: 'team_invitation',
        link: teamId ? `/team/${teamId}` : '/team'
      }
    };

    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData)
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending team invitation notification:', error);
    throw error;
  }
}

/**
 * Send a custom notification
 * @param {string} recipientId - The ID of the user receiving the notification
 * @param {string} type - The type of notification (task, team, group, system)
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} senderName - The name of the sender (optional)
 * @param {object} data - Additional data for the notification (optional)
 */
export async function sendCustomNotification(recipientId, type, title, message, senderName = 'System', data = {}) {
  try {
    const notificationData = {
      recipientId,
      type,
      title,
      message,
      senderName,
      data
    };

    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData)
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending custom notification:', error);
    throw error;
  }
}

/**
 * Send bulk notifications to multiple users
 * @param {Array} recipients - Array of user IDs
 * @param {string} type - The type of notification
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} senderName - The name of the sender
 * @param {object} data - Additional data for the notification
 */
export async function sendBulkNotifications(recipients, type, title, message, senderName = 'System', data = {}) {
  try {
    const promises = recipients.map(recipientId => 
      sendCustomNotification(recipientId, type, title, message, senderName, data)
    );

    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    return {
      successful,
      failed,
      total: recipients.length,
      results
    };
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    throw error;
  }
}

/**
 * Format notification message with user-friendly emojis and formatting
 * @param {string} type - The notification type
 * @param {string} action - The action being performed
 * @param {string} resource - The resource being acted upon
 * @param {string} actor - The user performing the action
 */
export function formatNotificationMessage(type, action, resource, actor) {
  const typeEmojis = {
    task: '🎯',
    team: '👥',
    group: '🧩',
    system: '⚙️'
  };

  const actionTemplates = {
    assigned: `${typeEmojis[type]} You've been assigned: "${resource}"`,
    invited: `${typeEmojis[type]} You've been invited to: "${resource}"`,
    added: `${typeEmojis[type]} You've been added to: "${resource}"`,
    removed: `${typeEmojis[type]} You've been removed from: "${resource}"`,
    completed: `${typeEmojis[type]} "${resource}" has been completed`,
    updated: `${typeEmojis[type]} "${resource}" has been updated`,
    deleted: `${typeEmojis[type]} "${resource}" has been deleted`
  };

  return actionTemplates[action] || `${typeEmojis[type]} ${action}: "${resource}"`;
}

/**
 * Get notification link based on type and resource ID
 * @param {string} type - The notification type
 * @param {string} resourceId - The ID of the resource
 */
export function getNotificationLink(type, resourceId) {
  const linkTemplates = {
    task: `/tasks/${resourceId}`,
    team: `/team/${resourceId}`,
    group: `/groups/${resourceId}`,
    system: '/settings'
  };

  return linkTemplates[type] || '/';
}
