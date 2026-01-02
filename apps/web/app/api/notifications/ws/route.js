import { NextResponse } from 'next/server';
import { adminDb } from '../../../../config/firebase-admin';

// Get notifications for a user
export async function GET(request) {
  try {
    // Check if Firebase Admin is properly initialized
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized - check your Firebase configuration');
      return new Response('Firebase service unavailable - check server configuration', { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    
    if (!userId) {
      return new Response('User ID is required', { status: 400 });
    }

    // Get user's notifications from Firestore
    let notificationsQuery = adminDb.collection('notifications')
      .where('userId', '==', userId);
    
    // Only add status filter if status parameter is provided
    if (status) {
      notificationsQuery = notificationsQuery.where('status', '==', status);
    }
    
    notificationsQuery = notificationsQuery.limit(50);
    
    const snapshot = await notificationsQuery.get();
    const notifications = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Sort by createdAt in descending order (newest first)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

    return NextResponse.json({ notifications });
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
      userId,
      type,
      title,
      message: message || '',
      data: data || {},
      status: 'unread',
      createdAt: new Date()
    };

    // Store notification in Firestore
    const docRef = await adminDb.collection('notifications').add(notification);

    return NextResponse.json({ 
      success: true, 
      notification: { id: docRef.id, ...notification }
    });
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

    // Update notification in Firestore
    const notificationRef = adminDb.collection('notifications').doc(notificationId);
    const notificationDoc = await notificationRef.get();
    
    if (!notificationDoc.exists) {
      return new Response('Notification not found', { status: 404 });
    }
    
    // Verify notification belongs to the user
    if (notificationDoc.data().userId !== userId) {
      return new Response('Unauthorized', { status: 403 });
    }

    await notificationRef.update({ 
      status, 
      updatedAt: new Date() 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return new Response('Failed to update notification', { status: 500 });
  }
}
