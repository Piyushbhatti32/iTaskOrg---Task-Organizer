import { NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { getAuthenticatedUser } from '@/lib/auth';
import { FieldValue } from 'firebase-admin/firestore';

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// POST /api/teams/invite - Invite a user to a team
export async function POST(request) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is verified
    if (!user.email_verified) {
      return NextResponse.json({ 
        error: 'Email verification required' 
      }, { status: 403 });
    }

    const data = await request.json();
    const { teamId, email } = data;

    if (!teamId || !email) {
      return NextResponse.json({ 
        error: 'Team ID and email are required' 
      }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }

    // Verify team exists and requester is leader
    const teamDoc = await adminDb.collection('teams').doc(teamId).get();

    if (!teamDoc.exists) {
      return NextResponse.json({ 
        error: 'Team not found' 
      }, { status: 404 });
    }

    const teamData = teamDoc.data();
    if (teamData.leaderId !== user.uid) {
      return NextResponse.json({ 
        error: 'Only team leader can invite members' 
      }, { status: 403 });
    }

    // Check if user with email exists
    const userSnapshot = await adminDb.collection('users')
      .where('email', '==', email)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json({ 
        error: 'User with this email does not exist' 
      }, { status: 404 });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // Check if user is already a member
    const memberDoc = await adminDb.collection('teams')
      .doc(teamId)
      .collection('members')
      .doc(userId)
      .get();

    if (memberDoc.exists) {
      return NextResponse.json({ 
        error: 'User is already a team member' 
      }, { status: 400 });
    }

    // Add user as team member
    await adminDb.collection('teams')
      .doc(teamId)
      .collection('members')
      .doc(userId)
      .set({
        email: userData.email,
        name: userData.name || '',
        role: 'member',
        joinedAt: FieldValue.serverTimestamp()
      });

    // Create notification for the invited user
    await adminDb.collection('notifications').add({
      userId,
      type: 'team_invite',
      teamId,
      teamName: teamData.name,
      status: 'unread',
      createdAt: FieldValue.serverTimestamp()
    });

    return NextResponse.json({
      message: 'Team invitation sent successfully',
      memberId: userId
    });
  } catch (error) {
    console.error('Error inviting team member:', error);
    return NextResponse.json({ 
      error: 'Failed to send team invitation' 
    }, { status: 500 });
  }
}
