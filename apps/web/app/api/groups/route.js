import { NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * Create a new group
 * POST /api/groups
 */
export async function POST(request) {
  try {
    const { name, description, members = [] } = await request.json();
    
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!user.email_verified) {
      return NextResponse.json(
        { error: 'Email verification required' },
        { status: 403 }
      );
    }

    const userId = user.uid;
    
    // Create group with creator as admin
    const groupMembers = {
      [userId]: {
        role: 'admin',
        joinedAt: FieldValue.serverTimestamp()
      }
    };
    
    // Add invited members
    members.forEach(member => {
      // Use email as key if no ID is provided, or generate a unique key
      const memberKey = member.id && member.id !== userId ? member.id : `email_${member.email}`;
      if (memberKey !== userId) { // Don't add creator twice
        groupMembers[memberKey] = {
          email: member.email,
          name: member.name,
          role: member.role || 'member',
          joinedAt: FieldValue.serverTimestamp(),
          invitedBy: userId
        };
      }
    });
    
    const groupData = {
      name,
      description,
      createdBy: userId,
      members: groupMembers,
      settings: {
        isPrivate: false,
        allowMemberInvites: true
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    const groupRef = adminDb.collection('groups').doc();
    await groupRef.set(groupData);

    return NextResponse.json({
      id: groupRef.id,
      ...groupData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}

/**
 * Get group details
 * GET /api/groups?id=groupId
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('id');
    
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.uid;

    const groupDoc = await adminDb.collection('groups').doc(groupId).get();
    
    if (!groupDoc.exists) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    
    const group = { id: groupDoc.id, ...groupDoc.data() };

    // Check if user is a member
    if (!group.members[userId]) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error getting group:', error);
    return NextResponse.json(
      { error: 'Failed to get group' },
      { status: 500 }
    );
  }
}

/**
 * Update group details
 * PATCH /api/groups?id=groupId
 */
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('id');
    const { name, description, settings } = await request.json();
    
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.uid;

    const groupDoc = await adminDb.collection('groups').doc(groupId).get();
    
    if (!groupDoc.exists) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    
    const group = { id: groupDoc.id, ...groupDoc.data() };

    // Check if user is an admin
    if (!group.members[userId] || group.members[userId].role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(settings && { settings }),
      updatedAt: FieldValue.serverTimestamp()
    };

    await adminDb.collection('groups').doc(groupId).update(updateData);

    return NextResponse.json({
      id: groupId,
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

/**
 * Delete group
 * DELETE /api/groups?id=groupId
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('id');
    
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.uid;

    const groupDoc = await adminDb.collection('groups').doc(groupId).get();
    
    if (!groupDoc.exists) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    
    const group = { id: groupDoc.id, ...groupDoc.data() };

    // Check if user is an admin
    if (!group.members[userId] || group.members[userId].role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    await adminDb.collection('groups').doc(groupId).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
} 