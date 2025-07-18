import { NextResponse } from 'next/server';

// Simple REST API for notifications
// In production, consider using Socket.IO or similar for real-time features

// Mock notifications store (in production, use a real database)
const notificationsStore = new Map();

// Get notifications for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') || 'unread';
    
    if (!userId) {
      return new Response('User ID is required', { status: 400 });
    }

    // Get user's notifications
    const userNotifications = notificationsStore.get(userId) || [];
    const filteredNotifications = userNotifications.filter(n => n.status === status);

    return NextResponse.json({ notifications: filteredNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return new Response('Failed to fetch notifications', { status: 500 });
  }
}

// Create a new notification
export async function POST(request) {
  try {
    const { userId, type, title, message, data } = await request.json();
    
    if (!userId || !type || !title) {
      return new Response('Missing required fields', { status: 400 });
    }

    const notification = {
      id: Date.now().toString(),
      userId,
      type,
      title,
      message: message || '',
      data: data || {},
      status: 'unread',
      createdAt: new Date().toISOString()
    };

    // Store notification
    if (!notificationsStore.has(userId)) {
      notificationsStore.set(userId, []);
    }
    notificationsStore.get(userId).push(notification);

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return new Response('Failed to create notification', { status: 500 });
  }
}

// Update notification status
export async function PUT(request) {
  try {
    const { notificationId, userId, status } = await request.json();
    
    if (!notificationId || !userId || !status) {
      return new Response('Missing required fields', { status: 400 });
    }

    const userNotifications = notificationsStore.get(userId) || [];
    const notificationIndex = userNotifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex === -1) {
      return new Response('Notification not found', { status: 404 });
    }

    userNotifications[notificationIndex].status = status;
    notificationsStore.set(userId, userNotifications);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return new Response('Failed to update notification', { status: 500 });
  }
}
