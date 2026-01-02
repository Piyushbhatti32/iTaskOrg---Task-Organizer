import { NextResponse } from 'next/server';
import { getFirebaseAuth } from "@/lib/firebase-client";
import { getGroup, getTask, createTask } from '@/utils/db';

/**
 * Share a task with a group
 * POST /api/groups/tasks/share
 */

const auth = getFirebaseAuth();

export async function POST(request) {
  try {
    const { groupId, taskId } = await request.json();
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get group details
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

    // Get original task
    const task = await getTask(taskId);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check if user owns the task or is assigned to it
    if (task.createdBy !== userId && task.assignedTo !== userId) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Create a new task in the group
    const sharedTaskData = {
      title: task.title,
      description: task.description,
      status: 'pending',
      priority: task.priority,
      createdBy: userId,
      assignedTo: null, // Unassigned in group
      groupId, // Associate with group
      parentTaskId: taskId, // Reference original task
      tags: [...(task.tags || []), 'shared'],
      attachments: task.attachments || []
    };

    const sharedTaskRef = await createTask(sharedTaskData);

    return NextResponse.json({
      id: sharedTaskRef.id,
      ...sharedTaskData
    });
  } catch (error) {
    console.error('Error sharing task:', error);
    return NextResponse.json(
      { error: 'Failed to share task' },
      { status: 500 }
    );
  }
} 