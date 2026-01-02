import { NextResponse } from 'next/server';
import { adminDb } from '../../../config/firebase-admin';
import { verifyAuthToken } from '../../../lib/auth';

export async function GET(request) {
  try {
    // Try to get userId from query parameters first (for compatibility)
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    
    // If no userId in query params, try Authorization header
    if (!userId) {
      const token = request.headers.get('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return NextResponse.json({ error: 'User ID or Authorization token required' }, { status: 401 });
      }
      
      const decodedToken = await verifyAuthToken(token);
      userId = decodedToken.uid;
    }

    const profileRef = adminDb.collection('users').doc(userId);
    const profileDoc = await profileRef.get();

    if (!profileDoc.exists) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      profile: profileDoc.data()
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const decodedToken = await verifyAuthToken(token);
    const userId = decodedToken.uid;

    const data = await request.json();

    const profileRef = adminDb.collection('users').doc(userId);
    const profileData = {
      ...data,
      uid: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await profileRef.set(profileData, { merge: true });

    return NextResponse.json({
      profile: profileData
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Try to get userId from query parameters first (for compatibility)
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    
    // If no userId in query params, try Authorization header
    if (!userId) {
      const token = request.headers.get('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return NextResponse.json({ error: 'User ID or Authorization token required' }, { status: 401 });
      }
      
      const decodedToken = await verifyAuthToken(token);
      userId = decodedToken.uid;
    }

    const data = await request.json();

    const profileRef = adminDb.collection('users').doc(userId);
    
    // Check if profile exists and belongs to user
    const profileDoc = await profileRef.get();
    if (profileDoc.exists && profileDoc.data().uid !== userId) {
      return NextResponse.json({ error: 'Unauthorized to update this profile' }, { status: 403 });
    }

    const updatedData = {
      ...data,
      uid: userId,
      updatedAt: new Date()
    };

    await profileRef.set(updatedData, { merge: true });

    return NextResponse.json({
      profile: updatedData
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const decodedToken = await verifyAuthToken(token);
    const userId = decodedToken.uid;

    const profileRef = adminDb.collection('users').doc(userId);
    const profileDoc = await profileRef.get();

    if (!profileDoc.exists) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profileDoc.data().uid !== userId) {
      return NextResponse.json({ error: 'Unauthorized to delete this profile' }, { status: 403 });
    }

    await profileRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    );
  }
}
