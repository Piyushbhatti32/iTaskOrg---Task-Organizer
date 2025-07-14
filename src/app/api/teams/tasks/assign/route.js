import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { 
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

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
    const data = await request.json();
    const { 
      teamId, 
      memberId, 
      leaderId,
      title,
      description,
      deadline,
      priority = 'medium'
    } = data;

    if (!teamId || !memberId || !leaderId) {
      return NextResponse.json({ 
        error: 'Team ID, member ID, and leader ID are required' 
      }, { status: 400 });
    }

    const errors = validateTaskData({ title, deadline });
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
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
        error: 'Only team leader can assign tasks' 
      }, { status: 403 });
    }

    // Verify member exists in team
    const memberRef = doc(db, 'teams', teamId, 'members', memberId);
    const memberDoc = await getDoc(memberRef);

    if (!memberDoc.exists()) {
      return NextResponse.json({ 
        error: 'Member not found in team' 
      }, { status: 404 });
    }

    // Create task in team's tasks subcollection
    const taskRef = doc(collection(db, 'teams', teamId, 'tasks'));
    const taskData = {
      title,
      description: description || '',
      deadline,
      priority,
      assignedTo: memberId,
      assignedBy: leaderId,
      status: 'pending', // pending, accepted, rejected, completed
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(taskRef, taskData);

    // Create notification for the assigned member
    const notificationRef = doc(collection(db, 'notifications'));
    await setDoc(notificationRef, {
      userId: memberId,
      type: 'task_assigned',
      teamId,
      teamName: teamData.name,
      taskId: taskRef.id,
      taskTitle: title,
      status: 'unread',
      createdAt: serverTimestamp()
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