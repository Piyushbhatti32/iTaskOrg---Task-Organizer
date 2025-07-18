import { NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    const usersRef = adminDb.collection('users');
    let allUsers = [];

    if (searchQuery.trim()) {
      // Get all users first, then filter client-side for better search experience
      // This is necessary because Firestore doesn't support full-text search
      const snapshot = await usersRef.limit(100).get();
      const lowerQuery = searchQuery.toLowerCase();
      
      allUsers = snapshot.docs
        .map(doc => {
          const userData = doc.data();
          return {
            id: doc.id,
            name: userData.displayName || userData.name || userData.email?.split('@')[0] || 'Unknown User',
            email: userData.email || '',
            photoURL: userData.photoURL || userData.avatar || null,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt
          };
        })
        .filter(user => {
          // Filter by name, email, or partial matches
          const nameMatch = user.name.toLowerCase().includes(lowerQuery);
          const emailMatch = user.email.toLowerCase().includes(lowerQuery);
          return nameMatch || emailMatch;
        })
        .slice(0, limit);
    } else {
      // If no search query, return recent users
      try {
        const recentSnapshot = await usersRef
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get();
        
        allUsers = recentSnapshot.docs.map(doc => {
          const userData = doc.data();
          return {
            id: doc.id,
            name: userData.displayName || userData.name || userData.email?.split('@')[0] || 'Unknown User',
            email: userData.email || '',
            photoURL: userData.photoURL || userData.avatar || null,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt
          };
        });
      } catch (orderError) {
        // If ordering by createdAt fails, try without ordering
        console.warn('Fallback: Getting users without ordering:', orderError);
        const fallbackSnapshot = await usersRef.limit(limit).get();
        
        allUsers = fallbackSnapshot.docs.map(doc => {
          const userData = doc.data();
          return {
            id: doc.id,
            name: userData.displayName || userData.name || userData.email?.split('@')[0] || 'Unknown User',
            email: userData.email || '',
            photoURL: userData.photoURL || userData.avatar || null,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt
          };
        });
      }
    }

    // Sort results by name, handling empty names
    allUsers.sort((a, b) => {
      const nameA = a.name || a.email || '';
      const nameB = b.name || b.email || '';
      return nameA.localeCompare(nameB);
    });

    // Filter out users without email (invalid users)
    const validUsers = allUsers.filter(user => user.email);

    return NextResponse.json({
      users: validUsers,
      total: validUsers.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
