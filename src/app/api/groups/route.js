import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase';
import { createGroup, getGroup, updateGroup, deleteGroup } from '@/utils/db';

/**
 * Create a new group
 * POST /api/groups
 */
export async function POST(request) {
  try {
    const { name, description } = await request.json();
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    if (!decodedToken.email_verified) {
      return NextResponse.json(
        { error: 'Email verification required' },
        { status: 403 }
      );
    }

    const userId = decodedToken.uid;
    
    // Create group with creator as admin
    const groupData = {
      name,
      description,
      createdBy: userId,
      members: {
        [userId]: {
          role: 'admin',
          joinedAt: new Date().toISOString()
        }
      },
      settings: {
        isPrivate: false,
        allowMemberInvites: true
      }
    };

    const groupRef = await createGroup(groupData);

    return NextResponse.json({
      id: groupRef.id,
      ...groupData
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
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const group = await getGroup(groupId);
    
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

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
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const group = await getGroup(groupId);
    
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

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
      ...(settings && { settings })
    };

    await updateGroup(groupId, updateData);

    return NextResponse.json({
      id: groupId,
      ...updateData
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
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const group = await getGroup(groupId);
    
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if user is an admin
    if (!group.members[userId] || group.members[userId].role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    await deleteGroup(groupId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
} 