import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/config/firebase-admin';

// PATCH /api/notifications/[id] - Mark a notification as read
export async function PATCH(request, { params }) {
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

    // Await params for Next.js 15 compatibility
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const data = await request.json();
    const { status } = data;

    if (!id) {
      return NextResponse.json({ 
        error: 'Notification ID is required' 
      }, { status: 400 });
    }

    if (status !== 'read') {
      return NextResponse.json({ 
        error: 'Invalid status' 
      }, { status: 400 });
    }

    // Use admin SDK for Firestore operations
    const notificationRef = adminDb.collection('notifications').doc(id);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return NextResponse.json({ 
        error: 'Notification not found' 
      }, { status: 404 });
    }

    // Verify the user owns this notification
    const notificationData = notificationDoc.data();
    if (notificationData.userId !== decodedToken.uid) {
      return NextResponse.json({ 
        error: 'Unauthorized: Cannot modify other users\' notifications' 
      }, { status: 403 });
    }

    await notificationRef.update({ status });

    return NextResponse.json({
      message: 'Notification marked as read',
      id
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ 
      error: 'Failed to mark notification as read' 
    }, { status: 500 });
  }
}
