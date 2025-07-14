import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { 
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// POST /api/teams/invite - Invite a user to a team
export async function POST(request) {
  try {
    const data = await request.json();
    const { teamId, email, leaderId } = data;

    if (!teamId || !email || !leaderId) {
      return NextResponse.json({ 
        error: 'Team ID, email, and leader ID are required' 
      }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }

    // Verify team exists and requester is leader
    const teamRef = doc(db, 'teams', teamId);
    const teamDoc = await getDoc(teamRef);

    if (!teamDoc.exists()) {
      return NextResponse.json({ 
        error: 'Team not found' 
      }, { status: 404 });
    }

    const teamData = teamDoc.data();
    if (teamData.leaderId !== leaderId) {
      return NextResponse.json({ 
        error: 'Only team leader can invite members' 
      }, { status: 403 });
    }

    // Check if user with email exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const userSnapshot = await getDocs(q);

    if (userSnapshot.empty) {
      return NextResponse.json({ 
        error: 'User with this email does not exist' 
      }, { status: 404 });
    }

    const userData = userSnapshot.docs[0].data();
    const userId = userSnapshot.docs[0].id;

    // Check if user is already a member
    const memberRef = doc(db, 'teams', teamId, 'members', userId);
    const memberDoc = await getDoc(memberRef);

    if (memberDoc.exists()) {
      return NextResponse.json({ 
        error: 'User is already a team member' 
      }, { status: 400 });
    }

    // Add user as team member
    await setDoc(memberRef, {
      email: userData.email,
      name: userData.name || '',
      role: 'member',
      joinedAt: serverTimestamp()
    });

    // Create notification for the invited user
    const notificationRef = doc(collection(db, 'notifications'));
    await setDoc(notificationRef, {
      userId,
      type: 'team_invite',
      teamId,
      teamName: teamData.name,
      status: 'unread',
      createdAt: serverTimestamp()
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