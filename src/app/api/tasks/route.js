import { adminDb } from '../../../config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

// GET - Fetch tasks for a user
export async function GET(request) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    // Get userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'User ID is required' 
      }), { status: 400 });
    }

    console.log('Fetching tasks for user:', userId);

    // Fetch tasks from Firestore using Admin SDK
    const tasksRef = adminDb.collection('tasks');
    const snapshot = await tasksRef
      .where('assignedTo', '==', userId)
      .get();

    const tasks = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to ISO strings
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
        completedAt: doc.data().completedAt?.toDate?.()?.toISOString() || doc.data().completedAt
      }))
      // Sort by createdAt in descending order (newest first)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

    console.log('Found', tasks.length, 'tasks for user:', userId);

    return new Response(JSON.stringify({ tasks }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    return new Response(JSON.stringify({ 
      error: 'Error fetching tasks',
      details: error.message 
    }), { status: 500 });
  }
}

// POST - Create a new task
export async function POST(request) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    const taskData = await request.json();
    const { userId, ...rest } = taskData;

    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'User ID is required' 
      }), { status: 400 });
    }

    if (!taskData.title?.trim()) {
      return new Response(JSON.stringify({ 
        error: 'Task title is required' 
      }), { status: 400 });
    }

    console.log('Creating task for user:', userId);

    // Generate a unique task ID
    const taskId = uuidv4();

    const newTask = {
      id: taskId,
      title: taskData.title.trim(),
      description: taskData.description || '',
      dueDate: taskData.dueDate || null,
      priority: taskData.priority || 'medium',
      category: taskData.category || '',
      schedule: {
        time: taskData.schedule?.time || null,
        reminder: taskData.schedule?.reminder || false
      },
      assignedUsers: Array.isArray(taskData.assignedUsers) ? taskData.assignedUsers : [],
      assignedTo: userId,
      completed: false,
      completedAt: null,
      subtasks: taskData.subtasks || [],
      completedPomodoros: 0,
      status: taskData.status || 'pending',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    // Save to Firestore using Admin SDK
    const taskRef = adminDb.collection('tasks').doc(taskId);
    await taskRef.set(newTask);

    console.log('Task created successfully:', taskId);

    // Return the created task with converted timestamps
    const createdTask = {
      ...newTask,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return new Response(JSON.stringify({
      message: 'Task created successfully',
      task: createdTask,
      success: true
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error creating task:', error);
    return new Response(JSON.stringify({ 
      error: 'Error creating task',
      details: error.message,
      success: false
    }), { status: 500 });
  }
}

// PUT - Update a task
export async function PUT(request) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    const taskData = await request.json();
    const { id: taskId, ...updateData } = taskData;

    console.log('🔄 PUT /api/tasks - Received request');
    console.log('📋 Task ID:', taskId);
    console.log('📝 Update data:', updateData);

    if (!taskId) {
      console.error('❌ No task ID provided');
      return new Response(JSON.stringify({ 
        error: 'Task ID is required' 
      }), { status: 400 });
    }

    console.log('🔍 Searching for task in Firestore:', taskId);

    // Update task in Firestore using Admin SDK
    const taskRef = adminDb.collection('tasks').doc(taskId);
    
    // Check if task exists
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) {
      console.error('❌ Task not found in Firestore:', taskId);
      
      // Let's also check what tasks exist for debugging
      const allTasksSnapshot = await adminDb.collection('tasks').limit(10).get();
      const existingTaskIds = allTasksSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        assignedTo: doc.data().assignedTo
      }));
      
      console.log('📋 Existing tasks in Firestore (first 10):', existingTaskIds);
      
      return new Response(JSON.stringify({ 
        error: 'Task not found',
        requestedTaskId: taskId,
        existingTasks: existingTaskIds
      }), { status: 404 });
    }

    console.log('✅ Task found in Firestore');
    console.log('📄 Current task data:', {
      id: taskDoc.id,
      title: taskDoc.data().title,
      completed: taskDoc.data().completed,
      assignedTo: taskDoc.data().assignedTo
    });

    // Update the task
    const updatedData = {
      ...updateData,
      updatedAt: FieldValue.serverTimestamp()
    };

    console.log('🔄 Applying update to Firestore...');
    await taskRef.update(updatedData);

    console.log('✅ Task updated successfully in Firestore:', taskId);

    // Get the updated task data
    const updatedTaskDoc = await taskRef.get();
    const updatedTaskData = {
      id: taskId,
      ...updatedTaskDoc.data(),
      createdAt: updatedTaskDoc.data().createdAt?.toDate?.()?.toISOString() || updatedTaskDoc.data().createdAt,
      updatedAt: updatedTaskDoc.data().updatedAt?.toDate?.()?.toISOString() || updatedTaskDoc.data().updatedAt,
      completedAt: updatedTaskDoc.data().completedAt?.toDate?.()?.toISOString() || updatedTaskDoc.data().completedAt
    };

    console.log('📄 Updated task data:', {
      id: updatedTaskData.id,
      title: updatedTaskData.title,
      completed: updatedTaskData.completed,
      completedAt: updatedTaskData.completedAt
    });

    return new Response(JSON.stringify({
      message: 'Task updated successfully',
      task: updatedTaskData,
      success: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ Error updating task:', error);
    console.error('🔍 Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: 'Error updating task',
      details: error.message,
      success: false
    }), { status: 500 });
  }
}
