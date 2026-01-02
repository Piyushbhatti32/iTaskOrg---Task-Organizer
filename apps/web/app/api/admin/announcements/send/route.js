import { NextResponse } from 'next/server';
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { isAdmin } from '../../../../../utils/roles';

// Verify admin authentication
async function verifyAdminAuth(request) {
  const { getFirebaseAuth } = await import("@/lib/firebase-client");
  const adminAuth = getFirebaseAuth(true);
  try {
    // Check if adminAuth is available
    if (!adminAuth) {
      console.error('Firebase Admin Auth not initialized');
      return null;
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No authorization header or invalid format');
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if user is admin
    const userForRoleCheck = { 
      uid: decodedToken.uid, 
      email: decodedToken.email,
      customClaims: decodedToken 
    };
    
    if (!isAdmin(userForRoleCheck)) {
      console.error('User is not admin:', decodedToken.email);
      return null;
    }

    console.log('Admin auth successful for:', decodedToken.email);
    return decodedToken;
  } catch (error) {
    console.error('Admin auth verification failed:', error);
    return null;
  }
}

// Get all user IDs from the users collection
async function getAllUserIds() {
  const { getFirestoreDb } = await import("@/lib/firebase-client");
  const db = getFirestoreDb();
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Failed to fetch user IDs:', error);
    return [];
  }
}

// Send notification to a user
async function sendNotificationToUser(userId, title, message, type = 'info', link = null) {
  const { getFirestoreDb } = await import("@/lib/firebase-client");
  const db = getFirestoreDb();
  try {
    const notificationData = {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: serverTimestamp(),
      link,
      source: 'announcement'
    };

    await addDoc(collection(db, 'notifications'), notificationData);
    return true;
  } catch (error) {
    console.error(`Failed to send notification to user ${userId}:`, error);
    return false;
  }
}

// POST - Send announcement as notifications
export async function POST(request) {
  const { getFirestoreDb } = await import("@/lib/firebase-client");
  const db = getFirestoreDb();
  const { getFirebaseAuth } = await import("@/lib/firebase-client");
  const adminAuth = getFirebaseAuth(true);
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { announcementId } = data;

    if (!announcementId) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    // Get the announcement
    const announcementRef = doc(db, 'announcements', announcementId);
    const announcementDoc = await getDoc(announcementRef);
    
    if (!announcementDoc.exists()) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    const announcement = announcementDoc.data();
    
    // Check if announcement is already sent
    if (announcement.status === 'sent') {
      return NextResponse.json({ error: 'Announcement has already been sent' }, { status: 400 });
    }

    // Determine target users
    let targetUserIds = [];
    
    if (announcement.targetUsers === 'all') {
      targetUserIds = await getAllUserIds();
    } else if (announcement.targetUsers === 'specific') {
      targetUserIds = announcement.userIds || [];
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json({ error: 'No target users found' }, { status: 400 });
    }

    // Send notifications to all target users
    const results = await Promise.allSettled(
      targetUserIds.map(userId => 
        sendNotificationToUser(
          userId,
          announcement.title,
          announcement.message,
          announcement.type,
          null // Can add a link if needed
        )
      )
    );

    // Count successful sends
    const successCount = results.filter(result => result.status === 'fulfilled' && result.value === true).length;
    const failureCount = results.length - successCount;

    // Update announcement status
    await updateDoc(announcementRef, {
      status: 'sent',
      sentAt: serverTimestamp(),
      sentBy: user.email || user.uid,
      sentCount: successCount,
      targetCount: targetUserIds.length,
      failureCount,
      updatedAt: serverTimestamp()
    });

    return NextResponse.json({
      message: 'Announcement sent successfully',
      stats: {
        totalTargets: targetUserIds.length,
        successful: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Failed to send announcement:', error);
    return NextResponse.json({ error: 'Failed to send announcement' }, { status: 500 });
  }
}
