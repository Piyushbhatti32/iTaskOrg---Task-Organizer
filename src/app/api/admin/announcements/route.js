import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '../../../../config/firebase-admin';
import { isAdmin } from '../../../../utils/roles';

// Verify admin authentication
async function verifyAdminAuth(request) {
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

// GET - List all announcements
export async function GET(request) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!adminDb) {
      console.error('Firebase Admin Firestore not initialized');
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const announcementsRef = adminDb.collection('announcements');
    const snapshot = await announcementsRef.orderBy('createdAt', 'desc').get();
    
    const announcements = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      announcements.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        expiresAt: data.expiresAt?.toDate?.() || null,
        scheduledAt: data.scheduledAt?.toDate?.() || null,
      });
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

// POST - Create new announcement
export async function POST(request) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { title, message, type, targetUsers, userIds, expiresAt, scheduledAt } = data;

    // Validate required fields
    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    if (!['info', 'warning', 'success', 'error'].includes(type)) {
      return NextResponse.json({ error: 'Invalid announcement type' }, { status: 400 });
    }

    if (!['all', 'specific'].includes(targetUsers)) {
      return NextResponse.json({ error: 'Invalid target users value' }, { status: 400 });
    }

    if (targetUsers === 'specific' && (!userIds || userIds.trim() === '')) {
      return NextResponse.json({ error: 'User IDs are required for specific targeting' }, { status: 400 });
    }

    if (!adminDb) {
      console.error('Firebase Admin Firestore not initialized');
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Create announcement document
    const announcementData = {
      title: title.trim(),
      message: message.trim(),
      type,
      targetUsers,
      userIds: targetUsers === 'specific' ? userIds.split(',').map(id => id.trim()).filter(id => id) : [],
      status: 'draft',
      sentCount: 0,
      createdAt: adminDb.FieldValue.serverTimestamp(),
      createdBy: user.email || user.uid,
      createdByName: user.name || user.email || 'Admin',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    };

    const docRef = await adminDb.collection('announcements').add(announcementData);

    // Return the created announcement with the ID
    const createdAnnouncement = {
      id: docRef.id,
      ...announcementData,
      createdAt: new Date(),
      expiresAt: announcementData.expiresAt,
      scheduledAt: announcementData.scheduledAt,
    };

    return NextResponse.json({ 
      announcement: createdAnnouncement,
      message: 'Announcement created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}

// PUT - Update existing announcement
export async function PUT(request) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, title, message, type, targetUsers, userIds, expiresAt, scheduledAt } = data;

    // Validate required fields
    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    if (!['info', 'warning', 'success', 'error'].includes(type)) {
      return NextResponse.json({ error: 'Invalid announcement type' }, { status: 400 });
    }

    if (!['all', 'specific'].includes(targetUsers)) {
      return NextResponse.json({ error: 'Invalid target users value' }, { status: 400 });
    }

    if (targetUsers === 'specific' && (!userIds || userIds.trim() === '')) {
      return NextResponse.json({ error: 'User IDs are required for specific targeting' }, { status: 400 });
    }

    if (!adminDb) {
      console.error('Firebase Admin Firestore not initialized');
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Check if announcement exists
    const announcementRef = adminDb.collection('announcements').doc(id);
    const announcementDoc = await announcementRef.get();
    
    if (!announcementDoc.exists) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // Update announcement document
    const updateData = {
      title: title.trim(),
      message: message.trim(),
      type,
      targetUsers,
      userIds: targetUsers === 'specific' ? userIds.split(',').map(id => id.trim()).filter(id => id) : [],
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      updatedAt: adminDb.FieldValue.serverTimestamp(),
      updatedBy: user.email || user.uid,
    };

    await announcementRef.update(updateData);

    // Return the updated announcement
    const updatedDoc = await announcementRef.get();
    const updatedData = updatedDoc.data();
    const updatedAnnouncement = {
      id: updatedDoc.id,
      ...updatedData,
      createdAt: updatedData.createdAt?.toDate?.() || new Date(),
      updatedAt: new Date(),
      expiresAt: updatedData.expiresAt?.toDate?.() || null,
      scheduledAt: updatedData.scheduledAt?.toDate?.() || null,
    };

    return NextResponse.json({ 
      announcement: updatedAnnouncement,
      message: 'Announcement updated successfully' 
    });
  } catch (error) {
    console.error('Failed to update announcement:', error);
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
  }
}

// DELETE - Delete announcement
export async function DELETE(request) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the announcement ID from the query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    if (!adminDb) {
      console.error('Firebase Admin Firestore not initialized');
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Check if announcement exists
    const announcementRef = adminDb.collection('announcements').doc(id);
    const announcementDoc = await announcementRef.get();
    
    if (!announcementDoc.exists) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // Delete the announcement
    await announcementRef.delete();

    return NextResponse.json({ 
      message: 'Announcement deleted successfully',
      id 
    });
  } catch (error) {
    console.error('Failed to delete announcement:', error);
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}
