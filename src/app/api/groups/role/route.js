import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase';
import { getGroup, updateGroup } from '@/utils/db';

/**
 * Update member role in a group
 * POST /api/groups/role
 */
export async function POST(request) {
  try {
    const { groupId, targetUserId, action } = await request.json();
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['promote', 'demote'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "promote" or "demote"' },
        { status: 400 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get group details
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

    // Check if target user is a member
    if (!group.members[targetUserId]) {
      return NextResponse.json(
        { error: 'Target user is not a member' },
        { status: 404 }
      );
    }

    // Prevent self-demotion
    if (userId === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot modify your own role' },
        { status: 400 }
      );
    }

    // Update member role
    const newRole = action === 'promote' ? 'admin' : 'member';
    const updateData = {
      [`members.${targetUserId}.role`]: newRole
    };

    await updateGroup(groupId, updateData);

    return NextResponse.json({
      userId: targetUserId,
      role: newRole
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    );
  }
} 