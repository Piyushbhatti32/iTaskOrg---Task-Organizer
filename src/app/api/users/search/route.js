import { NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || '';
    const name = searchParams.get('name') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeProfilePhoto = searchParams.get('includePhoto') === 'true';

    if (!email && !name) {
      return NextResponse.json({
        error: 'Email or name parameter is required'
      }, { status: 400 });
    }

    const usersRef = adminDb.collection('users');
    let allUsers = [];

    // Get all users to filter client-side (Firestore limitation)
    const snapshot = await usersRef.limit(200).get();

    // Process search based on email or name
    const searchTerm = email || name;
    const lowerSearchTerm = searchTerm.toLowerCase();

    allUsers = snapshot.docs
      .map(doc => {
        const userData = doc.data();
        return {
          id: doc.id,
          name: userData.displayName || userData.name || userData.email?.split('@')[0] || 'Unknown User',
          email: userData.email || '',
          photoURL: includeProfilePhoto ? (userData.photoURL || userData.avatar || null) : null,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          isActive: userData.isActive !== false // Default to true if not specified
        };
      })
      .filter(user => {
        // Filter by valid email first
        if (!user.email) return false;

        // If searching by email, prioritize exact email matches
        if (email) {
          return user.email.toLowerCase().includes(lowerSearchTerm);
        }

        // If searching by name, look in both name and email
        if (name) {
          const nameMatch = user.name.toLowerCase().includes(lowerSearchTerm);
          const emailMatch = user.email.toLowerCase().includes(lowerSearchTerm);
          return nameMatch || emailMatch;
        }

        return false;
      })
      .filter(user => user.isActive) // Only return active users
      .slice(0, limit);

    // Sort results by relevance
    allUsers.sort((a, b) => {
      // Prioritize exact email matches
      if (email) {
        const aExactMatch = a.email.toLowerCase() === lowerSearchTerm;
        const bExactMatch = b.email.toLowerCase() === lowerSearchTerm;

        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;

        // Then by email starts with
        const aStartsWith = a.email.toLowerCase().startsWith(lowerSearchTerm);
        const bStartsWith = b.email.toLowerCase().startsWith(lowerSearchTerm);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
      }

      // Finally by name alphabetically
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      users: allUsers,
      total: allUsers.length,
      searchTerm: searchTerm
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}
