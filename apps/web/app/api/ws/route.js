import { NextResponse } from 'next/server';
import { adminDb } from '../../../config/firebase-admin';

// Team communications API with Firebase backend

// Get user presence
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const userId = searchParams.get('userId');
    
    if (!teamId) {
      return new Response('Team ID is required', { status: 400 });
    }

    // Return team presence or specific user presence
    if (userId) {
      const presenceDoc = await adminDb.collection('presence').doc(userId).get();
      const presence = presenceDoc.exists ? presenceDoc.data() : { status: 'offline' };
      return NextResponse.json({ presence });
    }

    // Return all team member presence
    const presenceQuery = adminDb.collection('presence')
      .where('teams', 'array-contains', teamId);
    
    const presenceSnapshot = await presenceQuery.get();
    const teamPresence = {};
    
    presenceSnapshot.docs.forEach(doc => {
      teamPresence[doc.id] = doc.data();
    });

    return NextResponse.json({ teamPresence });
  } catch (error) {
    console.error('Error fetching presence:', error);
    return new Response('Failed to fetch presence', { status: 500 });
  }
}

// Update user presence
export async function POST(request) {
  try {
    const { userId, teamIds, status } = await request.json();
    
    if (!userId || !teamIds || !status) {
      return new Response('Missing required fields', { status: 400 });
    }

    const presenceData = {
      userId,
      teams: teamIds,
      status,
      lastSeen: new Date()
    };

    // Update presence in Firestore
    await adminDb.collection('presence').doc(userId).set(presenceData, { merge: true });

    return NextResponse.json({ success: true, presence: presenceData });
  } catch (error) {
    console.error('Error updating presence:', error);
    return new Response('Failed to update presence', { status: 500 });
  }
}
