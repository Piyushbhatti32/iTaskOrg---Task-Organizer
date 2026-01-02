import { NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { getAuthenticatedUser } from '@/lib/auth';
import { FieldValue } from 'firebase-admin/firestore';

// POST /api/teams/invite/respond - Respond to a team invitation (accept/decline)
export async function POST(request) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { invitationId, response } = data; // response: 'accept' or 'decline'

    if (!invitationId || !response) {
      return NextResponse.json({ 
        error: 'Invitation ID and response are required' 
      }, { status: 400 });
    }

    if (!['accept', 'decline'].includes(response)) {
      return NextResponse.json({ 
        error: 'Response must be either "accept" or "decline"' 
      }, { status: 400 });
    }

    // Find the invitation
    const invitationDoc = await adminDb.collection('team_invitations').doc(invitationId).get();

    if (!invitationDoc.exists) {
      return NextResponse.json({ 
        error: 'Invitation not found' 
      }, { status: 404 });
    }

    const invitationData = invitationDoc.data();

    // Verify user is the invited user
    if (invitationData.invitedUserId !== user.uid) {
      return NextResponse.json({ 
        error: 'You can only respond to your own invitations' 
      }, { status: 403 });
    }

    // Check if invitation is still pending
    if (invitationData.status !== 'pending') {
      return NextResponse.json({ 
        error: 'This invitation has already been responded to' 
      }, { status: 400 });
    }

    // Update invitation status
    await adminDb.collection('team_invitations').doc(invitationId).update({
      status: response,
      respondedAt: FieldValue.serverTimestamp()
    });

    if (response === 'accept') {
      // Add user to team members
      const teamRef = adminDb.collection('teams').doc(invitationData.teamId);
      const teamDoc = await teamRef.get();

      if (teamDoc.exists) {
        // Add user to the team's members object
        await teamRef.update({
          [`members.${user.uid}`]: {
            role: 'member',
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            joinedAt: FieldValue.serverTimestamp()
          },
          memberCount: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp()
        });

        // Create notification for team leader
        await adminDb.collection('notifications').add({
          userId: invitationData.teamLeaderId,
          type: 'team_invite_accepted',
          teamId: invitationData.teamId,
          teamName: invitationData.teamName,
          memberName: user.displayName || user.email.split('@')[0],
          message: `${user.displayName || user.email.split('@')[0]} has joined your team "${invitationData.teamName}"`,
          status: 'unread',
          createdAt: FieldValue.serverTimestamp()
        });

        return NextResponse.json({
          message: 'Team invitation accepted successfully. You are now a member of the team!',
          teamId: invitationData.teamId,
          teamName: invitationData.teamName
        });
      } else {
        // Team no longer exists
        return NextResponse.json({ 
          error: 'The team no longer exists' 
        }, { status: 404 });
      }
    } else {
      // Invitation declined
      // Create notification for team leader
      await adminDb.collection('notifications').add({
        userId: invitationData.teamLeaderId,
        type: 'team_invite_declined',
        teamId: invitationData.teamId,
        teamName: invitationData.teamName,
        memberName: user.displayName || user.email.split('@')[0],
        message: `${user.displayName || user.email.split('@')[0]} has declined to join your team "${invitationData.teamName}"`,
        status: 'unread',
        createdAt: FieldValue.serverTimestamp()
      });

      return NextResponse.json({
        message: 'Team invitation declined.',
        teamName: invitationData.teamName
      });
    }
  } catch (error) {
    console.error('Error responding to team invitation:', error);
    return NextResponse.json({ 
      error: 'Failed to respond to team invitation' 
    }, { status: 500 });
  }
}
