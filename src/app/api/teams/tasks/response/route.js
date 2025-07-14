import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { 
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  serverTimestamp
} from 'firebase/firestore';

// POST /api/teams/tasks/response - Accept or reject a task
export async function POST(request) {
  try {
    const data = await request.json();
    const { 
      teamId, 
      taskId, 
      memberId,
      response, // 'accept' or 'reject'
      reason, // Required if rejecting
      suggestedReassignment // Optional member ID for reassignment
    } = data;

    if (!teamId || !taskId || !memberId || !response) {
      return NextResponse.json({ 
        error: 'Team ID, task ID, member ID, and response are required' 
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
    const teamRef = doc(db, 'teams', teamId);
    const teamDoc = await getDoc(teamRef);

    if (!teamDoc.exists()) {
      return NextResponse.json({ 
        error: 'Team not found' 
      }, { status: 404 });
    }

    const teamData = teamDoc.data();

    // Verify task exists and is assigned to the member
    const taskRef = doc(db, 'teams', teamId, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
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
      const suggestedMemberRef = doc(db, 'teams', teamId, 'members', suggestedReassignment);
      const suggestedMemberDoc = await getDoc(suggestedMemberRef);

      if (!suggestedMemberDoc.exists()) {
        return NextResponse.json({ 
          error: 'Suggested member not found in team' 
        }, { status: 404 });
      }
    }

    // Update task status
    const updateData = {
      status: response === 'accept' ? 'accepted' : 'rejected',
      updatedAt: serverTimestamp()
    };

    if (response === 'reject') {
      updateData.rejectionReason = reason;
      if (suggestedReassignment) {
        updateData.suggestedReassignment = suggestedReassignment;
      }
    }

    await updateDoc(taskRef, updateData);

    // Create notification for the team leader
    const notificationRef = doc(collection(db, 'notifications'));
    await setDoc(notificationRef, {
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
      createdAt: serverTimestamp()
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