import { NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendTaskAssignmentNotification, sendGroupInvitationNotification, sendTeamInvitationNotification } from '@/utils/notifications';

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
    const notificationDoc = await adminDb.collection('notifications').add({
      userId: recipientId,
      title,
      content: message,
      type,
      status: 'unread',
      createdAt: FieldValue.serverTimestamp(),
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


