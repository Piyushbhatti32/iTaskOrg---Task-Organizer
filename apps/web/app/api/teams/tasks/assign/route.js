import { NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getAuthenticatedUser } from '@/lib/auth';

// Helper function to validate task data
function validateTaskData(data) {
  const errors = [];
  
  if (!data.title?.trim()) {
    errors.push('Task title is required');
  }
  
  if (!data.deadline) {
    errors.push('Task deadline is required');
  } else {
    const deadline = new Date(data.deadline);
    if (isNaN(deadline.getTime())) {
      errors.push('Invalid deadline format');
    } else if (deadline < new Date()) {
      errors.push('Deadline cannot be in the past');
    }
  }
  
  return errors;
}

// POST /api/teams/tasks/assign - Assign a task to a team member
export async function POST(request) {
  try {
    // Authenticate user first
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { 
      teamId, 
      memberId,
      title,
      description,
      deadline,
      priority = 'medium'
    } = data;

    if (!teamId || !memberId) {
      return NextResponse.json({ 
        error: 'Team ID and member ID are required' 
      }, { status: 400 });
    }

    const errors = validateTaskData({ title, deadline });
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Verify team exists and authenticated user is leader
    const teamDoc = await adminDb.collection('teams').doc(teamId).get();

    if (!teamDoc.exists) {
      return NextResponse.json({ 
        error: 'Team not found' 
      }, { status: 404 });
    }

    const teamData = teamDoc.data();
    if (teamData.leaderId !== user.uid) {
      return NextResponse.json({ 
        error: 'Only team leader can assign tasks' 
      }, { status: 403 });
    }

    // Verify member exists in team
    const memberDoc = await adminDb.collection('teams').doc(teamId)
      .collection('members').doc(memberId).get();

    if (!memberDoc.exists) {
      return NextResponse.json({ 
        error: 'Member not found in team' 
      }, { status: 404 });
    }

    // Create task in team's tasks subcollection
    const taskRef = adminDb.collection('teams').doc(teamId).collection('tasks').doc();
    const taskData = {
      title,
      description: description || '',
      deadline,
      priority,
      assignedTo: memberId,
      assignedBy: user.uid,
      status: 'pending', // pending, accepted, rejected, completed
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await taskRef.set(taskData);

    // Create notification for the assigned member
    const notificationRef = adminDb.collection('notifications').doc();
    await notificationRef.set({
      userId: memberId,
      type: 'task_assigned',
      teamId,
      teamName: teamData.name,
      taskId: taskRef.id,
      taskTitle: title,
      status: 'unread',
      createdAt: FieldValue.serverTimestamp()
    });

    return NextResponse.json({
      message: 'Task assigned successfully',
      taskId: taskRef.id,
      ...taskData
    });
  } catch (error) {
    console.error('Error assigning task:', error);
    return NextResponse.json({ 
      error: 'Failed to assign task' 
    }, { status: 500 });
  }
}
