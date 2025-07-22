import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// PATCH /api/notifications/[id] - Mark a notification as read
export async function PATCH(request, { params }) {
  try {
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

    const notificationRef = doc(db, 'notifications', id);
    const notificationDoc = await getDoc(notificationRef);

    if (!notificationDoc.exists()) {
      return NextResponse.json({ 
        error: 'Notification not found' 
      }, { status: 404 });
    }

    await updateDoc(notificationRef, { status });

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