import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { 
  collection,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';

// POST /api/notifications/mark-all-read - Mark all notifications as read
export async function POST(request) {
  try {
    const data = await request.json();
    const { userId } = data;

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Get all unread notifications for the user
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('status', '==', 'unread')
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({
        message: 'No unread notifications found'
      });
    }

    // Use batch write to update all notifications
    const batch = writeBatch(db);
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