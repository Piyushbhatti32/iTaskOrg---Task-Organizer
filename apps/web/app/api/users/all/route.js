import { NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';

export async function GET(request) {
  try {
    // Check if Firebase Admin is properly initialized
    if (!adminDb) {
      console.error('Firebase Admin SDK not initialized');
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const usersRef = adminDb.collection('users');
    
    // Get all active users
    const snapshot = await usersRef.where('isActive', '!=', false).get();

    const allUsers = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().displayName || doc.data().name || doc.data().email?.split('@')[0] || 'Unknown User',
      email: doc.data().email || ''
    })).filter(user => user.email); // Only return users with valid emails

    return NextResponse.json({
      users: allUsers,
      total: allUsers.length
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
