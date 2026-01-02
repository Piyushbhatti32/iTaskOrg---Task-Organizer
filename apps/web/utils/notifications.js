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
 * Send a task completion notification
 * @param {string} userId - The ID of the user who completed the task
 * @param {string} taskTitle - The title of the completed task
 * @param {string} taskId - Optional task ID for linking
 */
export async function sendTaskCompletionNotification(userId, taskTitle, taskId = null) {
  try {
    const notificationData = {
      recipientId: userId,
      type: 'task',
      title: '✅ Task Completed!',
      message: `Great job! You've completed: "${taskTitle}"`,
      senderName: 'System',
      data: {
        taskTitle,
        taskId,
        type: 'task_completion',
        link: '/completed'
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
    console.error('Error sending task completion notification:', error);
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
 * Placeholder function to simulate sending an email notification.
 * You should integrate with an actual email service in production.
 * @param {string} recipientEmail - Recipient's email
 * @param {string} subject - Email subject
 * @param {string} message - Email message
 */
export async function sendEmailNotification(recipientEmail, subject, message) {
  try {
    console.log(`Sending email to: ${recipientEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    // Simulate async operation
    return new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Error sending email notification:', error);
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
 * Send task assignment request notification (team leader assigns task to member)
 * @param {string} assignedUserId - The ID of the user being assigned the task
 * @param {string} taskTitle - The title of the task being assigned
 * @param {string} assignedBy - The name of the user who assigned the task
 * @param {string} taskId - Task ID for linking
 * @param {string} requestId - Unique request ID for approval/rejection
 */
export async function sendTaskAssignmentRequestNotification(assignedUserId, taskTitle, assignedBy, taskId, requestId) {
  try {
    const notificationData = {
      recipientId: assignedUserId,
      type: 'task',
      title: '🎯 Task Assignment Request',
      message: `${assignedBy} has assigned you a task: "${taskTitle}". Please accept or decline this assignment.`,
      senderName: assignedBy,
      data: {
        taskTitle,
        assignedBy,
        taskId,
        requestId,
        type: 'task_assignment_request',
        link: `/tasks/assignment-request/${requestId}`,
        requiresAction: true,
        actions: [
          { type: 'accept', label: 'Accept Task' },
          { type: 'decline', label: 'Decline Task' }
        ]
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
    console.error('Error sending task assignment request notification:', error);
    throw error;
  }
}

/**
 * Send task viewing permission request notification (member requests to view leader's tasks)
 * @param {string} leaderId - The ID of the team leader
 * @param {string} memberName - The name of the team member requesting permission
 * @param {string} memberId - The ID of the requesting member
 * @param {string} teamId - The team ID
 * @param {string} requestId - Unique request ID for approval/rejection
 */
export async function sendTaskViewingRequestNotification(leaderId, memberName, memberId, teamId, requestId) {
  try {
    const notificationData = {
      recipientId: leaderId,
      type: 'team',
      title: '👁️ Task Viewing Permission Request',
      message: `${memberName} is requesting permission to view your tasks. Grant access to allow them to see your task list.`,
      senderName: memberName,
      data: {
        memberName,
        memberId,
        teamId,
        requestId,
        type: 'task_viewing_request',
        link: `/team/permission-request/${requestId}`,
        requiresAction: true,
        actions: [
          { type: 'grant', label: 'Grant Access' },
          { type: 'deny', label: 'Deny Access' }
        ]
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
    console.error('Error sending task viewing request notification:', error);
    throw error;
  }
}

/**
 * Send help desk ticket status notification
 * @param {string} userId - The ID of the ticket creator
 * @param {string} ticketId - The ticket ID
 * @param {string} status - The new status (in_progress, resolved, closed)
 * @param {string} adminName - The name of the admin updating the ticket
 */
export async function sendHelpDeskStatusNotification(userId, ticketId, status, adminName) {
  const statusEmojis = {
    in_progress: '🔄',
    resolved: '✅',
    closed: '🔒'
  };

  const statusMessages = {
    in_progress: 'is now being worked on',
    resolved: 'has been resolved',
    closed: 'has been closed'
  };

  try {
    const notificationData = {
      recipientId: userId,
      type: 'system',
      title: `${statusEmojis[status]} Help Desk Ticket Update`,
      message: `Your support ticket #${ticketId} ${statusMessages[status]} by ${adminName}.`,
      senderName: adminName,
      data: {
        ticketId,
        status,
        adminName,
        type: 'help_desk_status',
        link: `/help-desk/ticket/${ticketId}`
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
    console.error('Error sending help desk status notification:', error);
    throw error;
  }
}

/**
 * Send task deletion notification
 * @param {string} userId - The ID of the task owner
 * @param {string} taskTitle - The title of the deleted task
 * @param {string} reason - Reason for deletion (optional)
 */
export async function sendTaskDeletionNotification(userId, taskTitle, reason = null) {
  try {
    const notificationData = {
      recipientId: userId,
      type: 'task',
      title: '🗑️ Task Deleted',
      message: `Your task "${taskTitle}" has been deleted${reason ? `. Reason: ${reason}` : '.'}`,
      senderName: 'System',
      data: {
        taskTitle,
        reason,
        type: 'task_deletion',
        link: '/tasks'
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
    console.error('Error sending task deletion notification:', error);
    throw error;
  }
}

/**
 * Send feature announcement notification
 * @param {Array} userIds - Array of user IDs to notify
 * @param {string} featureTitle - The title of the new feature
 * @param {string} description - Description of the feature
 * @param {string} link - Optional link to feature documentation
 */
export async function sendFeatureAnnouncementNotification(userIds, featureTitle, description, link = null) {
  try {
    const promises = userIds.map(async userId => {
      const notificationData = {
        recipientId: userId,
        type: 'system',
        title: '🚀 New Feature Available!',
        message: `${featureTitle}: ${description}`,
        senderName: 'iTaskOrg Team',
        data: {
          featureTitle,
          description,
          type: 'feature_announcement',
          link: link || '/settings'
        }
      };

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
        throw new Error(`Failed to send notification to user ${userId}: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    });

    const results = await Promise.allSettled(promises);
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    // Log failed notifications for debugging
    if (failed > 0) {
      const failedResults = results.filter(result => result.status === 'rejected');
      console.error('Failed to send some feature announcement notifications:', failedResults.map(r => r.reason));
    }

    console.log(`Feature announcement sent: ${successful} successful, ${failed} failed out of ${userIds.length} total`);

    return {
      successful,
      failed,
      total: userIds.length
    };
  } catch (error) {
    console.error('Error sending feature announcement notifications:', error);
    throw error;
  }
}

/**
 * Send task assignment response notification (member accepts/declines task)
 * @param {string} leaderId - The ID of the team leader who assigned the task
 * @param {string} memberName - The name of the member responding
 * @param {string} taskTitle - The title of the task
 * @param {string} response - 'accepted' or 'declined'
 * @param {string} reason - Reason for declining (optional)
 * @param {string} taskId - Task ID for linking
 */
export async function sendTaskAssignmentResponseNotification(leaderId, memberName, taskTitle, response, reason = null, taskId = null) {
  const responseEmojis = {
    accepted: '✅',
    declined: '❌'
  };

  try {
    const notificationData = {
      recipientId: leaderId,
      type: 'task',
      title: `${responseEmojis[response]} Task Assignment ${response === 'accepted' ? 'Accepted' : 'Declined'}`,
      message: `${memberName} has ${response} the task assignment: "${taskTitle}"${reason ? `. Reason: ${reason}` : '.'}`,
      senderName: memberName,
      data: {
        memberName,
        taskTitle,
        response,
        reason,
        taskId,
        type: 'task_assignment_response',
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
    console.error('Error sending task assignment response notification:', error);
    throw error;
  }
}

/**
 * Send NotificationCenter feature announcement to all users
 * @param {Array} userIds - Array of user IDs to notify
 */
export async function sendNotificationCenterAnnouncementNotification(userIds) {
  const featureTitle = "New NotificationCenter";
  const description = "Stay on top of everything! Our new comprehensive notification center helps you manage task assignments, team updates, system alerts, and more - all in one convenient place with real-time updates and actionable notifications.";
  const link = "/notifications";

  try {
    const promises = userIds.map(userId => {
      const notificationData = {
        recipientId: userId,
        type: 'system',
        title: '🔔 Introducing NotificationCenter!',
        message: `${featureTitle}: ${description}`,
        senderName: 'iTaskOrg Team',
        data: {
          featureTitle,
          description,
          type: 'feature_announcement',
          subtype: 'notification_center',
          link,
          priority: 'high',
          category: 'product_update'
        }
      };

      return fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      });
    });

    const results = await Promise.allSettled(promises);
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    console.log(`NotificationCenter announcement sent to ${successful}/${userIds.length} users`);
    
    return {
      successful,
      failed,
      total: userIds.length,
      feature: 'NotificationCenter'
    };
  } catch (error) {
    console.error('Error sending NotificationCenter announcement notifications:', error);
    throw error;
  }
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
