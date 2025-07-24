import { NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { getAuthenticatedUser } from '@/lib/auth';
import { FieldValue } from 'firebase-admin/firestore';

// Helper function to validate team data
function validateTeamData(data) {
  const errors = [];
  
  if (!data.name?.trim()) {
    errors.push('Team name is required');
  }
  
  // Description is optional, so we don't validate it as required
  
  return errors;
}

// GET /api/teams - Get all teams for the current user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user = await getAuthenticatedUser(request);
    const userId = user?.uid;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const teamsRef = adminDb.collection('teams');
    // Query for teams where user is either a member or leader
    const memberQuery = teamsRef.where(`members.${userId}`, '!=', null);
    const leaderQuery = teamsRef.where('leaderId', '==', userId);
    
    const [memberSnapshot, leaderSnapshot] = await Promise.all([
      memberQuery.get(),
      leaderQuery.get()
    ]);
    
    const teamIds = new Set();
    const teams = [];

    // Process member teams
    memberSnapshot.forEach((doc) => {
      if (!teamIds.has(doc.id)) {
        teamIds.add(doc.id);
        teams.push({
          id: doc.id,
          ...doc.data()
        });
      }
    });
    
    // Process leader teams
    leaderSnapshot.forEach((doc) => {
      if (!teamIds.has(doc.id)) {
        teamIds.add(doc.id);
        teams.push({
          id: doc.id,
          ...doc.data()
        });
      }
    });

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error getting teams:', error);
    return NextResponse.json({ error: 'Failed to get teams' }, { status: 500 });
  }
}

// POST /api/teams - Create a new team
export async function POST(request) {
  try {
    const data = await request.json();
    const user = await getAuthenticatedUser(request);
    const leaderId = user?.uid;
    const { name, description } = data;

    if (!leaderId) {
      return NextResponse.json({ error: 'Leader ID is required' }, { status: 400 });
    }

    const errors = validateTeamData({ name, description });
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const teamData = {
      name,
      description,
      leaderId,
      tasks: [],
      members: {
        [leaderId]: {
          role: 'leader',
          joinedAt: FieldValue.serverTimestamp()
        }
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    const teamsRef = adminDb.collection('teams');
    const docRef = await teamsRef.add(teamData);

    return NextResponse.json({
      id: docRef.id,
      ...teamData
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}

// PATCH /api/teams - Update a team
export async function PATCH(request) {
  try {
    const data = await request.json();
    const { id, name, description } = data;
    const user = await getAuthenticatedUser(request);

    if (!id) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const errors = validateTeamData({ name, description });
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const teamRef = adminDb.collection('teams').doc(id);
    const teamDoc = await teamRef.get();

    if (!teamDoc.exists) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const updateData = {
      name,
      description,
      updatedAt: FieldValue.serverTimestamp()
    };

    await teamRef.update(updateData);

    return NextResponse.json({
      id,
      ...updateData
    });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}

// DELETE /api/teams - Delete a team
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const user = await getAuthenticatedUser(request);
    const leaderId = user?.uid;

    if (!id) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    if (!leaderId) {
      return NextResponse.json({ error: 'Leader ID is required' }, { status: 400 });
    }

    const teamRef = adminDb.collection('teams').doc(id);
    const teamDoc = await teamRef.get();

    if (!teamDoc.exists) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Verify that the requester is the team leader
    const teamData = teamDoc.data();
    if (teamData.leaderId !== leaderId) {
      return NextResponse.json({ error: 'Only team leader can delete the team' }, { status: 403 });
    }

    await teamRef.delete();

    return NextResponse.json({
      message: 'Team deleted successfully',
      id
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
} 