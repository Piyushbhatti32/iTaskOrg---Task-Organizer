import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/config/firebase-admin';

// POST /api/notifications/mark-all-read - Mark all notifications as read
export async function POST(request) {
  try {
    // Check if admin SDK is available
    if (!adminDb || !adminAuth) {
      console.error('Firebase Admin SDK not properly initialized');
      return NextResponse.json({ 
        error: 'Server configuration error' 
      }, { status: 503 });
    }

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (authError) {
      console.error('Auth verification failed:', authError);
      return NextResponse.json({ 
        error: 'Invalid authentication token' 
      }, { status: 401 });
    }

    const data = await request.json();
    const { userId } = data;

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Verify the user is marking their own notifications
    if (userId !== decodedToken.uid) {
      return NextResponse.json({ 
        error: 'Unauthorized: Cannot mark other users\' notifications as read' 
      }, { status: 403 });
    }

    // Get all unread notifications for the user using admin SDK
    const notificationsRef = adminDb.collection('notifications');
    const querySnapshot = await notificationsRef
      .where('userId', '==', userId)
      .where('status', '==', 'unread')
      .get();

    if (querySnapshot.empty) {
      return NextResponse.json({
        message: 'No unread notifications found'
      });
    }

    // Use batch write to update all notifications
    const batch = adminDb.batch();
    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { status: 'read' });
    });

    await batch.commit();

    return NextResponse.json({
      message: 'All notifications marked as read',
      count: querySnapshot.size
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json({ 
      error: 'Failed to mark all notifications as read' 
    }, { status: 500 });
  }
}
