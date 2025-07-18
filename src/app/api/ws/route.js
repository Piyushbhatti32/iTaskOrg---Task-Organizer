import { NextResponse } from 'next/server';

// Simple REST API for team communications
// In production, consider using Socket.IO or similar for real-time features

// Mock data stores (in production, use a real database)
const presenceStore = new Map();
const messagesStore = new Map();

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
      const presence = presenceStore.get(userId) || { status: 'offline' };
      return NextResponse.json({ presence });
    }

    // Return all team member presence
    const teamPresence = {};
    presenceStore.forEach((presence, id) => {
      if (presence.teams && presence.teams.includes(teamId)) {
        teamPresence[id] = presence;
      }
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
      lastSeen: new Date().toISOString()
    };

    presenceStore.set(userId, presenceData);

    return NextResponse.json({ success: true, presence: presenceData });
  } catch (error) {
    console.error('Error updating presence:', error);
    return new Response('Failed to update presence', { status: 500 });
  }
}
