import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request) {
  try {
    const data = await request.json();
    const { recipientId, type, message, title, senderName, data: notificationData } = data;

    if (!recipientId || !type || !message || !title) {
      return NextResponse.json({
        error: 'Missing required fields: recipientId, type, message, title'
      }, { status: 400 });
    }

    // Validate notification type
    const validTypes = ['task', 'team', 'group', 'system'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({
        error: 'Invalid notification type. Must be one of: task, team, group, system'
      }, { status: 400 });
    }

    // Create notification document
    const notificationRef = collection(db, 'notifications');
    const notificationDoc = await addDoc(notificationRef, {
      userId: recipientId,
      title,
      content: message,
      type,
      status: 'unread',
      createdAt: serverTimestamp(),
      data: notificationData || {},
      senderName: senderName || 'System',
      link: notificationData?.link || null
    });

    return NextResponse.json({
      message: 'Notification sent successfully',
      notificationId: notificationDoc.id
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({
      error: 'Failed to send notification'
    }, { status: 500 });
  }
}

// Helper function to send task assignment notification
export async function sendTaskAssignmentNotification(assignedUserId, taskTitle, assignedBy) {
  const notificationData = {
    recipientId: assignedUserId,
    type: 'task',
    title: '🎯 New Task Assignment',
    message: `You've been assigned a new task: "${taskTitle}"`,
    senderName: assignedBy,
    data: {
      taskTitle,
      assignedBy,
      type: 'task_assignment'
    }
  };

  try {
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

// Helper function to send group invitation notification
export async function sendGroupInvitationNotification(invitedUserId, groupName, invitedBy) {
  const notificationData = {
    recipientId: invitedUserId,
    type: 'group',
    title: '🧩 Group Invitation',
    message: `You've been added to the group: "${groupName}"`,
    senderName: invitedBy,
    data: {
      groupName,
      invitedBy,
      type: 'group_invitation'
    }
  };

  try {
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

// Helper function to send team invitation notification
export async function sendTeamInvitationNotification(invitedUserId, teamName, invitedBy) {
  const notificationData = {
    recipientId: invitedUserId,
    type: 'team',
    title: '👥 Team Invitation',
    message: `You've been added to the team: "${teamName}"`,
    senderName: invitedBy,
    data: {
      teamName,
      invitedBy,
      type: 'team_invitation'
    }
  };

  try {
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
