import { NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebase-admin';
import { getAuthenticatedUser } from '@/lib/auth';

// POST /api/teams/tasks/response - Accept or reject a task
export async function POST(request) {
  try {
    // Authenticate the user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { 
      teamId, 
      taskId, 
      response, // 'accept' or 'reject'
      reason, // Required if rejecting
      suggestedReassignment // Optional member ID for reassignment
    } = data;

    // Use authenticated user's UID as memberId
    const memberId = user.uid;

    if (!teamId || !taskId || !response) {
      return NextResponse.json({ 
        error: 'Team ID, task ID, and response are required' 
      }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(response)) {
      return NextResponse.json({ 
        error: 'Response must be either "accept" or "reject"' 
      }, { status: 400 });
    }

    if (response === 'reject' && !reason?.trim()) {
      return NextResponse.json({ 
        error: 'Reason is required when rejecting a task' 
      }, { status: 400 });
    }

    // Verify team exists
    const teamDoc = await adminDb.collection('teams').doc(teamId).get();

    if (!teamDoc.exists) {
      return NextResponse.json({ 
        error: 'Team not found' 
      }, { status: 404 });
    }

    const teamData = teamDoc.data();

    // Verify task exists and is assigned to the member
    const taskDoc = await adminDb.collection('teams').doc(teamId)
      .collection('tasks').doc(taskId).get();

    if (!taskDoc.exists) {
      return NextResponse.json({ 
        error: 'Task not found' 
      }, { status: 404 });
    }

    const taskData = taskDoc.data();
    if (taskData.assignedTo !== memberId) {
      return NextResponse.json({ 
        error: 'Task is not assigned to this member' 
      }, { status: 403 });
    }

    if (taskData.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Task has already been responded to' 
      }, { status: 400 });
    }

    // If suggesting reassignment, verify member exists in team
    if (suggestedReassignment) {
      const suggestedMemberDoc = await adminDb.collection('teams').doc(teamId)
        .collection('members').doc(suggestedReassignment).get();

      if (!suggestedMemberDoc.exists) {
        return NextResponse.json({ 
          error: 'Suggested member not found in team' 
        }, { status: 404 });
      }
    }

    // Update task status
    const updateData = {
      status: response === 'accept' ? 'accepted' : 'rejected',
      updatedAt: FieldValue.serverTimestamp()
    };

    if (response === 'reject') {
      updateData.rejectionReason = reason;
      if (suggestedReassignment) {
        updateData.suggestedReassignment = suggestedReassignment;
      }
    }

    await adminDb.collection('teams').doc(teamId)
      .collection('tasks').doc(taskId).update(updateData);

    // Create notification for the team leader
    await adminDb.collection('notifications').add({
      userId: teamData.leaderId,
      type: `task_${response}ed`,
      teamId,
      teamName: teamData.name,
      taskId,
      taskTitle: taskData.title,
      memberId,
      reason: response === 'reject' ? reason : undefined,
      suggestedReassignment: response === 'reject' ? suggestedReassignment : undefined,
      status: 'unread',
      createdAt: FieldValue.serverTimestamp()
    });

    return NextResponse.json({
      message: `Task ${response}ed successfully`,
      taskId,
      status: updateData.status
    });
  } catch (error) {
    console.error('Error processing task response:', error);
    return NextResponse.json({ 
      error: 'Failed to process task response' 
    }, { status: 500 });
  }
}
