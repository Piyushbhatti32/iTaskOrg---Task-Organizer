import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

// Helper function to validate team data
function validateTeamData(data) {
  const errors = [];
  
  if (!data.name?.trim()) {
    errors.push('Team name is required');
  }
  
  if (!data.description?.trim()) {
    errors.push('Team description is required');
  }
  
  return errors;
}

// GET /api/teams - Get all teams for the current user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('members', 'array-contains', userId));
    const querySnapshot = await getDocs(q);

    const teams = [];
    querySnapshot.forEach((doc) => {
      teams.push({
        id: doc.id,
        ...doc.data()
      });
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
    const { name, description, leaderId } = data;

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
      members: [leaderId], // Leader is automatically a member
      tasks: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const teamsRef = collection(db, 'teams');
    const docRef = await addDoc(teamsRef, teamData);

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

    if (!id) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const errors = validateTeamData({ name, description });
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const teamRef = doc(db, 'teams', id);
    const teamDoc = await getDoc(teamRef);

    if (!teamDoc.exists()) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const updateData = {
      name,
      description,
      updatedAt: serverTimestamp()
    };

    await updateDoc(teamRef, updateData);

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
    const leaderId = searchParams.get('leaderId');

    if (!id) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    if (!leaderId) {
      return NextResponse.json({ error: 'Leader ID is required' }, { status: 400 });
    }

    const teamRef = doc(db, 'teams', id);
    const teamDoc = await getDoc(teamRef);

    if (!teamDoc.exists()) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Verify that the requester is the team leader
    const teamData = teamDoc.data();
    if (teamData.leaderId !== leaderId) {
      return NextResponse.json({ error: 'Only team leader can delete the team' }, { status: 403 });
    }

    await deleteDoc(teamRef);

    return NextResponse.json({
      message: 'Team deleted successfully',
      id
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
} 