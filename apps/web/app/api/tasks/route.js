import { adminDb } from '../../../config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { 
  createErrorResponse, 
  successResponse,
  validateQueryParams,
  parseRequestBody,
  validateRequestBody,
  ErrorCategory 
} from '@/lib/api-error-handler';
import { NextResponse } from 'next/server';

// GET - Fetch tasks for a user
export async function GET(request) {
  try {
    if (!adminDb) {
      const [response, status] = createErrorResponse(
        new Error('Firebase Admin SDK not initialized'),
        ErrorCategory.SERVER
      );
      return NextResponse.json(response, { status });
    }

    // Get userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // Validate required parameters
    const validation = validateQueryParams(searchParams, ['userId']);
    if (!validation.valid) {
      const [response, status] = createErrorResponse(
        new Error(`Missing required parameters: ${validation.missing?.join(', ')}`),
        ErrorCategory.VALIDATION,
        'MISSING_PARAMS'
      );
      return NextResponse.json(response, { status });
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

    return successResponse({ tasks });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    const [response, status] = createErrorResponse(
      error,
      ErrorCategory.SERVER,
      'FETCH_TASKS_ERROR'
    );
    return NextResponse.json(response, { status });
  }
}

// POST - Create a new task
export async function POST(request) {
  try {
    if (!adminDb) {
      const [response, status] = createErrorResponse(
        new Error('Firebase Admin SDK not initialized'),
        ErrorCategory.SERVER
      );
      return NextResponse.json(response, { status });
    }

    // Parse request body
    const bodyResult = await parseRequestBody(request);
    if (!bodyResult.success) {
      const [response, status] = createErrorResponse(
        new Error(bodyResult.error.message),
        ErrorCategory.VALIDATION,
        'INVALID_JSON'
      );
      return NextResponse.json(response, { status });
    }

    const taskData = bodyResult.data;
    const { userId, ...rest } = taskData;

    // Validate required fields
    const validation = validateRequestBody(taskData, ['userId', 'title']);
    if (!validation.valid) {
      const [response, status] = createErrorResponse(
        new Error(`Missing required fields: ${validation.missing?.join(', ')}`),
        ErrorCategory.VALIDATION,
        'MISSING_FIELDS'
      );
      return NextResponse.json(response, { status });
    }

    if (!taskData.title?.trim()) {
      const [response, status] = createErrorResponse(
        new Error('Task title cannot be empty'),
        ErrorCategory.VALIDATION,
        'EMPTY_TITLE'
      );
      return NextResponse.json(response, { status });
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

    return NextResponse.json(
      {
        success: true,
        data: createdTask,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating task:', error);
    const [response, status] = createErrorResponse(
      error,
      ErrorCategory.SERVER,
      'CREATE_TASK_ERROR'
    );
    return NextResponse.json(response, { status });
  }
}

// PUT - Update a task
export async function PUT(request) {
  try {
    if (!adminDb) {
      const [response, status] = createErrorResponse(
        new Error('Firebase Admin SDK not initialized'),
        ErrorCategory.SERVER
      );
      return NextResponse.json(response, { status });
    }

    // Parse request body
    const bodyResult = await parseRequestBody(request);
    if (!bodyResult.success) {
      const [response, status] = createErrorResponse(
        new Error(bodyResult.error.message),
        ErrorCategory.VALIDATION,
        'INVALID_JSON'
      );
      return NextResponse.json(response, { status });
    }

    const taskData = bodyResult.data;
    const { id: taskId, ...updateData } = taskData;

    console.log('🔄 PUT /api/tasks - Received request');
    console.log('📋 Task ID:', taskId);
    console.log('📝 Update data:', updateData);

    if (!taskId) {
      const [response, status] = createErrorResponse(
        new Error('Task ID is required'),
        ErrorCategory.VALIDATION,
        'MISSING_TASK_ID'
      );
      return NextResponse.json(response, { status });
    }

    console.log('🔍 Searching for task in Firestore:', taskId);

    // Update task in Firestore using Admin SDK
    const taskRef = adminDb.collection('tasks').doc(taskId);
    
    // Check if task exists
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) {
      console.error('❌ Task not found in Firestore:', taskId);
      
      const [response, status] = createErrorResponse(
        new Error(`Task with ID "${taskId}" not found`),
        ErrorCategory.NOT_FOUND,
        'TASK_NOT_FOUND'
      );
      return NextResponse.json(response, { status });
    }

    console.log('✅ Task found in Firestore');

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

    return NextResponse.json(
      {
        success: true,
        data: updatedTaskData,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error updating task:', error);
    console.error('🔍 Error stack:', error.stack);
    const [response, status] = createErrorResponse(
      error,
      ErrorCategory.SERVER,
      'UPDATE_TASK_ERROR'
    );
    return NextResponse.json(response, { status });
  }
}
